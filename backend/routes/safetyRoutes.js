const express = require('express');
const { z } = require('zod');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getSafetyStatus, updateSafetyChecklist } = require('../controllers/safetyController');

const safetyItemSchema = z.object({
  done: z.boolean(),
  evidence: z.string().optional(),
}).optional();

const updateSafetySchema = {
  body: z.object({
    backup: safetyItemSchema,
    accountsRemoved: safetyItemSchema,
    encryptionChecked: safetyItemSchema,
    factoryReset: safetyItemSchema,
    storageSanitized: safetyItemSchema,
  }),
};

router.get('/devices/:id/safety', protect, getSafetyStatus);
router.patch('/devices/:id/safety', protect, validate(updateSafetySchema), updateSafetyChecklist);

module.exports = router;
