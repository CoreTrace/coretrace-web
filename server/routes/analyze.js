const express = require('express');
const { analyzeCode, getAnalysisStatus } = require('../services/analyzer');

const router = express.Router();

/**
 * @route POST /api/analyze
 * @description Submit code for analysis with CoreTrace
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
        const result = await analyzeCode(files, options || {});
        res.json(result);
    } catch (error) {
        console.error('Error analyzing code:', error);
        res.status(500).json({ error: 'An error occurred during analysis' });
    }
});

module.exports = router;