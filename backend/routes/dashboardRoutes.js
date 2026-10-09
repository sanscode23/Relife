const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/dashboardController');

router.get('/dashboard', protect, getDashboardSummary);

module.exports = router;
