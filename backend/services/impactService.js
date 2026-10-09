const Device = require('../models/Device');

const getImpactMetrics = async (userId = null) => {
  const query = userId ? { userId } : {};

  const devices = await Device.find(query);

  const devicesAssessed = devices.filter((d) => d.status !== 'REGISTERED').length;
  const continuedUse = devices.filter(
    (d) => d.status === 'IN_USE' || d.chosenPath === 'CONTINUE_OR_REPAIR'
  ).length;
  const repaired = devices.filter(
    (d) => d.status === 'REPAIRED' || (d.repairHistory && d.repairHistory.length > 0)
  ).length;
  const transferredOrDonated = devices.filter((d) =>
    ['TRANSFERRED', 'DONATED', 'TRANSFER_READY', 'SAFETY_COMPLETED'].includes(d.status)
  ).length;
  const repurposed = devices.filter((d) => d.status === 'REPURPOSED' || d.chosenPath === 'REPURPOSE').length;
  const sentToRecycling = devices.filter((d) => d.status === 'RECYCLED' || d.chosenPath === 'RECYCLE').length;

  const totalTransfers = transferredOrDonated;
  const transfersWithSafetyCheck = devices.filter(
    (d) => ['TRANSFERRED', 'DONATED', 'TRANSFER_READY'].includes(d.status) && d.dataSafety?.completed
  ).length;

  const transfersWithSafetyCheckPercent = totalTransfers > 0
    ? Math.round((transfersWithSafetyCheck / totalTransfers) * 100)
    : 100;

  const estimatedExtraLifeYears = (devicesAssessed * 2.5).toFixed(1);
  const estimatedDevicesDiverted = devices.length - sentToRecycling;

  return {
    totalDevices: devices.length,
    devicesAssessed,
    continuedUse,
    repaired,
    transferredOrDonated,
    repurposed,
    sentToRecycling,
    transfersWithSafetyCheckPercent,
    estimatedExtraLifeYears: parseFloat(estimatedExtraLifeYears),
    estimatedDevicesDiverted: Math.max(0, estimatedDevicesDiverted),
  };
};

module.exports = {
  getImpactMetrics,
};
