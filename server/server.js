/**
 * @module Server
 * @description HTTP server entry point for the CoreTrace web application.
 * Starts the Express application on the configured port and handles server lifecycle.
 */

const app = require('./app');

/**
 * @type {number}
 * @description Port number for the HTTP server, defaults to 5000 if not specified in environment.
 */
const PORT = process.env.PORT || 5000;

/**
 * @function startServer
 * @description Starts the HTTP server and logs the port number.
 * The server will listen for incoming HTTP requests on the specified port.
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});