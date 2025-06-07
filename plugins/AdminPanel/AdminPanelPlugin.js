/**
 * Admin Panel Plugin for OpenParty
 * Provides a secure web interface for server management
 */
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { exec } = require('child_process');
const archiver = require('archiver'); // Moved to top
const fs = require('fs');
const path = require('path'); // Standard library
const Plugin = require('../../core/classes/Plugin'); // Adjusted path
const Logger = require('../../core/utils/logger'); // Adjusted path

class AdminPanelPlugin extends Plugin {
    constructor() {
        super('AdminPanelPlugin', 'Secure admin panel for server management');
        this.logger = new Logger('AdminPanel');
        this.sessionSecret = process.env.SESSION_SECRET || 'openparty-secure-session';
        
        // Initialize admin password (logger might not be fully initialized with manifest name yet)
        const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
        console.log('[AdminPanelPlugin] Initializing admin password...'); // Use console.log before logger is guaranteed
        console.log(`[AdminPanelPlugin] Using default password: ${!process.env.ADMIN_PASSWORD}`);
        
        // Hash the admin password
        try {
            this.adminPassword = bcrypt.hashSync(plainPassword, 10);
            this.logger.info('Admin password hashed successfully');
        } catch (error) {
            this.logger.error('Failed to hash admin password:', error);
            throw error;
        }
        
        this.backupInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.startTime = Date.now();
        this.stats = {
            activeUsers: 0,
            totalSongs: 0,
            lastBackup: null,
            activePlugins: 0
        };
        
        this.app = null; // To store the Express app instance

        // Initialize stats update interval
        setInterval(() => this.updateStats(), 30000); // Update every 30 seconds
    }

    initroute(app) {
        this.app = app; // Store the Express app instance
        this.logger.info('Initializing admin panel routes...');

        // Body parsing middleware (assuming express.json and express.urlencoded are global)
        // If not, they might need to be added here or in Core.js globally.
        // For this integration, we'll assume they are handled globally.

        // Session middleware - specific to the admin panel
        app.use(session({
            secret: this.sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: { 
                secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }
        }));

        // Serve static files
        app.use('/panel', express.static(path.join(__dirname, 'panel/public')));
        this.logger.info(`Serving static files from: ${path.join(__dirname, 'panel/public')}`);
        
        // Make sure the directory exists
        if (!fs.existsSync(path.join(__dirname, 'panel/public'))) {
            this.logger.error(`Static files directory does not exist: ${path.join(__dirname, 'panel/public')}`);
            fs.mkdirSync(path.join(__dirname, 'panel/public'), { recursive: true });
            this.logger.info(`Created static files directory: ${path.join(__dirname, 'panel/public')}`);
        }

        // Authentication middleware
        const requireAuth = (req, res, next) => {
            if (req.session.authenticated) {
                next();
            } else {
                res.redirect('/panel/login');
            }
        };

        // TODO: Consider implementing rate limiting for login attempts to prevent brute-force attacks.
        // Example: using a middleware like 'express-rate-limit'.
        // Login route
        app.get('/panel/login', (req, res) => {
            res.sendFile(path.join(__dirname, 'panel/public/login.html'));
        });

        app.post('/panel/login', async (req, res) => {
            try {
                this.logger.info('Login attempt received');
                this.logger.info('Request body:', req.body);
                
                const { password } = req.body;
                if (!password) {
                    this.logger.warn('No password provided');
                    return res.redirect('/panel/login?error=1');
                }
                
                this.logger.info('Comparing passwords...');
                const match = await bcrypt.compare(password, this.adminPassword);
                this.logger.info(`Password match result: ${match}`);
                
                if (match) {
                    req.session.authenticated = true;
                    this.logger.info('Login successful');
                    res.redirect('/panel/dashboard');
                } else {
                    this.logger.warn('Invalid password attempt');
                    res.redirect('/panel/login?error=1');
                }
            } catch (error) {
                this.logger.error(`Login error: ${error.message}`);
                this.logger.error(error.stack);
                res.redirect('/panel/login?error=1');
            }
        });

        // Dashboard
        app.get('/panel/dashboard', requireAuth, (req, res) => {
            res.sendFile(path.join(__dirname, 'panel/public/dashboard.html'));
        });

        // Plugin management
        app.get('/panel/api/plugins', requireAuth, (req, res) => {
            const pluginManager = req.app.get('pluginManager');
            const pluginsMap = pluginManager.getPlugins();
            const pluginsArray = Array.from(pluginsMap.values()).map(plugin => ({
                    name: plugin.name,
                    description: plugin.description,
                    enabled: plugin.isEnabled()
                }));
            res.json(pluginsArray);
        });

        app.post('/panel/api/plugins/toggle', requireAuth, (req, res) => {
            try {
                const pluginManager = req.app.get('pluginManager');
                const { pluginName } = req.body; // Changed from 'name' to 'pluginName'
                
                if (!pluginName) {
                    return res.status(400).json({ success: false, message: 'Plugin name (pluginName) is required' });
                }
                
                const plugin = pluginManager.getPlugin(pluginName); // Use getPlugin for direct access
                
                if (!plugin) {
                    return res.status(404).json({ success: false, message: `Plugin ${pluginName} not found` });
                }

                let newStatusMessage;
                if (plugin.isEnabled()) {
                    plugin.disable();
                    newStatusMessage = `Plugin ${pluginName} has been disabled`;
                    this.logger.info(newStatusMessage);
                } else {
                    plugin.enable();
                    newStatusMessage = `Plugin ${pluginName} has been enabled`;
                    this.logger.info(newStatusMessage);
                }
                res.json({ success: true, message: newStatusMessage, enabled: plugin.isEnabled() });

            } catch (error) {
                this.logger.error(`Error toggling plugin: ${error.message}`);
                res.status(500).json({ success: false, message: error.message });
            }
        });

        // Server status endpoint
        app.get('/panel/api/status', requireAuth, (req, res) => {
            const settings = require('../../settings.json');
            let currentVersion = 'N/A';
            try {
                const packageJsonPath = path.join(process.cwd(), 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    currentVersion = packageJson.version;
                }
            } catch (e) { this.logger.error("Failed to read package.json version for status API", e); }
            res.json({
                maintenance: settings.server.serverstatus.isMaintenance,
                uptime: Math.floor((Date.now() - this.startTime) / 1000),
                version: currentVersion
            });
        });

        // Server stats endpoint
        app.get('/panel/api/stats', requireAuth, (req, res) => {
            res.json(this.stats);
        });

        // Server management endpoints
        app.post('/panel/api/update', requireAuth, async (req, res) => {
            try {
                const { stdout, stderr } = await new Promise((resolve, reject) => {
                    exec('git pull && npm install', (error, stdout, stderr) => {
                        if (error) reject(error);
                        else resolve({ stdout, stderr });
                    });
                });
                this.logger.info('Update successful');
                res.json({ message: 'Update successful', output: stdout, details: stderr });
            } catch (error) {
                this.logger.error(`Update error: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/panel/api/restart', requireAuth, (req, res) => {
            res.json({ message: 'Server restarting...' });
            process.exit(42); // Trigger restart through PM2
        });

        app.post('/panel/api/reload-plugins', requireAuth, (req, res) => {
            try {
                const pluginManager = req.app.get('pluginManager');
                pluginManager.loadPlugins(); // No longer needs settings.modules
                this.logger.info('Plugins reloaded via API.');
                res.json({ message: 'Plugins reloaded successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Savedata management
        app.get('/panel/api/savedata', requireAuth, (req, res) => {
            try {
                const savedataPath = path.join(process.cwd(), 'database/data');
                
                if (!fs.existsSync(savedataPath)) {
                    this.logger.error(`Savedata directory does not exist: ${savedataPath}`);
                    return res.status(404).json({ error: 'Savedata directory not found' });
                }
                
                const files = fs.readdirSync(savedataPath)
                    .filter(file => file.endsWith('.json'))
                    .map(file => {
                        const filePath = path.join(savedataPath, file);
                        const stats = fs.statSync(filePath);
                        return {
                            name: file,
                            size: stats.size,
                            modified: stats.mtime
                        };
                    });
                
                res.json(files);
            } catch (error) {
                this.logger.error(`Error getting savedata: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/panel/api/savedata/:type', requireAuth, (req, res) => {
            const { type } = req.params;
            const { data } = req.body;
            try {
                fs.writeFileSync(
                    path.join(process.cwd(), 'database/data', `${type}.json`),
                    JSON.stringify(data, null, 2)
                );
                // Commit changes to Git
                exec(`git add . && git commit -m "Update ${type} savedata" && git push`, {
                    cwd: process.cwd()
                }, (error) => {
                    if (error) {
                        this.logger.error(`Git error: ${error.message}`);
                    }
                });
                res.json({ message: 'Savedata updated successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Backup system
        this.setupAutomaticBackup();
        
        // Get backups list
        app.get('/panel/api/backups', requireAuth, (req, res) => {
            try {
                const backupsPath = path.join(process.cwd(), 'backups');
                
                if (!fs.existsSync(backupsPath)) {
                    this.logger.info(`Backups directory does not exist, creating: ${backupsPath}`);
                    fs.mkdirSync(backupsPath, { recursive: true });
                    return res.json([]);
                }
                
                const backups = fs.readdirSync(backupsPath)
                    .filter(dir => {
                        const dirPath = path.join(backupsPath, dir);
                        return fs.statSync(dirPath).isDirectory();
                    })
                    .map(dir => {
                        const dirPath = path.join(backupsPath, dir);
                        const stats = fs.statSync(dirPath);
                        
                        // Calculate total size of backup
                        let totalSize = 0;
                        const dataPath = path.join(dirPath, 'data');
                        if (fs.existsSync(dataPath)) {
                            const calculateDirSize = (dirPath) => {
                                let size = 0;
                                const files = fs.readdirSync(dirPath);
                                for (const file of files) {
                                    const filePath = path.join(dirPath, file);
                                    const stat = fs.statSync(filePath);
                                    if (stat.isDirectory()) {
                                        size += calculateDirSize(filePath);
                                    } else {
                                        size += stat.size;
                                    }
                                }
                                return size;
                            };
                            totalSize = calculateDirSize(dataPath);
                        }
                        
                        return {
                            filename: dir,
                            date: new Date(dir.replace(/-/g, ':')),
                            size: totalSize,
                            type: 'Auto'
                        };
                    });
                
                // Sort by date (newest first)
                backups.sort((a, b) => b.date - a.date);
                
                res.json(backups);
            } catch (error) {
                this.logger.error(`Error getting backups: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });
        
        // Create backup
        app.post('/panel/api/backup', requireAuth, (req, res) => {
            this.createBackup()
                .then(() => res.json({ success: true, message: 'Backup created successfully' }))
                .catch(error => res.status(500).json({ success: false, error: error.message }));
        });
        
        // Download backup
        app.get('/panel/api/backups/download/:filename', requireAuth, (req, res) => {
            try {
                const { filename } = req.params;
                if (!filename) {
                    return res.status(400).json({ success: false, message: 'Backup filename is required' });
                }
                
                const backupPath = path.join(process.cwd(), 'backups', filename);
                
                if (!fs.existsSync(backupPath)) {
                    this.logger.error(`Backup not found: ${backupPath}`);
                    return res.status(404).json({ success: false, message: 'Backup not found' });
                }
                
                // Create a zip file of the backup
                const zipFilename = `${filename}.zip`;
                const zipPath = path.join(process.cwd(), 'backups', zipFilename);
                
                // Create a write stream for the zip file
                const output = fs.createWriteStream(zipPath);
                const archive = archiver('zip', {
                    zlib: { level: 9 } // Maximum compression
                });
                
                // Listen for all archive data to be written
                output.on('close', () => {
                    this.logger.info(`Backup archive created: ${zipPath} (${archive.pointer()} bytes)`);
                    
                    // Send the zip file
                    res.download(zipPath, zipFilename, (err) => {
                        if (err) {
                            this.logger.error(`Error sending backup: ${err.message}`);
                        }
                        
                        // Delete the temporary zip file after sending
                        fs.unlink(zipPath, (unlinkErr) => {
                            if (unlinkErr) {
                                this.logger.error(`Error deleting temporary zip file: ${unlinkErr.message}`);
                            }
                        });
                    });
                });
                
                // Handle errors
                archive.on('error', (err) => {
                    this.logger.error(`Error creating backup archive: ${err.message}`);
                    res.status(500).json({ success: false, message: `Error creating backup archive: ${err.message}` });
                });
                
                // Pipe archive data to the output file
                archive.pipe(output);
                
                // Add the backup directory to the archive
                archive.directory(backupPath, false);
                
                // Finalize the archive
                archive.finalize();
            } catch (error) {
                this.logger.error(`Error downloading backup: ${error.message}`);
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Delete backup
        app.delete('/panel/api/backups/delete/:filename', requireAuth, (req, res) => {
            try {
                const { filename } = req.params;
                if (!filename) {
                    return res.status(400).json({ success: false, message: 'Backup filename is required' });
                }
                
                const backupPath = path.join(process.cwd(), 'backups', filename);
                
                if (!fs.existsSync(backupPath)) {
                    this.logger.error(`Backup not found: ${backupPath}`);
                    return res.status(404).json({ success: false, message: 'Backup not found' });
                }
                
                // Delete the backup directory recursively
                fs.rmSync(backupPath, { recursive: true, force: true });
                
                this.logger.info(`Backup deleted: ${filename}`);
                res.json({ success: true, message: 'Backup deleted successfully' });
            } catch (error) {
                this.logger.error(`Error deleting backup: ${error.message}`);
                res.status(500).json({ success: false, message: error.message });
            }
        });

        // Check for updates
        app.get('/panel/api/check-updates', requireAuth, async (req, res) => {
            try {
                // Get current version from package.json
                const packagePath = path.join(process.cwd(), 'package.json');
                let currentVersion = '1.0.0';
                
                if (fs.existsSync(packagePath)) {
                    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                    currentVersion = packageJson.version || '1.0.0';
                }
                
                // For demo purposes, we'll simulate checking for updates
                // In a real implementation, you would fetch from a remote repository
                const hasUpdate = Math.random() > 0.5; // Randomly determine if update is available
                
                if (hasUpdate) {
                    // Simulate a newer version
                    const newVersion = currentVersion.split('.')
                        .map((part, index) => index === 2 ? parseInt(part) + 1 : part)
                        .join('.');
                    
                    res.json({
                        available: true,
                        currentVersion,
                        version: newVersion,
                        changelog: 'Bug fixes and performance improvements.'
                    });
                } else {
                    res.json({
                        available: false,
                        currentVersion
                    });
                }
            } catch (error) {
                this.logger.error(`Error checking for updates: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });
        
        // Maintenance mode
        app.post('/panel/api/maintenance', requireAuth, (req, res) => {
            try {
                const settingsPath = path.join(process.cwd(), 'settings.json');
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                
                // Toggle maintenance mode
                settings.server.serverstatus.isMaintenance = !settings.server.serverstatus.isMaintenance;
                
                // Write updated settings back to file
                fs.writeFileSync(
                    settingsPath,
                    JSON.stringify(settings, null, 2)
                );
                
                res.json({ 
                    success: true, 
                    enabled: settings.server.serverstatus.isMaintenance 
                });
            } catch (error) {
                this.logger.error(`Error toggling maintenance mode: ${error.message}`);
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        // Settings endpoint
        app.get('/panel/api/settings', requireAuth, (req, res) => {
            try {
                const settingsPath = path.join(process.cwd(), 'settings.json'); // process.cwd() is the root
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                
                // Return a sanitized version of settings (remove sensitive data if needed)
                res.json({
                    server: {
                        port: settings.server.port,
                        isPublic: settings.server.isPublic,
                        enableSSL: settings.server.enableSSL,
                        domain: settings.server.domain,
                        modName: settings.server.modName,
                        maintenance: settings.server.serverstatus.isMaintenance,
                        channel: settings.server.serverstatus.channel
                    },
                    // Get plugin info from PluginManager and manifests
                    plugins: [] // Placeholder, will be populated below
                });
                const pluginManager = req.app.get('pluginManager');
                if (pluginManager) {
                    const pluginsMap = pluginManager.getPlugins();
                    res.locals.plugins = Array.from(pluginsMap.values()).map(p => ({
                        name: p.manifest.name,
                        description: p.manifest.description,
                        execution: p.manifest.execution,
                        enabled: p.isEnabled(),
                        version: p.manifest.version
                    }));
                }
                res.json(res.locals); // Send the combined data
            } catch (error) {
                this.logger.error(`Error getting settings: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });
        
        app.post('/panel/api/settings', requireAuth, (req, res) => {
            try {
                const { server } = req.body;
                
                if (!server) {
                    return res.status(400).json({ success: false, message: 'Server settings are required' });
                }
                
                const settingsPath = path.join(process.cwd(), 'settings.json');
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                
                // Update only allowed settings
                if (server.port !== undefined) settings.server.port = server.port;
                if (server.isPublic !== undefined) settings.server.isPublic = server.isPublic;
                if (server.enableSSL !== undefined) settings.server.enableSSL = server.enableSSL;
                if (server.domain !== undefined) settings.server.domain = server.domain;
                if (server.modName !== undefined) settings.server.modName = server.modName;
                if (server.maintenance !== undefined) settings.server.serverstatus.isMaintenance = server.maintenance;
                if (server.channel !== undefined) settings.server.serverstatus.channel = server.channel;
                
                // Write updated settings back to file
                fs.writeFileSync(
                    settingsPath,
                    JSON.stringify(settings, null, 2)
                );
                
                res.json({ 
                    success: true, 
                    message: 'Settings updated successfully' 
                });
            } catch (error) {
                this.logger.error(`Error updating settings: ${error.message}`);
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });
        
        // Logs endpoint
        app.get('/panel/api/logs', requireAuth, (req, res) => {
            try {
                const { level = 'all', limit = 100 } = req.query;
                const logsDir = path.join(process.cwd(), 'logs');
                
                // Create logs directory if it doesn't exist
                if (!fs.existsSync(logsDir)) {
                    fs.mkdirSync(logsDir, { recursive: true });
                }
                
                // For demo purposes, generate some sample logs if no log file exists
                const logFile = path.join(logsDir, 'server.log');
                if (!fs.existsSync(logFile)) {
                    const sampleLogs = [
                        '[INFO] Server started successfully',
                        '[INFO] Loaded 3 plugins',
                        '[WARNING] Plugin XYZ is using deprecated API',
                        '[ERROR] Failed to connect to database',
                        '[INFO] User logged in: admin',
                        '[DEBUG] Processing request: GET /api/songs',
                        '[INFO] Request completed in 120ms'
                    ];
                    fs.writeFileSync(logFile, sampleLogs.join('\n'));
                }
                
                // Read log file
                let logs = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);
                
                // Filter by level if specified
                if (level !== 'all') {
                    const levelUpper = level.toUpperCase();
                    logs = logs.filter(log => log.includes(`[${levelUpper}]`));
                }
                
                // Limit number of logs
                logs = logs.slice(-parseInt(limit));
                
                res.json({
                    logs,
                    total: logs.length
                });
            } catch (error) {
                this.logger.error(`Error getting logs: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });
        
        this.logger.info('Admin panel routes initialized');
    }

    async updateStats() {
        try {
            // Update active users (example: count connected clients)
            this.stats.activeUsers = Object.keys(this.app?.io?.sockets?.sockets || global.io?.sockets?.sockets || {}).length; // Prefer app.io if available

            // Update total songs
            const songPath = path.join(process.cwd(), 'database/data/songs.json');
            if (fs.existsSync(songPath)) {
                const songs = JSON.parse(fs.readFileSync(songPath, 'utf8'));
                this.stats.totalSongs = Object.keys(songs).length;
            } else { this.stats.totalSongs = 0; }

            // Update active plugins count
            const pluginManager = this.app?.get('pluginManager');
            if (pluginManager) {
                this.stats.activePlugins = Array.from(pluginManager.getPlugins().values()).filter(p => p.isEnabled()).length;
            }
        } catch (error) {
            this.logger.error(`Stats update error: ${error.message}`);
        }
    }

    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(process.cwd(), 'backups', timestamp);
            fs.mkdirSync(backupDir, { recursive: true });

            // Backup database and savedata
            const dataDir = path.join(process.cwd(), 'database/data');
            fs.cpSync(dataDir, path.join(backupDir, 'data'), { recursive: true });

            // Create Git tag for the backup
            await new Promise((resolve, reject) => {
                exec(`git tag backup-${timestamp} && git push origin backup-${timestamp}`, {
                    cwd: process.cwd()
                }, (error, stdout, stderr) => {
                    if (error) {
                        this.logger.error(`Git tagging/pushing error during backup: ${error.message}`);
                        this.logger.error(`Git stderr: ${stderr}`);
                        reject(error);
                    } else {
                        this.logger.info(`Git tag and push successful for backup-${timestamp}`);
                        this.logger.info(`Git stdout: ${stdout}`);
                        resolve();
                    }
                });
            });
            // Update last backup timestamp
            this.stats.lastBackup = timestamp;
            this.logger.info(`Backup created successfully: ${timestamp}`);
        } catch (error) {
            this.logger.error(`Backup creation failed: ${error.message}`);
            throw error;
        }
    }

    setupAutomaticBackup() {
        setInterval(() => {
            this.createBackup().catch(error => {
                this.logger.error(`Automatic backup failed: ${error.message}`);
            });
        }, this.backupInterval);
    }
}

module.exports = new AdminPanelPlugin();