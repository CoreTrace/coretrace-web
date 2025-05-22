const express = require('express');
const { getAvailableTools } = require('../services/toolsService');

const router = express.Router();

/**
 * @route GET /api/tools
 * @description Retrieve available tools from ctrace
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