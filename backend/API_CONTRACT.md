# RE:LIFE API Contract Specification

All endpoints are prefixed with `/api`.
All responses follow the standard JSON envelope:
- **Success**: `{ "success": true, "data": { ... } }`
- **Error**: `{ "success": false, "message": "Readable error message", "details": [ ... ] }`

Authentication header for protected endpoints:
`Authorization: Bearer <JWT_TOKEN>`

---

## Enum Definitions

- **Role**: `GUEST`, `USER`
- **DeviceType**: `LAPTOP`, `PHONE`, `TABLET`, `DESKTOP`, `ROUTER`, `OTHER`
- **Condition**: `GOOD`, `FAIR`, `POOR`
- **Status**: `REGISTERED`, `ASSESSED`, `PATH_SELECTED`, `REPAIRED`, `SAFETY_IN_PROGRESS`, `SAFETY_COMPLETED`, `TRANSFER_READY`, `TRANSFERRED`, `DONATED`, `REPURPOSED`, `RECYCLED`, `IN_USE`
- **ChosenPath**: `CONTINUE_OR_REPAIR`, `SELL_OR_DONATE`, `REPURPOSE`, `RECYCLE`, `null`
- **RecommendationAction**: `CONTINUE_USING`, `REPAIR_AND_REUSE`, `REPAIR_AND_RESELL`, `SELL`, `DONATE`, `REPURPOSE`, `COMPONENT_RECOVERY`, `RECYCLE`
- **RepairVerdict**: `REPAIR`, `DONT_REPAIR`, `BORDERLINE`
- **VerificationStatus**: `USER_VERIFIED`, `SYSTEM_VERIFIED`, `NOT_VERIFIED`
- **HistoryOutcome**: `CONTINUED`, `TRANSFERRED`, `DONATED`, `REPURPOSED`, `RECYCLED`

---

## Endpoints

### 1. Health & Public Metrics
#### `GET /api/health`
- **Auth Required**: No
- **Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2026-10-09T18:41:25.000Z",
    "service": "RE:LIFE Backend API"
  }
}
```

#### `GET /api/impact`
- **Auth Required**: No
- **Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalDevices": 42,
    "devicesAssessed": 38,
    "continuedUse": 12,
    "repaired": 15,
    "transferredOrDonated": 18,
    "repurposed": 5,
    "sentToRecycling": 2,
    "transfersWithSafetyCheckPercent": 100,
    "estimatedExtraLifeYears": 95.0,
    "estimatedDevicesDiverted": 40
  }
}
```

---

### 2. Authentication & User Profile

#### `POST /api/auth/guest`
- **Auth Required**: No
- **Request Body**: None
- **Success Response (201)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "userId": "usr_abc123",
      "role": "GUEST",
      "name": "Guest User"
    }
  }
}
```

#### `POST /api/auth/register`
- **Auth Required**: No
- **Request JSON**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "city": "Bengaluru"
}
```
- **Success Response (201)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "userId": "usr_reg456",
      "role": "USER",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "city": "Bengaluru"
    }
  }
}
```

#### `POST /api/auth/upgrade`
- **Auth Required**: Yes (Bearer Token)
- **Request JSON**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "newpassword123"
}
```
- **Success Response (200)**: Upgrades guest account to USER role while preserving all existing devices.

---

### 3. Dashboard

#### `GET /api/dashboard`
- **Auth Required**: Yes
- **Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": { "userId": "usr_demoguest", "name": "Guest User", "role": "GUEST" },
    "stats": { "totalDevices": 1, "assessed": 1, "inProgress": 0, "transferReady": 1, "completed": 0 },
    "devices": [
      {
        "deviceId": "dev_demo_dell_inspiron",
        "deviceType": "LAPTOP",
        "brand": "Dell",
        "model": "Inspiron 15",
        "purchaseYear": 2022,
        "condition": "FAIR",
        "status": "TRANSFER_READY",
        "journeyProgress": {
          "currentStep": "Transfer / Resell / Donate",
          "completedSteps": ["Device Registered", "Device Assessed", "Path Selected", "Data Safety Checklist", "Verification Certificate"],
          "percent": 90
        }
      }
    ],
    "pendingActions": []
  }
}
```

---

### 4. Device Management & Assessment

#### `POST /api/devices`
- **Auth Required**: Yes
- **Request JSON**:
```json
{
  "deviceType": "LAPTOP",
  "brand": "Dell",
  "model": "Inspiron 15",
  "purchaseYear": 2022,
  "condition": "GOOD",
  "issues": ["battery"],
  "repairCost": 3000,
  "userWantsToSell": true
}
```

#### `POST /api/devices/:id/assessment`
- **Auth Required**: Yes
- **Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "deviceId": "dev_abc123",
    "recommendation": {
      "action": "REPAIR_AND_RESELL",
      "recommendedPath": "SELL_OR_DONATE",
      "score": 82,
      "reason": "Device is still usable and repair cost is relatively low.",
      "aiExplanation": "This Dell Inspiron 15 is in good condition with a degraded battery. Investing ₹3,000 in a replacement battery restores full functionality, allowing you to fetch up to ₹16,000 on second-hand markets.",
      "nextSteps": [
        "Replace battery",
        "Complete data safety check",
        "Generate verification certificate",
        "List on a resale platform"
      ],
      "estimatedExtraLifeYears": "2-3",
      "potentialResale": { "min": 12000, "max": 16000 }
    },
    "repairComparison": {
      "repairCost": 3000,
      "estimatedValueBeforeRepair": 11000,
      "estimatedValueAfterRepair": 15000,
      "costRatioPercent": 20,
      "expectedExtraLifeYears": "2-3 years",
      "verdict": "REPAIR",
      "summary": "Spending ₹3,000 on repair is highly economical compared to buying a replacement valued at ₹15,000."
    },
    "status": "ASSESSED",
    "journeyProgress": {
      "currentStep": "Path Selected",
      "completedSteps": ["Device Registered", "Device Assessed"],
      "percent": 40
    }
  }
}
```

---

### 5. Data Safety & Certificate

#### `PATCH /api/devices/:id/safety`
- **Auth Required**: Yes
- **Constraint**: Allowed ONLY when `chosenPath === 'SELL_OR_DONATE'`.
- **Request JSON**:
```json
{
  "backup": { "done": true, "evidence": "Google Drive backup" },
  "accountsRemoved": { "done": true, "evidence": "Signed out of Google" },
  "encryptionChecked": { "done": true, "evidence": "BitLocker disabled" },
  "factoryReset": { "done": true, "evidence": "System reset" },
  "storageSanitized": { "done": true, "evidence": "Full overwrite" }
}
```

#### `GET /api/certificates/:verificationId`
- **Auth Required**: No (PUBLIC QR Endpoint)
- **Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "certificate": {
      "verificationId": "RL-2026-00091",
      "deviceId": "dev_demo_dell_inspiron",
      "verifyUrl": "http://localhost:5173/verify/RL-2026-00091",
      "deviceSummary": {
        "deviceType": "LAPTOP",
        "brand": "Dell",
        "model": "Inspiron 15",
        "purchaseYear": 2022,
        "condition": "FAIR"
      },
      "status": "TRANSFER_READY",
      "disclaimer": "Verification reflects the checks and evidence recorded at the verification date; it is not a guarantee of future performance."
    }
  }
}
```
