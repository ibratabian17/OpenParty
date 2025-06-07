/**
 * Plugin Manager for OpenParty
 * Handles loading and managing plugins
 */
const fs = require('fs');
const path = require('path');
const Plugin = require('./Plugin');
const Logger = require('../utils/logger');

class PluginManager {
    /**
     * Create a new plugin manager
     */
    constructor() {
        this.plugins = new Map();
        this.logger = new Logger('PluginManager');
    }

    /**
     * Load plugins from settings
     * @returns {Map} The loaded plugins
     */
    loadPlugins() {
        this.logger.info('Loading plugins from plugins directory...');
        this.plugins.clear(); // Clear existing plugins before reloading

        const pluginsDir = path.resolve(__dirname, '../../plugins');

        if (!fs.existsSync(pluginsDir)) {
            this.logger.warn(`Plugins directory not found: ${pluginsDir}`);
            return this.plugins;
        }

        const pluginFolders = fs.readdirSync(pluginsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        pluginFolders.forEach(folderName => {
            const pluginFolderPath = path.join(pluginsDir, folderName);
            const manifestPath = path.join(pluginFolderPath, 'manifest.json');

            if (!fs.existsSync(manifestPath)) {
                this.logger.warn(`Manifest.json not found in plugin folder: ${folderName}. Skipping.`);
                return;
            }

            try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

                if (!manifest.name || !manifest.main || !manifest.execution) {
                    this.logger.error(`Invalid manifest.json in ${folderName}: Missing name, main, or execution. Skipping.`);
                    return;
                }

                const mainPluginFile = path.join(pluginFolderPath, manifest.main);
                if (!fs.existsSync(mainPluginFile)) {
                    this.logger.error(`Main plugin file '${manifest.main}' not found in ${folderName} at ${mainPluginFile}. Skipping.`);
                    return;
                }

                const pluginInstance = require(mainPluginFile);

                if (pluginInstance instanceof Plugin) {
                    const originalPluginName = pluginInstance.name;
                    pluginInstance.manifest = manifest;
                    pluginInstance.name = manifest.name; // Override name from manifest
                    pluginInstance.description = manifest.description || pluginInstance.description; // Override description

                    // If the name was overridden by the manifest, update the logger instance to use the new name
                    if (pluginInstance.logger.moduleName !== manifest.name) {
                        this.logger.info(`Plugin class-defined name ('${originalPluginName}') differs from manifest ('${manifest.name}') for plugin in folder '${folderName}'. Updating logger to use manifest name '${manifest.name}'.`);
                        pluginInstance.logger = new Logger(manifest.name); // Re-initialize logger with manifest name
                    }

                    this.plugins.set(manifest.name, pluginInstance);
                    this.logger.info(`Loaded plugin: ${manifest.name} (v${manifest.version || 'N/A'}) from ${folderName}`);
                } else {
                    this.logger.error(`Error: ${mainPluginFile} from ${folderName} is not a valid plugin. It does not extend the 'Plugin' class.`);
                }
            } catch (error) {
                this.logger.error(`Error loading plugin from ${folderName}: ${error.message}\n${error.stack}`);
            }
        });

        // Process overrides
        const pluginsToOverride = new Set();
        this.plugins.forEach(pInstance => {
            if (pInstance.manifest && Array.isArray(pInstance.manifest.override)) {
                pInstance.manifest.override.forEach(pluginNameToOverride => {
                    pluginsToOverride.add(pluginNameToOverride);
                });
            }
        });

        pluginsToOverride.forEach(pluginNameToOverride => {
            if (this.plugins.has(pluginNameToOverride) && this.plugins.get(pluginNameToOverride).isEnabled()) {
                this.logger.info(`Plugin '${pluginNameToOverride}' is being overridden and will be disabled by another plugin.`);
                this.plugins.get(pluginNameToOverride).disable();
            }
        });
        return this.plugins;
    }

    /**
     * Initialize plugins based on execution type
     * @param {Express} app - The Express application instance
     * @param {string} executionType - The execution type (pre-load, init, etc.)
     */
    initializePlugins(app, executionType) {
        this.logger.info(`Initializing ${executionType} plugins...`);
        
        this.plugins.forEach((pluginInstance) => {
            if (pluginInstance.manifest && pluginInstance.isEnabled && pluginInstance.isEnabled()) {
                try {
                    if (pluginInstance.manifest.execution === executionType) {
                        this.logger.info(`Calling initroute for plugin: ${pluginInstance.name} (Execution Type: ${executionType})`);
                        pluginInstance.initroute(app);
                    } else {
                        // This log can be verbose, uncomment if needed for debugging
                        // this.logger.info(`Skipping plugin ${pluginInstance.name}: Execution type mismatch (Plugin: ${pluginInstance.manifest.execution}, Required: ${executionType}).`);
                    }
                } catch (error) {
                    this.logger.error(`Error initializing plugin ${pluginInstance.name}: ${error.message}\n${error.stack}`);
                }
            } else if (pluginInstance.manifest && (!pluginInstance.isEnabled || !pluginInstance.isEnabled())) {
                this.logger.info(`Skipping disabled plugin: ${pluginInstance.name}`);
            }
        });
    }

    /**
     * Get a plugin by name
     * @param {string} name - The name of the plugin
     * @returns {Plugin|null} The plugin or null if not found
     */
    getPlugin(name) {
        return this.plugins.get(name) || null;
    }

    /**
     * Get all loaded plugins
     * @returns {Map} The loaded plugins
     */
    getPlugins() {
        return this.plugins;
    }
}

module.exports = PluginManager;
