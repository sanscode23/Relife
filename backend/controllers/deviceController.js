const Device = require('../models/Device');
const { generateDeviceId } = require('../services/idService');
const { addLifecycleEvent, EVENT_TYPES } = require('../services/lifecycleService');
const { calculateJourneyProgress } = require('../services/progressService');
const { saveFile } = require('../services/storageService');

const createDevice = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      deviceType,
      brand,
      model,
      purchaseYear,
      condition,
      issues,
      repairCost,
      userWantsToSell,
      batteryHealthPercent,
    } = req.body;

    const deviceId = generateDeviceId();

    const device = new Device({
      deviceId,
      userId,
      deviceType,
      brand,
      model,
      purchaseYear,
      condition,
      issues: issues || [],
      repairCost: repairCost || 0,
      userWantsToSell: userWantsToSell || false,
      batteryHealthPercent: batteryHealthPercent !== undefined ? batteryHealthPercent : null,
      status: 'REGISTERED',
      lifecycleEvents: [],
    });

    addLifecycleEvent(device, EVENT_TYPES.DEVICE_REGISTERED, `Device registered: ${brand} ${model}`);
    await device.save();

    const devObj = device.toJSON();
    const journeyProgress = calculateJourneyProgress(devObj.status, devObj.chosenPath);

    return res.status(201).json({
      success: true,
      data: {
        ...devObj,
        journeyProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDevices = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rawDevices = await Device.find({ userId }).sort({ createdAt: -1 });

    const devices = rawDevices.map((d) => {
      const devObj = d.toJSON();
      return {
        ...devObj,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      };
    });

    return res.status(200).json({
      success: true,
      data: { devices },
    });
  } catch (error) {
    next(error);
  }
};

const getDeviceById = async (req, res, next) => {
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
        message: 'Access denied. You do not own this device.',
        details: [],
      });
    }

    const devObj = device.toJSON();
    const journeyProgress = calculateJourneyProgress(devObj.status, devObj.chosenPath);

    return res.status(200).json({
      success: true,
      data: {
        ...devObj,
        journeyProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadDeviceImage = async (req, res, next) => {
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided in "image" form-data field.',
        details: [],
      });
    }

    const imageUrl = await saveFile(req.file);
    device.imageUrl = imageUrl;
    await device.save();

    const devObj = device.toJSON();
    return res.status(200).json({
      success: true,
      data: {
        ...devObj,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      },
    });
  } catch (error) {
    next(error);
  }
};

const addRepairRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, cost, date, batteryHealthPercent } = req.body;

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

    if (!device.repairHistory) device.repairHistory = [];
    device.repairHistory.push({
      description,
      cost,
      date: date ? new Date(date) : new Date(),
    });

    if (batteryHealthPercent !== undefined) {
      device.batteryHealthPercent = batteryHealthPercent;
    }

    device.status = 'REPAIRED';
    addLifecycleEvent(
      device,
      EVENT_TYPES.REPAIR_COMPLETED,
      `Repair completed: ${description} (Cost: ₹${cost})`
    );

    await device.save();

    const devObj = device.toJSON();
    return res.status(200).json({
      success: true,
      data: {
        ...devObj,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteDevice = async (req, res, next) => {
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

    await Device.deleteOne({ deviceId: id });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Device deleted successfully.',
        deviceId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDevice,
  getDevices,
  getDeviceById,
  uploadDeviceImage,
  addRepairRecord,
  deleteDevice,
};
