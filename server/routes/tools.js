/**
 * @module ToolsRoutes
 * @description Express routes for analysis tools functionality.
 * Provides information about available analysis tools and their capabilities.
 */

const express = require('express');
const { getAvailableTools } = require('../services/toolsService');

/**
 * @type {express.Router}
 * @description Router instance for tools-related endpoints.
 */
const router = express.Router();

/**
 * @route GET /api/tools
 * @description Retrieve information about available analysis tools from ctrace.
 * Returns a list of tools that can be used for code analysis, including their
 * names, descriptions, and capabilities.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of available tools
 * 
 * @example
 * GET /api/tools
 * Response: {
 *   "tools": [
 *     {
 *       "name": "flawfinder",
 *       "description": "Static analysis tool for finding security vulnerabilities",
 *       "version": "2.0.19"
 *     }
 *   ]
 * }
 */
router.get('/', async (req, res) => {
  try {
    const tools = await getAvailableTools();
    res.json({ tools });
  } catch (error) {
    console.error('Error retrieving tools:', error);
    res.status(500).json({ error: 'Failed to retrieve tools' });
  }
});

module.exports = router;