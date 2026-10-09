const BASE_VALUES_INR = {
  LAPTOP: 50000,
  PHONE: 30000,
  TABLET: 25000,
  DESKTOP: 45000,
  ROUTER: 4000,
  OTHER: 10000,
};

const getDepreciationRatio = (age) => {
  if (age <= 1) return 0.75;
  if (age === 2) return 0.55;
  if (age === 3) return 0.40;
  if (age === 4) return 0.30;
  const val = 0.20 - (age - 5) * 0.03;
  return Math.max(0.08, val);
};

const getConditionMultiplier = (condition) => {
  switch (condition) {
    case 'GOOD':
      return 1.0;
    case 'FAIR':
      return 0.7;
    case 'POOR':
      return 0.35;
    default:
      return 0.7;
  }
};

const estimateValuation = (device) => {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - (device.purchaseYear || currentYear));
  const basePrice = BASE_VALUES_INR[device.deviceType] || 15000;
  const deprecRatio = getDepreciationRatio(age);
  const condMult = getConditionMultiplier(device.condition);

  const baseAgeValue = basePrice * deprecRatio;
  let estimatedValueBeforeRepair = Math.round(baseAgeValue * condMult);

  // If there are repair costs, current raw value before fixing is reduced
  const repairCost = device.repairCost || 0;
  if (repairCost > 0) {
    estimatedValueBeforeRepair = Math.max(0, estimatedValueBeforeRepair - Math.round(repairCost * 0.5));
  }

  // Value after repair: condition improves to GOOD if repaired properly, or stays GOOD
  const repairedCondMult = device.condition === 'POOR' ? 0.75 : 0.95;
  const estimatedValueAfterRepair = Math.round(baseAgeValue * repairedCondMult);

  const minResale = Math.round(estimatedValueAfterRepair * 0.85);
  const maxResale = Math.round(estimatedValueAfterRepair * 1.15);

  return {
    estimatedValueBeforeRepair,
    estimatedValueAfterRepair,
    potentialResale: {
      min: Math.max(minResale, 500),
      max: Math.max(maxResale, 1000),
    },
    age,
  };
};

module.exports = {
  estimateValuation,
};
