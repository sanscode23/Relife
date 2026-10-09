const Device = require('../models/Device');
const { addLifecycleEvent, EVENT_TYPES } = require('../services/lifecycleService');
const { calculateJourneyProgress } = require('../services/progressService');

const getSafetyStatus = async (req, res, next) => {
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

    return res.status(200).json({
      success: true,
      data: {
        deviceId: device.deviceId,
        chosenPath: device.chosenPath,
        dataSafety: device.dataSafety,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateSafetyChecklist = async (req, res, next) => {
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

    // Critical rule check
    if (device.chosenPath !== 'SELL_OR_DONATE') {
      return res.status(409).json({
        success: false,
        message: `Data safety checklist is only applicable when chosen path is 'SELL_OR_DONATE'. Current path is '${device.chosenPath || 'NONE'}'.`,
        details: [],
      });
    }

    const { backup, accountsRemoved, encryptionChecked, factoryReset, storageSanitized } = req.body;

    const itemKeys = ['backup', 'accountsRemoved', 'encryptionChecked', 'factoryReset', 'storageSanitized'];
    const payloadMap = { backup, accountsRemoved, encryptionChecked, factoryReset, storageSanitized };

    if (!device.dataSafety) {
      device.dataSafety = { completed: false, items: {} };
    }

    itemKeys.forEach((key) => {
      if (payloadMap[key] !== undefined) {
        const itemInput = payloadMap[key];
        const isDone = Boolean(itemInput.done);
        device.dataSafety.items[key] = {
          done: isDone,
          verification: isDone ? 'USER_VERIFIED' : 'NOT_VERIFIED',
          evidence: itemInput.evidence || '',
          updatedAt: new Date(),
        };
      }
    });

    const items = device.dataSafety.items;
    const allCompleted = itemKeys.every((key) => items[key] && items[key].done);

    if (allCompleted) {
      device.dataSafety.completed = true;
      if (device.status !== 'TRANSFER_READY' && device.status !== 'TRANSFERRED' && device.status !== 'DONATED') {
        device.status = 'SAFETY_COMPLETED';
      }
      addLifecycleEvent(
        device,
        EVENT_TYPES.DATA_SAFETY_COMPLETED,
        'Data safety checklist fully completed and user verified.'
      );
    } else {
      device.dataSafety.completed = false;
      if (['PATH_SELECTED', 'REPAIRED'].includes(device.status)) {
        device.status = 'SAFETY_IN_PROGRESS';
      }
    }

    await device.save();

    const devObj = device.toJSON();

    return res.status(200).json({
      success: true,
      data: {
        deviceId: device.deviceId,
        status: device.status,
        dataSafety: device.dataSafety,
        journeyProgress: calculateJourneyProgress(devObj.status, devObj.chosenPath),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSafetyStatus,
  updateSafetyChecklist,
};
