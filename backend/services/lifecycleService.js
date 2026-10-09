const EVENT_TYPES = {
  DEVICE_REGISTERED: 'DEVICE_REGISTERED',
  ASSESSMENT_COMPLETED: 'ASSESSMENT_COMPLETED',
  PATH_SELECTED: 'PATH_SELECTED',
  REPAIR_COMPLETED: 'REPAIR_COMPLETED',
  DATA_SAFETY_COMPLETED: 'DATA_SAFETY_COMPLETED',
  TRANSFER_READY: 'TRANSFER_READY',
  DEVICE_TRANSFERRED: 'DEVICE_TRANSFERRED',
  DEVICE_DONATED: 'DEVICE_DONATED',
  DEVICE_REPURPOSED: 'DEVICE_REPURPOSED',
  DEVICE_RECYCLED: 'DEVICE_RECYCLED',
  DEVICE_CONTINUED: 'DEVICE_CONTINUED',
};

const addLifecycleEvent = (device, type, note = '') => {
  if (!device.lifecycleEvents) {
    device.lifecycleEvents = [];
  }
  device.lifecycleEvents.push({
    type,
    timestamp: new Date(),
    note,
  });
};

module.exports = {
  EVENT_TYPES,
  addLifecycleEvent,
};
