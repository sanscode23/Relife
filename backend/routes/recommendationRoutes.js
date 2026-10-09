const express = require('express');
const { z } = require('zod');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  runAssessment,
  getRecommendation,
  selectPath,
  getRepairComparison,
  getPathways,
} = require('../controllers/recommendationController');

const pathSchema = {
  body: z.object({
    path: z.enum(['CONTINUE_OR_REPAIR', 'SELL_OR_DONATE', 'REPURPOSE', 'RECYCLE']),
  }),
};

router.post('/devices/:id/assessment', protect, runAssessment);
router.get('/devices/:id/recommendation', protect, getRecommendation);
router.post('/devices/:id/path', protect, validate(pathSchema), selectPath);
router.get('/devices/:id/repair-comparison', protect, getRepairComparison);
router.get('/devices/:id/pathways', protect, getPathways);

module.exports = router;
