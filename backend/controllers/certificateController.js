const Certificate = require('../models/Certificate');
const Device = require('../models/Device');
const env = require('../config/env');
const { generateVerificationId } = require('../services/idService');
const { polishListingDescription } = require('../services/aiExplanationService');
const { generateListingText } = require('../services/listingService');
const { addLifecycleEvent, EVENT_TYPES } = require('../services/lifecycleService');
const { calculateJourneyProgress } = require('../services/progressService');

const generateCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const device = await Device.findOne({ deviceId: id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found.',
        details: [],
      });
    }

    if (device.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        details: [],
      });
    }

    // Critical rule check: dataSafety must be completed
    if (!device.dataSafety || !device.dataSafety.completed) {
      return res.status(409).json({
        success: false,
        message: 'Verification Certificate cannot be generated until all 5 data safety checklist items are completed.',
        details: [],
      });
    }

    let certificate;
    if (device.verificationId) {
      certificate = await Certificate.findOne({ verificationId: device.verificationId });
    }

    if (!certificate) {
      // Generate unique verification ID with retry logic
      let verificationId;
      let attempts = 0;
      while (attempts < 5) {
        verificationId = generateVerificationId();
        const exists = await Certificate.findOne({ verificationId });
        if (!exists) break;
        attempts++;
      }

      const verifyUrl = `${env.PUBLIC_VERIFY_BASE_URL}/${verificationId}`;

      certificate = await Certificate.create({
        verificationId,
        deviceId: device.deviceId,
        verifyUrl,
        deviceSummary: {
          deviceType: device.deviceType,
          brand: device.brand,
          model: device.model,
          purchaseYear: device.purchaseYear,
          condition: device.condition,
          batteryHealthPercent: device.batteryHealthPercent || null,
          repairHistory: device.repairHistory || [],
        },
        dataSafetySnapshot: device.dataSafety,
        lifecycleEvents: device.lifecycleEvents || [],
        status: 'TRANSFER_READY',
        issuedAt: new Date(),
        disclaimer:
          'Verification reflects the checks and evidence recorded at the verification date; it is not a guarantee of future performance.',
      });

      device.verificationId = verificationId;
      device.status = 'TRANSFER_READY';
      addLifecycleEvent(
        device,
        EVENT_TYPES.TRANSFER_READY,
        `Verification Certificate ${verificationId} issued. Ready for transfer/resale/donation.`
      );
      await device.save();
    }

    const listingDescription = await polishListingDescription(device, certificate);
    const fullListingText = generateListingText(device, certificate);
    const devObj = device.toJSON();

    return res.status(201).json({
      success: true,
      data: {
        verificationId: certificate.verificationId,
        verifyUrl: certificate.verifyUrl,
        listingDescription,
        fullListingText,
        certificate,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDeviceCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const device = await Device.findOne({ deviceId: id });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found.',
        details: [],
      });
    }

    if (device.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        details: [],
      });
    }

    if (!device.verificationId) {
      return res.status(404).json({
        success: false,
        message: 'Verification Certificate has not been generated for this device.',
        details: [],
      });
    }

    const certificate = await Certificate.findOne({ verificationId: device.verificationId });
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate document not found.',
        details: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: { certificate },
    });
  } catch (error) {
    next(error);
  }
};

const getPublicCertificate = async (req, res, next) => {
  try {
    const { verificationId } = req.params;
    const certificate = await Certificate.findOne({ verificationId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: `No verification certificate found matching ID '${verificationId}'.`,
        details: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        certificate: certificate.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCertificate,
  getDeviceCertificate,
  getPublicCertificate,
};
