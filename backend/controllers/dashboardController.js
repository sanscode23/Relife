const Device = require('../models/Device');
const User = require('../models/User');
const { calculateJourneyProgress } = require('../services/progressService');

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ userId });

    const rawDevices = await Device.find({ userId }).sort({ updatedAt: -1 });

    const devices = rawDevices.map((device) => {
      const devObj = device.toJSON();
      const journeyProgress = calculateJourneyProgress(devObj.status, devObj.chosenPath);
      return {
        ...devObj,
        journeyProgress,
      };
    });

    const totalDevices = devices.length;
    const assessed = devices.filter((d) => d.status !== 'REGISTERED').length;
    const inProgress = devices.filter((d) =>
      ['REGISTERED', 'ASSESSED', 'PATH_SELECTED', 'REPAIRED', 'SAFETY_IN_PROGRESS', 'SAFETY_COMPLETED'].includes(d.status)
    ).length;
    const transferReady = devices.filter((d) => d.status === 'TRANSFER_READY').length;
    const completed = devices.filter((d) =>
      ['TRANSFERRED', 'DONATED', 'REPURPOSED', 'RECYCLED', 'IN_USE'].includes(d.status)
    ).length;

    const pendingActions = [];
    devices.forEach((d) => {
      if (d.status === 'REGISTERED') {
        pendingActions.push({
          deviceId: d.deviceId,
          deviceSummary: `${d.brand} ${d.model}`,
          type: 'RUN_ASSESSMENT',
          message: 'Device registered. Run AI Assessment to find optimal second-life path.',
        });
      } else if (d.status === 'ASSESSED') {
        pendingActions.push({
          deviceId: d.deviceId,
          deviceSummary: `${d.brand} ${d.model}`,
          type: 'SELECT_PATH',
          message: 'Assessment completed. Select your preferred action pathway.',
        });
      } else if (d.status === 'PATH_SELECTED' && d.chosenPath === 'SELL_OR_DONATE') {
        pendingActions.push({
          deviceId: d.deviceId,
          deviceSummary: `${d.brand} ${d.model}`,
          type: 'COMPLETE_DATA_SAFETY',
          message: 'Complete the 5-step data safety checklist to enable certificate issuance.',
        });
      } else if (d.status === 'SAFETY_COMPLETED') {
        pendingActions.push({
          deviceId: d.deviceId,
          deviceSummary: `${d.brand} ${d.model}`,
          type: 'GENERATE_CERTIFICATE',
          message: 'Data safety completed! Issue Verification Certificate.',
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          role: user.role,
          email: user.email,
        },
        stats: {
          totalDevices,
          assessed,
          inProgress,
          transferReady,
          completed,
        },
        devices,
        pendingActions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
