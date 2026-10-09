const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateCertificate,
  getDeviceCertificate,
  getPublicCertificate,
} = require('../controllers/certificateController');

// Public QR Page lookup endpoint
router.get('/certificates/:verificationId', getPublicCertificate);

// Protected endpoints
router.post('/devices/:id/certificate', protect, generateCertificate);
router.get('/devices/:id/certificate', protect, getDeviceCertificate);

module.exports = router;
