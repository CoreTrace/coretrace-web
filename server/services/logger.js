const winston = require('winston');
const config = require('../config');

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

// Add request ID to logs
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