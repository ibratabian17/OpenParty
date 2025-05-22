/**
 * Example HelloWorld Plugin for OpenParty
 * Demonstrates how to create a plugin using the new class-based architecture
 */
const Plugin = require('../core/classes/Plugin');

class HelloWorldPlugin extends Plugin {
  /**
   * Create a new HelloWorld plugin
   */
  constructor() {
    super('HelloWorldPlugin', 'A simple example plugin that demonstrates the plugin system');
  }

  /**
   * Initialize the plugin's routes
   * @param {Express} app - The Express application instance
   */
  initroute(app) {
    console.log(`[${this.name}] Initializing routes...`);
    
    // Add a simple route that returns a greeting
    app.get('/hello-world', (req, res) => {
      res.json({
        message: 'Hello from OpenParty Plugin System!',
        plugin: this.name,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log(`[${this.name}] Routes initialized`);
  }
}

// Export an instance of the plugin
module.exports = new HelloWorldPlugin();