const express = require('express');
const { z } = require('zod');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getDeviceHistory, updateDeviceOutcome } = require('../controllers/historyController');

const outcomeSchema = {
  body: z.object({
    outcome: z.enum(['CONTINUED', 'TRANSFERRED', 'DONATED', 'REPURPOSED', 'RECYCLED']),
    note: z.string().optional(),
  }),
};

router.get('/devices/:id/history', protect, getDeviceHistory);
router.post('/devices/:id/history', protect, validate(outcomeSchema), updateDeviceOutcome);

module.exports = router;
