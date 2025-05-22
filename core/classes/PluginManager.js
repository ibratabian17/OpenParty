/**
 * Plugin Manager for OpenParty
 * Handles loading and managing plugins
 */
const fs = require('fs');
const path = require('path');
const Plugin = require('./Plugin'); // This is the Plugin class PluginManager uses for comparison
const { resolvePath } = require('../helper');
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
     * @param {Object} modules - The modules configuration from settings.json
     * @returns {Map} The loaded plugins
     */
    loadPlugins(modules) {
        this.logger.info('Loading plugins...');
        
        // Log the Plugin class that PluginManager is using for comparison
        this.logger.info('Plugin class used for comparison:', Plugin.name);

        modules.forEach((item) => {
            try {
                const plugin = require(resolvePath(item.path));
                
                // Log the Plugin class that the loaded plugin is extending
                this.logger.info(`Loaded plugin '${item.path}' extends:`, Object.getPrototypeOf(plugin.constructor).name);

                // Verify that the plugin extends the Plugin class
                if (plugin instanceof Plugin) {
                    this.plugins.set(plugin.name, plugin);
                    this.logger.info(`Loaded plugin: ${plugin.name}`);
                } else {
                    this.logger.error(`Error: ${item.path} is not a valid plugin. It does not extend the expected 'Plugin' class.`);
                    // Provide more detail if the instanceof check fails
                    this.logger.error(`Expected Plugin constructor:`, Plugin);
                    this.logger.error(`Actual plugin's prototype chain constructor:`, Object.getPrototypeOf(plugin.constructor));
                }
            } catch (error) {
                this.logger.error(`Error loading plugin ${item.path}: ${error.message}`);
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
        
        this.plugins.forEach((plugin) => {
            // Assuming isEnabled() exists on the Plugin base class or is handled otherwise
            if (plugin.isEnabled && plugin.isEnabled()) { 
                try {
                    // Get the plugin's configuration from settings.json
                    const pluginConfig = this.getPluginConfig(plugin.name);
                    if (pluginConfig && pluginConfig.execution === executionType) {
                        this.logger.info(`Calling initroute for plugin: ${plugin.name} (Execution Type: ${executionType})`);
                        plugin.initroute(app);
                    } else {
                        this.logger.info(`Skipping plugin ${plugin.name}: Execution type mismatch or no config.`);
                    }
                } catch (error) {
                    this.logger.error(`Error initializing plugin ${plugin.name}: ${error.message}`);
                }
            } else {
                this.logger.info(`Skipping disabled plugin: ${plugin.name}`);
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

    /**
     * Get the configuration for a plugin from settings.json
     * @param {string} name - The name of the plugin
     * @returns {Object|null} The plugin configuration or null if not found
     */
    getPluginConfig(name) {
        // IMPORTANT: Adjust this path if your settings.json is not located relative to PluginManager.js
        // For example, if PluginManager is in 'core/classes' and settings.json is in the root,
        // '../../settings.json' is likely correct.
        try {
            const settings = require('../../settings.json');
            return settings.modules.find(module => module.name === name) || null;
        } catch (error) {
            this.logger.error(`Error loading settings.json: ${error.message}`);
            return null;
        }
    }
}

module.exports = PluginManager;
