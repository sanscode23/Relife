const dotenv = require('dotenv');
const { z } = require('zod');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string({
    required_error: "MONGO_URI environment variable is required",
  }),
  JWT_SECRET: z.string({
    required_error: "JWT_SECRET environment variable is required",
  }),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  PUBLIC_VERIFY_BASE_URL: z.string().default('http://localhost:5173/verify'),
  AI_PROVIDER: z.enum(['none', 'bedrock']).default('bedrock'),
  AI_MODEL_ID: z.string().optional().default('apac.amazon.nova-lite-v1:0'),
  AI_ROLE: z.enum(['EXPLAIN_ONLY', 'HYBRID']).default('EXPLAIN_ONLY'),
  AWS_REGION: z.string().default('ap-south-1'),
  S3_BUCKET: z.string().optional().default('relife-uploads'),
  IMAGE_STORAGE: z.enum(['local', 's3']).default('local'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error('❌ Failed to load environment configuration:', error);
  }
  process.exit(1);
}

const allowedOrigins = env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean);
if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}

module.exports = {
  ...env,
  allowedOrigins,
};
