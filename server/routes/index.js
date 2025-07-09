/**
 * @module Routes
 * @description Main router configuration that mounts all application routes.
 * Centralizes route organization and provides a single entry point for all API endpoints.
 */

const express = require('express');
const analyzeRoutes = require('./analyze');
const examplesRoutes = require('./examples');
const toolsRoutes = require('./tools');

/**
 * @type {express.Router}
 * @description Express router instance that mounts all application routes.
 */
const router = express.Router();

// Mount route modules
router.use('/analyze', analyzeRoutes);
router.use('/examples', examplesRoutes);
router.use('/tools', toolsRoutes);

module.exports = router;