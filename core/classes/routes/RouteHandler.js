/**
 * Base RouteHandler class for OpenParty
 * All route handlers should extend this class
 */
const ErrorHandler = require('../ErrorHandler');
const Logger = require('../../utils/logger');

class RouteHandler {
  /**
   * Create a new route handler
   * @param {string} name - The name of the route handler
   */
  constructor(name) {
    this.name = name;
    this.logger = new Logger(name);
  }

  /**
   * Initialize the routes
   * This method should be overridden by route handler implementations
   * @param {Express} app - The Express application instance
   */
  initroute(app) {
    // This method should be implemented by child classes
    this.logger.info(`initialized`);
  }

  /**
   * Register a GET route with error handling
   * @param {Express} app - The Express application instance
   * @param {string} path - The route path
   * @param {Function} handler - The route handler function
   */
  registerGet(app, path, handler) {
    app.get(path, this.wrapHandler(handler));
  }

  /**
   * Register a POST route with error handling
   * @param {Express} app - The Express application instance
   * @param {string} path - The route path
   * @param {Function} handler - The route handler function
   */
  registerPost(app, path, handler) {
    app.post(path, this.wrapHandler(handler));
  }

  /**
   * Register a PUT route with error handling
   * @param {Express} app - The Express application instance
   * @param {string} path - The route path
   * @param {Function} handler - The route handler function
   */
  registerPut(app, path, handler) {
    app.put(path, this.wrapHandler(handler));
  }

  /**
   * Register a DELETE route with error handling
   * @param {Express} app - The Express application instance
   * @param {string} path - The route path
   * @param {Function} handler - The route handler function
   */
  registerDelete(app, path, handler) {
    app.delete(path, this.wrapHandler(handler));
  }

  /**
   * Wrap a route handler with error handling
   * @param {Function} handler - The route handler function
   * @returns {Function} The wrapped handler function
   */
  wrapHandler(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        // Use the centralized error handler
        ErrorHandler.logError(this.name, error, {
          url: req.url,
          method: req.method,
          routeHandler: this.name
        });
        next(error);
      }
    };
  }
}

module.exports = RouteHandler;
