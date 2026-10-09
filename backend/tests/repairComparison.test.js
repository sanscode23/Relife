const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateRepairComparison } = require('../services/repairComparisonService');

test('Repair Comparison: Low cost repair gives REPAIR verdict', () => {
  const device = {
    deviceType: 'LAPTOP',
    brand: 'Dell',
    model: 'Inspiron 15',
    purchaseYear: 2022,
    condition: 'GOOD',
    repairCost: 3000,
  };

  const comparison = calculateRepairComparison(device);
  assert.equal(comparison.verdict, 'REPAIR');
  assert.ok(comparison.costRatioPercent <= 35);
  assert.ok(comparison.summary.includes('highly economical'));
});

test('Repair Comparison: High cost repair relative to post-repair value gives DONT_REPAIR verdict', () => {
  const device = {
    deviceType: 'ROUTER',
    brand: 'TP-Link',
    model: 'Archer',
    purchaseYear: 2020,
    condition: 'POOR',
    repairCost: 5000,
  };

  const comparison = calculateRepairComparison(device);
  assert.equal(comparison.verdict, 'DONT_REPAIR');
  assert.ok(comparison.summary.includes('exceeds sensible economic threshold'));
});
