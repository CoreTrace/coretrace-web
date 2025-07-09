/**
 * @module AnalyzeControllers
 * @description Controller functions for code analysis operations.
 * Handles request processing, validation, and response formatting for analysis endpoints.
 */

/**
 * @function analyze
 * @description Controller function for handling code analysis requests.
 * Validates input files and options, then delegates to the analyzer service for processing.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing files and analysis options
 * @param {Object} req.body.files - Object with filename-content pairs of files to analyze
 * @param {Object} [req.body.options] - Analysis options and configuration
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function for error handling
 * @returns {Object} JSON response with analysis results or error message
 * @throws {Error} When analysis fails or validation errors occur
 */
const { analyzeCode } = require('../services/analyzer');

exports.analyze = async (req, res, next) => {
  try {
    const { files, options } = req.body;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const result = await analyzeCode(files, options || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
};