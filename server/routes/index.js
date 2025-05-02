const express = require('express');
const analyzeRoutes = require('./analyze');
const examplesRoutes = require('./examples');

const router = express.Router();

// Mount the route groups
router.use('/analyze', analyzeRoutes);
router.use('/examples', examplesRoutes);

module.exports = router;