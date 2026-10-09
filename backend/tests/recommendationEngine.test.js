const test = require('node:test');
const assert = require('node:assert/strict');
const { runRecommendationEngine, mapActionToPath } = require('../services/recommendationEngine');

test('Rule 1: GOOD condition laptop, age <= 2, no issues -> CONTINUE_USING', () => {
  const device = {
    deviceType: 'LAPTOP',
    brand: 'Dell',
    model: 'XPS 13',
    purchaseYear: new Date().getFullYear() - 1,
    condition: 'GOOD',
    issues: [],
    repairCost: 0,
    userWantsToSell: false,
  };

  const result = runRecommendationEngine(device);
  assert.equal(result.action, 'CONTINUE_USING');
  assert.equal(result.recommendedPath, 'CONTINUE_OR_REPAIR');
  assert.equal(typeof result.score, 'number');
  assert.ok(result.nextSteps.length > 0);
});

test('Rule 2: GOOD/FAIR device with repairCost > 0, ratio < 40%, userWantsToSell -> REPAIR_AND_RESELL', () => {
  const device = {
    deviceType: 'LAPTOP',
    brand: 'Dell',
    model: 'Inspiron 15',
    purchaseYear: 2022,
    condition: 'GOOD',
    issues: ['degraded battery'],
    repairCost: 3000,
    userWantsToSell: true,
  };

  const result = runRecommendationEngine(device);
  assert.equal(result.action, 'REPAIR_AND_RESELL');
  assert.equal(result.recommendedPath, 'SELL_OR_DONATE');
});

test('Rule 3: GOOD/FAIR device with repairCost > 0, ratio < 40%, userWantsToSell=false -> REPAIR_AND_REUSE', () => {
  const device = {
    deviceType: 'PHONE',
    brand: 'Samsung',
    model: 'Galaxy S21',
    purchaseYear: 2023,
    condition: 'FAIR',
    issues: ['cracked screen'],
    repairCost: 2500,
    userWantsToSell: false,
  };

  const result = runRecommendationEngine(device);
  assert.equal(result.action, 'REPAIR_AND_REUSE');
  assert.equal(result.recommendedPath, 'CONTINUE_OR_REPAIR');
});

test('Rule 4: GOOD condition, no issues, userWantsToSell=true -> SELL', () => {
  const device = {
    deviceType: 'TABLET',
    brand: 'Apple',
    model: 'iPad Air',
    purchaseYear: 2023,
    condition: 'GOOD',
    issues: [],
    repairCost: 0,
    userWantsToSell: true,
  };

  const result = runRecommendationEngine(device);
  assert.equal(result.action, 'SELL');
  assert.equal(result.recommendedPath, 'SELL_OR_DONATE');
});

test('Rule 5: FAIR condition older device, userWantsToSell=true -> DONATE', () => {
  const device = {
    deviceType: 'LAPTOP',
    brand: 'HP',
    model: 'Pavilion',
    purchaseYear: 2020,
    condition: 'FAIR',
    issues: [],
    repairCost: 0,
    userWantsToSell: true,
  };

  const result = runRecommendationEngine(device);
  assert.equal(result.action, 'DONATE');
  assert.equal(result.recommendedPath, 'SELL_OR_DONATE');
});

test('Rule 6: POOR condition device with high repair cost -> RECYCLE', () => {
  const device = {
    deviceType: 'LAPTOP',
    brand: 'Lenovo',
    model: 'ThinkPad',
    purchaseYear: 2017,
    condition: 'POOR',
    issues: ['broken motherboard', 'dead screen'],
    repairCost: 25000,
    userWantsToSell: false,
  };

  const result = runRecommendationEngine(device);
  assert.equal(result.action, 'RECYCLE');
  assert.equal(result.recommendedPath, 'RECYCLE');
});

test('Action to Path Mapping Coverage', () => {
  assert.equal(mapActionToPath('CONTINUE_USING'), 'CONTINUE_OR_REPAIR');
  assert.equal(mapActionToPath('REPAIR_AND_REUSE'), 'CONTINUE_OR_REPAIR');
  assert.equal(mapActionToPath('REPAIR_AND_RESELL'), 'SELL_OR_DONATE');
  assert.equal(mapActionToPath('SELL'), 'SELL_OR_DONATE');
  assert.equal(mapActionToPath('DONATE'), 'SELL_OR_DONATE');
  assert.equal(mapActionToPath('REPURPOSE'), 'REPURPOSE');
  assert.equal(mapActionToPath('COMPONENT_RECOVERY'), 'RECYCLE');
  assert.equal(mapActionToPath('RECYCLE'), 'RECYCLE');
});
