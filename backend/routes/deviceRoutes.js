const express = require('express');
const { z } = require('zod');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createDevice,
  getDevices,
  getDeviceById,
  uploadDeviceImage,
  addRepairRecord,
  deleteDevice,
} = require('../controllers/deviceController');

const createDeviceSchema = {
  body: z.object({
    deviceType: z.enum(['LAPTOP', 'PHONE', 'TABLET', 'DESKTOP', 'ROUTER', 'OTHER']),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    purchaseYear: z.number().int().min(1990).max(new Date().getFullYear()),
    condition: z.enum(['GOOD', 'FAIR', 'POOR']),
    issues: z.array(z.string()).optional(),
    repairCost: z.number().min(0).optional(),
    userWantsToSell: z.boolean().optional(),
    batteryHealthPercent: z.number().min(0).max(100).nullable().optional(),
  }),
};

const repairRecordSchema = {
  body: z.object({
    description: z.string().min(1, 'Repair description is required'),
    cost: z.number().min(0, 'Cost must be non-negative'),
    date: z.string().optional(),
    batteryHealthPercent: z.number().min(0).max(100).optional(),
  }),
};

router.post('/devices', protect, validate(createDeviceSchema), createDevice);
router.get('/devices', protect, getDevices);
router.get('/devices/:id', protect, getDeviceById);
router.post('/devices/:id/image', protect, upload.single('image'), uploadDeviceImage);
router.post('/devices/:id/repairs', protect, validate(repairRecordSchema), addRepairRecord);
router.delete('/devices/:id', protect, deleteDevice);

module.exports = router;
