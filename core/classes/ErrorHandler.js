/**
 * Error Handler class for OpenParty
 * Provides centralized error handling functionality
 */
const Logger = require('../utils/logger');

class ErrorHandler {
  /**
   * Create a new ErrorHandler instance
   */
  constructor() {
    this.errors = [];
    this.maxLoggedErrors = 100; // Maximum number of errors to keep in memory
    this.logger = new Logger('ErrorHandler');
  }

  /**
   * Log an error
   * @param {string} source - The source of the error (e.g., component name)
   * @param {Error|string} error - The error object or message
   * @param {Object} [context] - Additional context information
   */
  logError(source, error, context = {}) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : null;
    
    const errorEntry = {
      timestamp: new Date().toISOString(),
      source,
      message: errorMessage,
      stack: errorStack,
      context
    };
    
    // Add to in-memory log
    this.errors.unshift(errorEntry);
    
    // Trim log if it exceeds maximum size
    if (this.errors.length > this.maxLoggedErrors) {
      this.errors = this.errors.slice(0, this.maxLoggedErrors);
    }
    
    // Log to console using the new logger
    this.logger.error(`[${source}] ${errorMessage}`);
    if (errorStack) {
      this.logger.error(errorStack);
    }
    
    return errorEntry;
  }

  /**
   * Create an Express middleware for handling errors
   * @returns {Function} Express middleware function
   */
  createExpressErrorHandler() {
    return (err, req, res, next) => {
      // Log the error
      this.logError('Express', err, {
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      
      // Send appropriate response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 
          'An unexpected error occurred' : 
          err.message
      });
    };
  }

  /**
   * Get recent errors
   * @param {number} [limit=10] - Maximum number of errors to return
   * @returns {Array} Recent errors
   */
  getRecentErrors(limit = 10) {
    return this.errors.slice(0, limit);
  }

  /**
   * Clear all logged errors
   */
  clearErrors() {
    this.errors = [];
  }
}

// Export a singleton instance
module.exports = new ErrorHandler();
