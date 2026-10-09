const calculateJourneyProgress = (status, chosenPath) => {
  let steps = ['Device Registered', 'Device Assessed', 'Path Selected'];

  if (chosenPath === 'SELL_OR_DONATE') {
    steps.push('Data Safety Checklist', 'Verification Certificate', 'Transfer / Resell / Donate', 'History Updated');
  } else if (chosenPath === 'CONTINUE_OR_REPAIR') {
    steps.push('Repair / Maintenance', 'History Updated');
  } else if (chosenPath === 'REPURPOSE') {
    steps.push('Repurpose Project', 'History Updated');
  } else if (chosenPath === 'RECYCLE') {
    steps.push('E-Waste Recycling', 'History Updated');
  } else {
    steps.push('Action Branch', 'History Updated');
  }

  const completedSteps = [];

  // Step 1: Registered
  if (['REGISTERED', 'ASSESSED', 'PATH_SELECTED', 'REPAIRED', 'SAFETY_IN_PROGRESS', 'SAFETY_COMPLETED', 'TRANSFER_READY', 'TRANSFERRED', 'DONATED', 'REPURPOSED', 'RECYCLED', 'IN_USE'].includes(status)) {
    completedSteps.push('Device Registered');
  }

  // Step 2: Assessed
  if (['ASSESSED', 'PATH_SELECTED', 'REPAIRED', 'SAFETY_IN_PROGRESS', 'SAFETY_COMPLETED', 'TRANSFER_READY', 'TRANSFERRED', 'DONATED', 'REPURPOSED', 'RECYCLED', 'IN_USE'].includes(status)) {
    completedSteps.push('Device Assessed');
  }

  // Step 3: Path Selected
  if (['PATH_SELECTED', 'REPAIRED', 'SAFETY_IN_PROGRESS', 'SAFETY_COMPLETED', 'TRANSFER_READY', 'TRANSFERRED', 'DONATED', 'REPURPOSED', 'RECYCLED', 'IN_USE'].includes(status)) {
    completedSteps.push('Path Selected');
  }

  // Branch Specific Completion logic
  if (chosenPath === 'SELL_OR_DONATE') {
    if (['SAFETY_COMPLETED', 'TRANSFER_READY', 'TRANSFERRED', 'DONATED'].includes(status)) {
      completedSteps.push('Data Safety Checklist');
    }
    if (['TRANSFER_READY', 'TRANSFERRED', 'DONATED'].includes(status)) {
      completedSteps.push('Verification Certificate');
    }
    if (['TRANSFERRED', 'DONATED'].includes(status)) {
      completedSteps.push('Transfer / Resell / Donate');
      completedSteps.push('History Updated');
    }
  } else if (chosenPath === 'CONTINUE_OR_REPAIR') {
    if (['REPAIRED', 'IN_USE'].includes(status)) {
      completedSteps.push('Repair / Maintenance');
    }
    if (status === 'IN_USE') {
      completedSteps.push('History Updated');
    }
  } else if (chosenPath === 'REPURPOSE') {
    if (status === 'REPURPOSED') {
      completedSteps.push('Repurpose Project');
      completedSteps.push('History Updated');
    }
  } else if (chosenPath === 'RECYCLE') {
    if (status === 'RECYCLED') {
      completedSteps.push('E-Waste Recycling');
      completedSteps.push('History Updated');
    }
  } else {
    if (['TRANSFERRED', 'DONATED', 'REPURPOSED', 'RECYCLED', 'IN_USE'].includes(status)) {
      completedSteps.push('Action Branch');
      completedSteps.push('History Updated');
    }
  }

  const totalStepsCount = steps.length;
  const completedStepsCount = completedSteps.length;
  const percent = Math.min(100, Math.round((completedStepsCount / totalStepsCount) * 100));

  let currentStep = steps[0];
  for (const step of steps) {
    if (!completedSteps.includes(step)) {
      currentStep = step;
      break;
    }
  }
  if (completedStepsCount === totalStepsCount) {
    currentStep = steps[steps.length - 1];
  }

  return {
    currentStep,
    completedSteps,
    percent,
  };
};

module.exports = {
  calculateJourneyProgress,
};
