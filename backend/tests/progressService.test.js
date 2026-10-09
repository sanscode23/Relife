const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateJourneyProgress } = require('../services/progressService');

test('Progress Service: Initial REGISTERED status', () => {
  const result = calculateJourneyProgress('REGISTERED', null);
  assert.equal(result.currentStep, 'Device Assessed');
  assert.deepEqual(result.completedSteps, ['Device Registered']);
  assert.ok(result.percent > 0 && result.percent < 50);
});

test('Progress Service: Completed SELL_OR_DONATE path with certificate', () => {
  const result = calculateJourneyProgress('TRANSFER_READY', 'SELL_OR_DONATE');
  assert.equal(result.currentStep, 'Transfer / Resell / Donate');
  assert.ok(result.completedSteps.includes('Data Safety Checklist'));
  assert.ok(result.completedSteps.includes('Verification Certificate'));
  assert.ok(result.percent >= 70);
});
