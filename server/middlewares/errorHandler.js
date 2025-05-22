/**
 * Middleware function to handle errors in the application.
 *
 * @param {Error} err - The error object containing details about the error.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function in the stack.
 *
 * Logs the error stack trace for debugging purposes and sends an appropriate
 * JSON response to the client. In non-production environments, the error message
 * and stack trace are included in the response for easier debugging.
 *
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack trace for debugging

  // Determine the HTTP status code
  const statusCode = err.status || 500;

  // Build the error response
  const response = {
    error: 'An unexpected error occurred',
  };

  // Include the error message in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    response.message = err.message;
    response.stack = err.stack;
  }

  // Send the error response
  res.status(statusCode).json(response);
};

module.exports = errorHandler;