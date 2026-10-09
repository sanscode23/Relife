const express = require('express');
const { z } = require('zod');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  guestAuth,
  register,
  login,
  upgradeGuest,
  getMe,
} = require('../controllers/authController');

const registerSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    city: z.string().optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};

const upgradeSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
};

router.post('/auth/guest', guestAuth);
router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login', validate(loginSchema), login);
router.post('/auth/upgrade', protect, validate(upgradeSchema), upgradeGuest);
router.get('/auth/me', protect, getMe);

module.exports = router;
