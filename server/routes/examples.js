const express = require('express');
const { getExampleList, getExampleCode } = require('../services/examples');

const router = express.Router();

/**
 * @route GET /api/examples
 * @description Get a list of available example code snippets
 */
router.get('/', (req, res) => {
    try {
        const examples = getExampleList();
        res.json(examples);
    } catch (error) {
        console.error('Error retrieving examples:', error);
        res.status(500).json({ error: 'Failed to retrieve examples' });
    }
});

/**
 * @route GET /api/examples/:id
 * @description Get a specific example code snippet by ID
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const example = getExampleCode(id);

        if (!example) {
            return res.status(404).json({ error: 'Example not found' });
        }

        res.json(example);
    } catch (error) {
        console.error('Error retrieving example:', error);
        res.status(500).json({ error: 'Failed to retrieve example' });
    }
});

module.exports = router;