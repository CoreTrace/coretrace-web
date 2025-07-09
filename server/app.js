/**
 * @module App
 * @description Main Express application configuration and middleware setup.
 * Configures CORS, JSON parsing, routes, and error handling for the CoreTrace API.
 */

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

/**
 * @module middlewares/errorHandler
 * @description Middleware for handling errors in the application.
 * This middleware should be used to catch and process errors
 * that occur during the request-response cycle.
 */
const errorHandler = require('./middlewares/errorHandler');

/**
 * @type {express.Application}
 * @description Express application instance with configured middleware and routes.
 */
const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Route mounting
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;