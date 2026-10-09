const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getGlobalImpact, getUserImpact } = require('../controllers/impactController');

// Public global metrics
router.get('/impact', getGlobalImpact);

// Authenticated user specific metrics
router.get('/impact/me', protect, getUserImpact);

module.exports = router;
