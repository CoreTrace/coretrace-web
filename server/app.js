const express = require('express');
const cors = require('cors');
const routes = require('./routes');
/**
 * Middleware for handling errors in the application.
 * This middleware should be used to catch and process errors
 * that occur during the request-response cycle.
 *
 * @module middlewares/errorHandler
 */
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;