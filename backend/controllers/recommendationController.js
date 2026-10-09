const Device = require('../models/Device');
const { runRecommendationEngine } = require('../services/recommendationEngine');
const { generateAiExplanation } = require('../services/aiExplanationService');
const { calculateRepairComparison } = require('../services/repairComparisonService');
const { generatePathways } = require('../services/pathwayService');
const { addLifecycleEvent, EVENT_TYPES } = require('../services/lifecycleService');
const { calculateJourneyProgress } = require('../services/progressService');

const runAssessment = async (req, res, next) => {
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

    const recommendation = runRecommendationEngine(device);
    const aiExplanation = await generateAiExplanation(device, recommendation);
    recommendation.aiExplanation = aiExplanation;

    const repairComparison = calculateRepairComparison(device);

    device.recommendation = recommendation;
    device.repairComparison = repairComparison;
    if (['REGISTERED', 'ASSESSED'].includes(device.status)) {
      device.status = 'ASSESSED';
    }

    addLifecycleEvent(
      device,
      EVENT_TYPES.ASSESSMENT_COMPLETED,
      `Assessment completed. Recommended action: ${recommendation.action}`
    );

    await device.save();

    const devObj = device.toJSON();

    return res.status(200).json({
      success: true,
      data: {
        deviceId: device.deviceId,
        recommendation: device.recommendation,
        repairComparison: device.repairComparison,
        status: device.status,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendation = async (req, res, next) => {
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

    if (!device.recommendation || !device.recommendation.action) {
      return res.status(404).json({
        success: false,
        message: 'Assessment has not been performed on this device yet.',
        details: [],
      });
    }

    const devObj = device.toJSON();

    return res.status(200).json({
      success: true,
      data: {
        deviceId: device.deviceId,
        recommendation: device.recommendation,
        chosenPath: device.chosenPath,
        status: device.status,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      },
    });
  } catch (error) {
    next(error);
  }
};

const selectPath = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { path } = req.body;

    const allowedPaths = ['CONTINUE_OR_REPAIR', 'SELL_OR_DONATE', 'REPURPOSE', 'RECYCLE'];
    if (!allowedPaths.includes(path)) {
      return res.status(400).json({
        success: false,
        message: `Invalid path value '${path}'. Must be one of: ${allowedPaths.join(', ')}`,
        details: [],
      });
    }

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

    device.chosenPath = path;
    if (['REGISTERED', 'ASSESSED'].includes(device.status)) {
      device.status = 'PATH_SELECTED';
    }

    addLifecycleEvent(device, EVENT_TYPES.PATH_SELECTED, `Selected pathway: ${path}`);
    await device.save();

    const devObj = device.toJSON();

    return res.status(200).json({
      success: true,
      data: {
        deviceId: device.deviceId,
        chosenPath: device.chosenPath,
        status: device.status,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRepairComparison = async (req, res, next) => {
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

    const comparison = device.repairComparison || calculateRepairComparison(device);

    return res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

const getPathways = async (req, res, next) => {
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

    const pathwayData = generatePathways(device);

    return res.status(200).json({
      success: true,
      data: pathwayData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runAssessment,
  getRecommendation,
  selectPath,
  getRepairComparison,
  getPathways,
};
