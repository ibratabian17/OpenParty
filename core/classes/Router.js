/**
 * Router class for OpenParty
 * Manages all route handlers in a centralized way
 */
const Logger = require('../utils/logger');

class Router {
  /**
   * Create a new Router instance
   */
  constructor() {
    this.routeHandlers = [];
    this.logger = new Logger('ROUTER');
  }

  /**
   * Register a route handler
   * @param {RouteHandler} routeHandler - The route handler to register
   */
  registerHandler(routeHandler) {
    this.routeHandlers.push(routeHandler);
    this.logger.info(`Registered route handler: ${routeHandler.name}`);
  }

  /**
   * Initialize all registered route handlers
   * @param {Express} app - The Express application instance
   */
  initializeRoutes(app) {
    this.logger.info('Initializing all route handlers...');
    
    if (this.routeHandlers.length === 0) {
      this.logger.info('No route handlers registered');
      return;
    }
    
    // Initialize each route handler
    this.routeHandlers.forEach(handler => {
      try {
        handler.initroute(app);
      } catch (error) {
        this.logger.error(`Error initializing route handler ${handler.name}: ${error.message}`);
      }
    });
    
    this.logger.info(`Initialized ${this.routeHandlers.length} route handlers`);
  }

  /**
   * Load all route handlers from the routes directory
   * @returns {Router} This router instance for chaining
   */
  loadAllHandlers() {
    this.logger.info('Loading all route handlers...');
    
    try {
      // Load all route handlers
      const defaultHandler = require('./routes/DefaultRouteHandler');
      const accountHandler = require('./routes/AccountRouteHandler');
      const leaderboardHandler = require('./routes/LeaderboardRouteHandler');
      const ubiservicesHandler = require('./routes/UbiservicesRouteHandler');
      const songDBHandler = require('./routes/SongDBRouteHandler');
      const carouselHandler = require('./routes/CarouselRouteHandler');
      
      // Register all handlers
      this.registerHandler(defaultHandler);
      this.registerHandler(accountHandler);
      this.registerHandler(leaderboardHandler);
      this.registerHandler(ubiservicesHandler);
      this.registerHandler(songDBHandler);
      this.registerHandler(carouselHandler);
      
      this.logger.info('All route handlers loaded successfully');
    } catch (error) {
      this.logger.error(`Error loading route handlers: ${error.stack}`);
    }
    
    return this;
  }
}

module.exports = Router;
