const express = require('express');
const { z } = require('zod');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getProfile, updateProfile } = require('../controllers/userController');

const updateProfileSchema = {
  body: z.object({
    name: z.string().optional(),
    city: z.string().optional(),
  }),
};

router.get('/users/me', protect, getProfile);
router.patch('/users/me', protect, validate(updateProfileSchema), updateProfile);

module.exports = router;
