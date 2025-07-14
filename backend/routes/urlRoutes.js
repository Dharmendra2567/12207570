const express = require('express');
const router = express.Router();
const { createShortUrl, redirectToUrl, getUrlStats } = require('../controller');
const { Log } = require('../../middleware/logger');

// Create short URL
router.post('/', createShortUrl);

// Redirect to original URL
router.get('/:shortcode', redirectToUrl);

// Get URL statistics
router.get('/stats/:shortcode', getUrlStats);

module.exports = router;