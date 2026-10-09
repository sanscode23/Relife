const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const env = require('../config/env');

let bedrockClient = null;
if (env.AI_PROVIDER === 'bedrock') {
  try {
    const config = {
      region: env.AWS_REGION,
    };
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      };
    }
    bedrockClient = new BedrockRuntimeClient(config);
  } catch (err) {
    console.warn('⚠️ Could not initialize Bedrock client:', err.message);
    bedrockClient = null;
  }
}

const generateAiExplanation = async (device, recommendation) => {
  if (env.AI_PROVIDER === 'none' || !bedrockClient || !env.AI_MODEL_ID) {
    return null;
  }

  const prompt = `You are RE:LIFE AI, a helpful second-life electronics assistant.
Given the following device facts and decision, write a concise, friendly 2-to-3 sentence explanation for the user. Do not invent any facts. Do not change the recommended action.

Device: ${device.brand} ${device.model} (${device.deviceType}, Purchased: ${device.purchaseYear})
Condition: ${device.condition}
Issues: ${device.issues && device.issues.length ? device.issues.join(', ') : 'None'}
Repair Cost: ₹${device.repairCost || 0}
Recommended Action: ${recommendation.action}
Rule Reason: ${recommendation.reason}

Write a natural, encouraging 2-3 sentence explanation explaining why ${recommendation.action} is the best path for this device.`;

  const input = {
    modelId: env.AI_MODEL_ID,
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      temperature: 0.3,
      maxTokens: 200,
    },
  };

  try {
    const command = new ConverseCommand(input);

    // 6-second timeout wrapper
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Bedrock call timed out (6s)')), 6000)
    );

    const response = await Promise.race([bedrockClient.send(command), timeoutPromise]);

    const outputText = response?.output?.message?.content?.[0]?.text;
    if (outputText && typeof outputText === 'string') {
      return outputText.trim();
    }
    return null;
  } catch (error) {
    console.warn(`[AI Service Fallback] Bedrock error (${error.name || 'Error'}): ${error.message}`);
    return null;
  }
};

const polishListingDescription = async (device, certificate) => {
  const defaultDescription = `Verified Second-Hand ${device.brand} ${device.model} (${device.purchaseYear}) in ${device.condition} condition. RE:LIFE Data Safety Checklist completed (${certificate.verificationId}). Clean hardware status.`;

  if (env.AI_PROVIDER === 'none' || !bedrockClient || !env.AI_MODEL_ID) {
    return defaultDescription;
  }

  const prompt = `Create a sleek 3-line marketplace listing description for this verified pre-owned electronics device:
Device: ${device.brand} ${device.model} (${device.purchaseYear})
Condition: ${device.condition}
Verification ID: ${certificate.verificationId}
Data Safety Status: Fully Sanitized & Verified

Strict rule: Use ONLY the provided verified facts. Return only the description text.`;

  const input = {
    modelId: env.AI_MODEL_ID,
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      temperature: 0.3,
      maxTokens: 200,
    },
  };

  try {
    const command = new ConverseCommand(input);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Bedrock timeout')), 6000)
    );
    const response = await Promise.race([bedrockClient.send(command), timeoutPromise]);
    const text = response?.output?.message?.content?.[0]?.text;
    return text ? text.trim() : defaultDescription;
  } catch (err) {
    return defaultDescription;
  }
};

module.exports = {
  generateAiExplanation,
  polishListingDescription,
};
