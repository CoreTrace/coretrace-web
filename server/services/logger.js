/**
 * @module Logger
 * @description Centralized logging service using Winston for structured logging across the application.
 * Provides console and file-based logging with request tracking capabilities.
 */

const winston = require('winston');
const config = require('../config');

/**
 * @type {winston.Logger}
 * @description Winston logger instance configured with console and file transports.
 * Supports different log levels and formats for development and production environments.
 */
const logger = winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ 
            filename: 'error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'combined.log' 
        })
    ]
});

/**
 * @function requestLogger
 * @description Express middleware for logging incoming HTTP requests with request ID tracking.
 * Adds request ID to the request object and logs request details for debugging and monitoring.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 */
logger.requestLogger = (req, res, next) => {
    req.requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    logger.info('Incoming request', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        ip: req.ip
    });
    next();
};

module.exports = logger; 