const express = require('express');
const path = require('path');
const logger = require('./services/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, analysisLimiter } = require('./middleware/rateLimiter');
const securityMiddleware = require('./middleware/security');
const config = require('./config');

const app = express();

// Apply security middleware
app.use(securityMiddleware);

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/analyze', analysisLimiter);

// Request logging
app.use(logger.requestLogger);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/analyze', require('./routes/analyze'));

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(config.server.port, () => {
    logger.info(`Server running on port ${config.server.port}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', { error: err });
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', { error: err });
    process.exit(1);
});
