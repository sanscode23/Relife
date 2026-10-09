const { estimateValuation } = require('./valuationService');

const ACTION_TO_PATH_MAP = {
  CONTINUE_USING: 'CONTINUE_OR_REPAIR',
  REPAIR_AND_REUSE: 'CONTINUE_OR_REPAIR',
  REPAIR_AND_RESELL: 'SELL_OR_DONATE',
  SELL: 'SELL_OR_DONATE',
  DONATE: 'SELL_OR_DONATE',
  REPURPOSE: 'REPURPOSE',
  COMPONENT_RECOVERY: 'RECYCLE',
  RECYCLE: 'RECYCLE',
};

const mapActionToPath = (action) => {
  return ACTION_TO_PATH_MAP[action] || 'CONTINUE_OR_REPAIR';
};

const runRecommendationEngine = (device) => {
  const valuation = estimateValuation(device);
  const { age, estimatedValueBeforeRepair, estimatedValueAfterRepair, potentialResale } = valuation;

  const repairCost = device.repairCost || 0;
  const hasIssues = (device.issues && device.issues.length > 0) || repairCost > 0;
  const ratio = estimatedValueAfterRepair > 0 ? repairCost / estimatedValueAfterRepair : 1.0;

  let action = 'CONTINUE_USING';
  let score = 85;
  let reason = '';
  let nextSteps = [];
  let estimatedExtraLifeYears = '2-3';

  // Rule 1: GOOD, no issues, age <= 2 -> CONTINUE_USING
  if (device.condition === 'GOOD' && !hasIssues && age <= 2) {
    action = 'CONTINUE_USING';
    score = 95;
    reason = 'Device is in prime condition with low age. Continuing use minimizes unnecessary electronic replacement.';
    nextSteps = ['Keep software updated', 'Maintain battery health', 'Clean dust filters regularly'];
    estimatedExtraLifeYears = '3-4';
  }
  // Rule 2: GOOD/FAIR, repairCost > 0, repairCost / valueAfterRepair < 40%, userWantsToSell -> REPAIR_AND_RESELL
  else if (
    (device.condition === 'GOOD' || device.condition === 'FAIR') &&
    repairCost > 0 &&
    ratio < 0.40 &&
    device.userWantsToSell
  ) {
    action = 'REPAIR_AND_RESELL';
    score = 88;
    reason = 'Repair cost is low relative to the expected resale value. Fixing the device will maximize return upon sale.';
    nextSteps = ['Perform minor repair', 'Run data safety wipe', 'Obtain verification certificate', 'List on resale marketplace'];
    estimatedExtraLifeYears = '2-3';
  }
  // Rule 3: GOOD/FAIR, repairCost > 0, ratio < 40% -> REPAIR_AND_REUSE
  else if ((device.condition === 'GOOD' || device.condition === 'FAIR') && repairCost > 0 && ratio < 0.40) {
    action = 'REPAIR_AND_REUSE';
    score = 85;
    reason = 'Minor repair restores full functionality for a fraction of the price of a replacement device.';
    nextSteps = ['Replace broken component', 'Verify hardware functionality', 'Continue daily usage'];
    estimatedExtraLifeYears = '2-3';
  }
  // Rule 4: GOOD, no issues, userWantsToSell -> SELL
  else if (device.condition === 'GOOD' && !hasIssues && device.userWantsToSell) {
    action = 'SELL';
    score = 90;
    reason = 'Device is fully functional and ready for resale. High second-hand demand exists for this model.';
    nextSteps = ['Backup personal data', 'Perform factory reset', 'Generate verification certificate', 'List online'];
    estimatedExtraLifeYears = '2-4';
  }
  // Rule 5: FAIR, functional, low resale value or older -> DONATE or REPURPOSE
  else if (device.condition === 'FAIR' && (!hasIssues || ratio < 0.5) && (age >= 4 || estimatedValueBeforeRepair < 4000)) {
    if (device.userWantsToSell) {
      action = 'DONATE';
      score = 78;
      reason = 'Device is functional but has modest commercial value. Donating provides high social impact.';
      nextSteps = ['Perform data safety wipe', 'Generate donation verification', 'Hand off to certified NGO or school'];
      estimatedExtraLifeYears = '1-2';
    } else {
      action = 'REPURPOSE';
      score = 80;
      reason = 'Device is older but functional. Repurposing it into a specialized dedicated appliance gives it a new role.';
      nextSteps = ['Select repurposing project', 'Install lightweight Linux/OS', 'Configure for dedicated home use'];
      estimatedExtraLifeYears = '2-3';
    }
  }
  // Rule 6: POOR and repairCost > estimated value -> RECYCLE (COMPONENT_RECOVERY if parts reusable)
  else if (device.condition === 'POOR' && (repairCost >= estimatedValueAfterRepair || ratio > 0.8)) {
    if (device.repairHistory && device.repairHistory.length > 0) {
      action = 'COMPONENT_RECOVERY';
      score = 70;
      reason = 'Uneconomical to repair completely, but individual components (screen/RAM/casing) can be salvaged.';
      nextSteps = ['Safe disassembly', 'Harvest functional spare parts', 'Send remaining chassis to e-waste recycler'];
      estimatedExtraLifeYears = 'N/A';
    } else {
      action = 'RECYCLE';
      score = 65;
      reason = 'Device has severe degradation and high repair costs. Responsible recycling recovers precious raw materials.';
      nextSteps = ['Sanitize storage or physically destroy drive', 'Locate authorized e-waste collection center', 'Drop off for recycling'];
      estimatedExtraLifeYears = 'N/A';
    }
  }
  // Rule 7: Fallback by age / condition -> REPURPOSE or RECYCLE
  else {
    if (device.condition === 'POOR' || age >= 6) {
      action = 'RECYCLE';
      score = 60;
      reason = 'Device is at end of lifecycle. Responsible recycling prevents hazardous materials from reaching landfills.';
      nextSteps = ['Remove confidential data', 'Find local e-waste drop-off point', 'Recycle responsibly'];
      estimatedExtraLifeYears = 'N/A';
    } else {
      action = 'REPURPOSE';
      score = 72;
      reason = 'Device has remaining life for lightweight secondary tasks like a digital photo frame or media server.';
      nextSteps = ['Choose project idea', 'Set up dedicated software', 'Deploy in home network'];
      estimatedExtraLifeYears = '1-3';
    }
  }

  const recommendedPath = mapActionToPath(action);

  return {
    action,
    recommendedPath,
    score,
    reason,
    nextSteps,
    estimatedExtraLifeYears,
    potentialResale,
  };
};

module.exports = {
  ACTION_TO_PATH_MAP,
  mapActionToPath,
  runRecommendationEngine,
};
