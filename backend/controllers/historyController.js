const Device = require('../models/Device');
const { addLifecycleEvent, EVENT_TYPES } = require('../services/lifecycleService');
const { calculateJourneyProgress } = require('../services/progressService');

const OUTCOME_MAP = {
  CONTINUED: { status: 'IN_USE', eventType: EVENT_TYPES.DEVICE_CONTINUED },
  TRANSFERRED: { status: 'TRANSFERRED', eventType: EVENT_TYPES.DEVICE_TRANSFERRED },
  DONATED: { status: 'DONATED', eventType: EVENT_TYPES.DEVICE_DONATED },
  REPURPOSED: { status: 'REPURPOSED', eventType: EVENT_TYPES.DEVICE_REPURPOSED },
  RECYCLED: { status: 'RECYCLED', eventType: EVENT_TYPES.DEVICE_RECYCLED },
};

const getDeviceHistory = async (req, res, next) => {
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

    const history = (device.lifecycleEvents || []).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    return res.status(200).json({
      success: true,
      data: {
        deviceId: device.deviceId,
        status: device.status,
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateDeviceOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { outcome, note } = req.body;

    const mapping = OUTCOME_MAP[outcome];
    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: `Invalid outcome '${outcome}'. Must be one of: ${Object.keys(OUTCOME_MAP).join(', ')}`,
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

    device.status = mapping.status;
    addLifecycleEvent(
      device,
      mapping.eventType,
      note || `Device history updated with outcome: ${outcome}`
    );

    await device.save();

    const devObj = device.toJSON();

    return res.status(200).json({
      success: true,
      data: {
        deviceId: device.deviceId,
        status: device.status,
        history: device.lifecycleEvents,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeviceHistory,
  updateDeviceOutcome,
};
