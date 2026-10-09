const env = require('../config/env');
const { generateAiExplanation } = require('../services/aiExplanationService');

const runAiTest = async () => {
  console.log('🤖 Testing Amazon Bedrock AI Connection...');
  console.log(`   - AI Provider: ${env.AI_PROVIDER}`);
  console.log(`   - Model ID: ${env.AI_MODEL_ID}`);
  console.log(`   - Region: ${env.AWS_REGION}`);

  const demoDevice = {
    deviceType: 'LAPTOP',
    brand: 'Dell',
    model: 'Inspiron 15',
    purchaseYear: 2022,
    condition: 'FAIR',
    issues: ['weak battery'],
    repairCost: 3000,
  };

  const demoRecommendation = {
    action: 'REPAIR_AND_RESELL',
    reason: 'Repair cost (₹3,000) is under 40% of post-repair value (₹16,000), maximizing return upon resale.',
  };

  try {
    const result = await generateAiExplanation(demoDevice, demoRecommendation);

    if (result) {
      console.log('✅ Bedrock Invocation Successful!');
      console.log('📝 AI Explanation Result:\n');
      console.log(`"${result}"\n`);
    } else {
      console.log('⚠️ Bedrock call returned null (Fallback active).');
      console.log('💡 Troubleshooting Tips:');
      console.log('   1. Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env or via "aws configure"');
      console.log('   2. Ensure the model/inference profile ID is enabled in region: ' + env.AWS_REGION);
      console.log('   3. In Bedrock Console, check if Model Access has been requested and granted.');
    }
  } catch (err) {
    console.error('❌ AI Test Error:', err.message);
  }
};

runAiTest();
