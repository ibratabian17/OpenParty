/**
 * Server class for OpenParty
 * Manages the HTTP server lifecycle
 */
const express = require('express');
const Core = require('./Core');
const Logger = require('../utils/logger');

class Server {
  /**
   * Create a new server instance
   * @param {Object} settings - Server settings from settings.json
   */
  constructor(settings) {
    this.settings = settings;
    this.app = express();
    this.core = new Core(settings);
    this.port = settings.server.forcePort ? settings.server.port : process.env.PORT || settings.server.port;
    this.host = settings.server.isPublic ? '0.0.0.0' : '127.0.0.1';
    this.logger = new Logger('SERVER');
    
    // Set process title
    process.title = 'OpenParty | Custom Just Dance Unlimited Server';
  }

  /**
   * Start the server
   * @returns {http.Server} The HTTP server instance
   */
  start() {
    this.logger.info(`Starting OpenParty server...`);
    
    // Create and start the HTTP server
    this.server = this.app.listen(this.port, this.host, async () => { // Made callback async
      // Initialize the core and await its completion
      await this.core.init(this.app, express, this.server);
      
      this.logger.info(`Listening on ${this.host}:${this.port}`);
      this.logger.info(`Open panel to see more logs`);
      this.logger.info(`Running in ${process.env.NODE_ENV || 'development'} mode`);
    });
    
    // Handle server errors
    this.server.on('error', (error) => {
      this.logger.error(`Error starting server: ${error.message}`);
      process.exit(1);
    });
    
    // Handle process termination
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
    
    return this.server;
  }

  /**
   * Stop the server gracefully
   */
  stop() {
    this.logger.info(`Stopping server...`);
    
    if (this.server) {
      this.server.close(() => {
        this.logger.info(`Server stopped`);
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

module.exports = Server;
