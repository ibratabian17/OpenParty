/**
 * Core class for OpenParty
 * Handles routing and initialization
 */
const { main } = require('../var');
const { resolvePath } = require('../helper');
const PluginManager = require('./PluginManager');
const Router = require('./Router');
const ErrorHandler = require('./ErrorHandler');
const express = require('express'); // bodyParser is part of express now
const requestIp = require('../lib/ipResolver.js');
const Logger = require('../utils/logger');

class Core {
  /**
   * Create a new Core instance
   * @param {Object} settings - Server settings from settings.json
   */
  constructor(settings) {
    this.settings = settings;
    this.pluginManager = new PluginManager();
    this.router = new Router();
    this.appInstance = null; // To store app instance for plugins if needed
    this.logger = new Logger('CORE');
  }

  /**
   * Initialize the core functionality
   * @param {Express} app - The Express application instance
   * @param {Express} express - The Express module
   * @param {http.Server} server - The HTTP server instance
   */
  async init(app, express, server) {
    this.logger.info('Initializing core...');
    this.appInstance = app; // Store app instance
    
    // Initialize the database
    const { initializeDatabase } = require('../database/sqlite');
    try {
        await initializeDatabase();
        this.logger.info('Database initialized successfully.');
    } catch (error) {
        this.logger.error('Failed to initialize database:', error);
        process.exit(1); // Exit if database cannot be initialized
    }

    // Set pluginManager on the app instance so plugins can access it
    app.set('pluginManager', this.pluginManager);

    // Configure middleware
    this.configureMiddleware(app); // express module not needed here anymore
    
    // Load plugins
    this.pluginManager.loadPlugins(this.settings.modules);
    
    // Initialize pre-load plugins
    this.pluginManager.initializePlugins(app, 'pre-load');
    
    // Initialize core routes
    this.initializeCoreRoutes(app);
    
    // Initialize regular plugins
    this.pluginManager.initializePlugins(app, 'init');
    
    // Add 404 handler
    this.configure404Handler(app);
    
    this.logger.info('Core initialized successfully');
  }

  /**
   * Configure Express middleware
   * @param {Express} app - The Express application instance
   * @param {Express} express - The Express module
   */
  configureMiddleware(app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); // Added for form data
    // app.use(express.raw()); // If you need raw body parsing, uncomment this and ensure AdminPanelPlugin doesn't re-add it.
    app.use(requestIp.mw());
    
    // Use centralized error handler
    app.use(ErrorHandler.createExpressErrorHandler());
  }

  /**
   * Initialize core route handlers
   * @param {Express} app - The Express application instance
   */
  initializeCoreRoutes(app) {
    try {
      // Check if class-based route handlers exist, otherwise use legacy handlers
      try {
        // Use the Router class to load and initialize all route handlers
        this.router.loadAllHandlers().initializeRoutes(app);
        
        this.logger.info('Using class-based route handlers');
      } catch (err) {
        this.logger.error(`Error loading class-based route handlers: ${err.message}`);
        // Fall back to legacy route handlers
        require('../route/rdefault').initroute(app);
        require('../route/account').initroute(app);
        require('../route/leaderboard').initroute(app);
        require('../route/ubiservices').initroute(app);
        this.logger.info('Using legacy route handlers');
      }
      
      this.logger.info('Core routes initialized');
    } catch (error) {
      this.logger.error(`Error initializing core routes: ${error.message}`);
    }
  }

  /**
   * Configure 404 handler for unmatched routes
   * @param {Express} app - The Express application instance
   */
  configure404Handler(app) {
    app.get('*', function(req, res) {
      res.status(404).send({
        'error': 404,
        'message': 'Path Not Recognized'
      });
    });
  }
}

module.exports = Core;
