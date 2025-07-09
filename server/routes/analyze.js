/**
 * @module AnalyzeRoutes
 * @description Express routes for code analysis functionality.
 * Handles file upload, validation, and analysis requests using the analyzer service.
 */

const express = require('express');
const analyzer = require('../services/analyzer');

/**
 * @type {express.Router}
 * @description Router instance for analysis-related endpoints.
 */
const router = express.Router();

/**
 * @route POST /api/analyze
 * @description Submit code files for security analysis using CoreTrace and flawfinder tools.
 * Accepts C/C++ source files and analysis options, returns structured analysis results.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing files and analysis options
 * @param {Object} req.body.files - Object with filename-content pairs of C/C++ files to analyze
 * @param {Object} [req.body.options] - Analysis options including static/dynamic flags
 * @param {boolean} [req.body.options.static] - Enable static analysis
 * @param {boolean} [req.body.options.dynamic] - Enable dynamic analysis
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with analysis results or error message
 * 
 * @example
 * POST /api/analyze
 * {
 *   "files": {
 *     "main.c": "#include <stdio.h>\nint main() { return 0; }"
 *   },
 *   "options": {
 *     "static": true,
 *     "dynamic": false
 *   }
 * }
 */
router.post('/', async (req, res) => {
    try {
        const { files, options } = req.body;

        // Validation
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        // Validate file sizes and content
        for (const [filename, content] of Object.entries(files)) {
            if (typeof content !== 'string') {
                return res.status(400).json({ error: 'File content must be a string' });
            }

            if (content.length > 1000000) { // 1MB limit per file
                return res.status(400).json({ error: 'File size exceeds the limit (1MB)' });
            }

            if (!filename.match(/\.(c|cpp|h|hpp)$/i)) {
                return res.status(400).json({ error: 'Only C/C++ files are allowed' });
            }
        }

        // Call service function to handle the analysis
        const result = await analyzer.analyzeCode(files, options || {});
        res.json(result);
    } catch (error) {
        console.error('Error analyzing code:', error);
        res.status(500).json({ error: 'An error occurred during analysis' });
    }
});

module.exports = router;