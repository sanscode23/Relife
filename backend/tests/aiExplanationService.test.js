const test = require('node:test');
const assert = require('node:assert/strict');
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');

process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/relife-test';
process.env.JWT_SECRET = 'test-only-secret';
process.env.AI_PROVIDER = 'bedrock';
process.env.AI_MODEL_ID = 'test-model';
process.env.AWS_REGION = 'ap-south-1';

const originalSend = BedrockRuntimeClient.prototype.send;
const { generateAiExplanation, polishListingDescription } = require('../services/aiExplanationService');

const withMockedBedrock = async (mockSend, callback) => {
  BedrockRuntimeClient.prototype.send = mockSend;
  try {
    await callback();
  } finally {
    BedrockRuntimeClient.prototype.send = originalSend;
  }
};

test('Bedrock explanations include the recommendation and return generated text', async () => {
  await withMockedBedrock(async (command) => {
    assert.equal(command.input.modelId, 'test-model');
    assert.match(command.input.messages[0].content[0].text, /REPAIR_AND_RESELL/);
    return {
      output: {
        message: {
          content: [{ text: 'Repairing this device is worthwhile because the repair cost is reasonable. It can remain useful for longer.' }],
        },
      },
    };
  }, async () => {
    const result = await generateAiExplanation(
      {
        brand: 'Dell',
        model: 'Inspiron',
        deviceType: 'LAPTOP',
        purchaseYear: 2022,
        condition: 'FAIR',
        issues: ['weak battery'],
        repairCost: 3000,
      },
      {
        action: 'REPAIR_AND_RESELL',
        reason: 'Repair cost is economically viable.',
      }
    );

    assert.equal(
      result,
      'Repairing this device is worthwhile because the repair cost is reasonable. It can remain useful for longer.'
    );
  });
});

test('Bedrock listing descriptions include verified certificate facts', async () => {
  await withMockedBedrock(async (command) => {
    const prompt = command.input.messages[0].content[0].text;
    assert.match(prompt, /Verification ID: RL-TEST-1/);
    return {
      output: {
        message: {
          content: [{ text: 'Verified Dell Inspiron laptop in fair condition. Data safety checks are complete. Certificate RL-TEST-1 is ready for verification.' }],
        },
      },
    };
  }, async () => {
    const result = await polishListingDescription(
      {
        brand: 'Dell',
        model: 'Inspiron',
        purchaseYear: 2022,
        condition: 'FAIR',
      },
      { verificationId: 'RL-TEST-1' }
    );

    assert.equal(
      result,
      'Verified Dell Inspiron laptop in fair condition. Data safety checks are complete. Certificate RL-TEST-1 is ready for verification.'
    );
  });
});
