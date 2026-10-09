const { estimateValuation } = require('./valuationService');

const calculateRepairComparison = (device) => {
  const valuation = estimateValuation(device);
  const repairCost = device.repairCost || 0;
  const estimatedValueBeforeRepair = valuation.estimatedValueBeforeRepair;
  const estimatedValueAfterRepair = valuation.estimatedValueAfterRepair;

  const costRatioPercent = Math.min(
    100,
    Math.round((repairCost / Math.max(1, estimatedValueAfterRepair)) * 100)
  );

  let verdict = 'REPAIR';
  let summary = '';
  let expectedExtraLifeYears = '2-3 years';

  if (repairCost === 0) {
    verdict = 'REPAIR';
    summary = `No repair is currently required. Device is valued at ₹${estimatedValueBeforeRepair.toLocaleString('en-IN')}.`;
    expectedExtraLifeYears = '3-4 years';
  } else if (costRatioPercent <= 35) {
    verdict = 'REPAIR';
    summary = `Spending ₹${repairCost.toLocaleString('en-IN')} on repair is highly economical compared to buying a replacement valued at ₹${estimatedValueAfterRepair.toLocaleString('en-IN')}.`;
    expectedExtraLifeYears = '2-3 years';
  } else if (costRatioPercent <= 60) {
    verdict = 'BORDERLINE';
    summary = `Repairing for ₹${repairCost.toLocaleString('en-IN')} represents ${costRatioPercent}% of post-repair value (₹${estimatedValueAfterRepair.toLocaleString('en-IN')}); consider remaining hardware lifetime before deciding.`;
    expectedExtraLifeYears = '1-2 years';
  } else {
    verdict = 'DONT_REPAIR';
    summary = `Repair cost (₹${repairCost.toLocaleString('en-IN')}) exceeds sensible economic threshold relative to device post-repair value (₹${estimatedValueAfterRepair.toLocaleString('en-IN')}). Discard or repurpose recommended.`;
    expectedExtraLifeYears = 'N/A';
  }

  return {
    repairCost,
    estimatedValueBeforeRepair,
    estimatedValueAfterRepair,
    costRatioPercent,
    expectedExtraLifeYears,
    verdict,
    summary,
  };
};

module.exports = {
  calculateRepairComparison,
};
