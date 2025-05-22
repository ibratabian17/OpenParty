/**
 * Base Plugin class for OpenParty
 * All plugins should extend this class
 */
const Logger = require('../utils/logger');

class Plugin {
  /**
   * Create a new plugin
   * @param {string} name - The name of the plugin
   * @param {string} description - A description of what the plugin does
   */
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.enabled = true;
    this.logger = new Logger(name); // Use plugin name as module name for logger
  }

  /**
   * Initialize the plugin's routes
   * This method should be overridden by plugin implementations
   * @param {Express} app - The Express application instance
   */
  initroute(app) {
    // This method should be implemented by child classes
    this.logger.info(`initialized`);
  }

  /**
   * Enable the plugin
   */
  enable() {
    this.enabled = true;
    this.logger.info(`enabled`);
  }

  /**
   * Disable the plugin
   */
  disable() {
    this.enabled = false;
    this.logger.info(`disabled`);
  }

  /**
   * Check if the plugin is enabled
   * @returns {boolean} Whether the plugin is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

module.exports = Plugin;
