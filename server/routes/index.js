const express = require('express');
const analyzeRoutes = require('./analyze');
const examplesRoutes = require('./examples');
const toolsRoutes = require('./tools');

const router = express.Router();

router.use('/analyze', analyzeRoutes);
router.use('/examples', examplesRoutes);
router.use('/tools', toolsRoutes);

module.exports = router;