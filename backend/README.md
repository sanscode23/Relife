# RE:LIFE Backend Server

RE:LIFE is an AI-powered second-life platform for electronics. It acts as a trust and decision layer that guides users through extending the lifespan of old or damaged devices, ensuring data safety, and providing verifiable certificates for resale, donation, repurposing, or responsible recycling.

---

## 🚀 Getting Started

### 1. Installation

```bash
cd server
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configured Environment Variables:

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Server HTTP port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB Atlas / local URI | `mongodb://127.0.0.1:27017/relife` |
| `JWT_SECRET` | Secret key for JWT signing | `relife_super_secret_jwt_key_2026_change_in_prod` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `CLIENT_URL` | Allowed frontend origins (comma-separated) | `http://localhost:5173` |
| `PUBLIC_VERIFY_BASE_URL` | Base URL for QR code public verification page | `http://localhost:5173/verify` |
| `AI_PROVIDER` | AI provider (`bedrock` or `none`) | `bedrock` |
| `AI_MODEL_ID` | Amazon Bedrock Model ID or Inference Profile ID | `apac.amazon.nova-lite-v1:0` |
| `AI_ROLE` | AI role mode (`EXPLAIN_ONLY` or `HYBRID`) | `EXPLAIN_ONLY` |
| `AWS_REGION` | AWS region where Bedrock model access is enabled | `ap-south-1` |
| `IMAGE_STORAGE` | Image storage provider (`local` or `s3`) | `local` |
| `S3_BUCKET` | S3 bucket name if `IMAGE_STORAGE=s3` | `relife-uploads` |
| `AWS_ACCESS_KEY_ID` | (Optional local dev) AWS Access Key ID | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | (Optional local dev) AWS Secret Access Key | `wJalrX...` |

---

## 🤖 Amazon Bedrock Setup Guide

RE:LIFE uses AWS Bedrock's `ConverseCommand` API (via `@aws-sdk/client-bedrock-runtime`) for natural language explanations.

1. **Enable Model Access**: In the AWS Console, navigate to Amazon Bedrock -> Model Access, and ensure model access is granted for your target model (e.g., `apac.amazon.nova-lite-v1:0` or `anthropic.claude-3-haiku-20240307-v1:0`) in your selected region (`AWS_REGION`).
2. **Local Development**:
   - Option A: Configure AWS CLI credentials via `aws configure`.
   - Option B: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `server/.env`.
3. **Production Deployment (AWS App Runner / Elastic Beanstalk)**:
   - Do **NOT** include secret keys in environment variables on production servers.
   - Attach an IAM Role to your service with the policy `bedrock:InvokeModel`.
4. **Test Connection**:
   ```bash
   npm run test:ai
   ```
   If credentials or model access are absent, RE:LIFE silently falls back to deterministic rule-based reasons without throwing errors.

---

## 📊 Recommendation Engine Rule Table

The pure deterministic engine evaluates rules in top-down order (first match wins):

| Rule | Condition Criteria | Action Output | Mapped Pathway |
|---|---|---|---|
| **1** | Condition `GOOD`, no issues, age <= 2 years | `CONTINUE_USING` | `CONTINUE_OR_REPAIR` |
| **2** | Condition `GOOD`/`FAIR`, repairCost > 0, repairCost / valueAfterRepair < 40%, userWantsToSell = true | `REPAIR_AND_RESELL` | `SELL_OR_DONATE` |
| **3** | Condition `GOOD`/`FAIR`, repairCost > 0, ratio < 40% | `REPAIR_AND_REUSE` | `CONTINUE_OR_REPAIR` |
| **4** | Condition `GOOD`, no issues, userWantsToSell = true | `SELL` | `SELL_OR_DONATE` |
| **5** | Condition `FAIR`, functional, low resale value or age >= 4 | `DONATE` or `REPURPOSE` | `SELL_OR_DONATE` / `REPURPOSE` |
| **6** | Condition `POOR` and repairCost >= valueAfterRepair | `RECYCLE` / `COMPONENT_RECOVERY` | `RECYCLE` |
| **7** | Fallback by age and condition | `REPURPOSE` or `RECYCLE` | `REPURPOSE` / `RECYCLE` |

---

## 🛠️ Commands & Scripts

- `npm run dev`: Start Express development server with nodemon (`http://localhost:5000`).
- `npm start`: Start server in production mode.
- `npm run seed`: Seed database with Demo Guest user and `DEMO_DEVICE` (Dell Inspiron 15) through full journey.
- `npm test`: Run built-in unit test suite (Node `--test`).
- `npm run test:ai`: Test AWS Bedrock connection.

---

## 🧪 End-to-End API Curl Flow Example

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### 2. Login as Guest
```bash
curl -X POST http://localhost:5000/api/auth/guest
# Save returned token: TOKEN="<paste_token_here>"
```

### 3. Register Device
```bash
curl -X POST http://localhost:5000/api/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceType":"LAPTOP","brand":"Dell","model":"Inspiron 15","purchaseYear":2022,"condition":"FAIR","issues":["weak battery"],"repairCost":3000,"userWantsToSell":true}'
# Save deviceId: DEVICE_ID="dev_..."
```

### 4. Run Assessment
```bash
curl -X POST http://localhost:5000/api/devices/$DEVICE_ID/assessment \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Select Path
```bash
curl -X POST http://localhost:5000/api/devices/$DEVICE_ID/path \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path":"SELL_OR_DONATE"}'
```

### 6. Add Repair Record
```bash
curl -X POST http://localhost:5000/api/devices/$DEVICE_ID/repairs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Replaced battery with OEM cell","cost":3000}'
```

### 7. Complete Data Safety Checklist
```bash
curl -X PATCH http://localhost:5000/api/devices/$DEVICE_ID/safety \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backup":{"done":true,"evidence":"Google Drive"},"accountsRemoved":{"done":true},"encryptionChecked":{"done":true},"factoryReset":{"done":true},"storageSanitized":{"done":true}}'
```

### 8. Generate Verification Certificate
```bash
curl -X POST http://localhost:5000/api/devices/$DEVICE_ID/certificate \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Access Public Certificate Page (No Auth Required)
```bash
curl -X GET http://localhost:5000/api/certificates/RL-2026-00091
```

---

## 📦 Deployment Instructions (AWS App Runner / Elastic Beanstalk)

1. Set environment variables on the hosting platform (`PORT=5000`, `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `PUBLIC_VERIFY_BASE_URL`, `AI_PROVIDER=bedrock`, `AI_MODEL_ID`, `AWS_REGION`).
2. Attach an IAM role to the container with policy `bedrock:InvokeModel`.
3. Update `CLIENT_URL` and `PUBLIC_VERIFY_BASE_URL` with your deployed frontend URL.
