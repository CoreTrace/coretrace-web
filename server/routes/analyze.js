const express = require('express');
const analyzer = require('../services/analyzer');
const jobManager = require('../services/jobManager');
const logger = require('../services/logger');
const router = express.Router();

/**
 * @route POST /api/analyze
 * @description Submit code for analysis with CoreTrace
 */
router.post('/', async (req, res) => {
    try {
        const { files, options } = req.body;

        // Validate files
        const validationErrors = jobManager.validateFiles(files);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: validationErrors 
            });
        }

        // Run analysis
        const result = await analyzer.analyzeCode(files, options);
        res.json(result);
    } catch (error) {
        logger.error('Analysis request failed', { 
            error: error.message,
            requestId: req.requestId
        });
        res.status(500).json({ 
            error: 'Analysis failed',
            message: error.message
        });
    }
});

/**
 * @route GET /api/analyze/:jobId
 * @description Get the status of an analysis job
 */
router.get('/:jobId', (req, res) => {
    const job = jobManager.getJob(req.params.jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
});

module.exports = router;