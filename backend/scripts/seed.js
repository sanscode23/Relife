const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Device = require('../models/Device');
const Certificate = require('../models/Certificate');
const { runRecommendationEngine } = require('../services/recommendationEngine');
const { calculateRepairComparison } = require('../services/repairComparisonService');
const { addLifecycleEvent, EVENT_TYPES } = require('../services/lifecycleService');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting RE:LIFE Database Seed...');
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    // Clean existing seed demo data
    await User.deleteOne({ userId: 'usr_demoguest' });
    await Device.deleteOne({ deviceId: 'dev_demo_dell_inspiron' });
    await Certificate.deleteOne({ verificationId: 'RL-2026-00091' });

    // 1. Create Demo Guest User
    const guestUser = await User.create({
      userId: 'usr_demoguest',
      role: 'GUEST',
      name: 'Demo Guest User',
    });
    console.log('👤 Demo Guest User created:', guestUser.userId);

    // 2. Create DEMO_DEVICE
    const currentYear = new Date().getFullYear();
    const demoDevice = new Device({
      deviceId: 'dev_demo_dell_inspiron',
      userId: guestUser.userId,
      deviceType: 'LAPTOP',
      brand: 'Dell',
      model: 'Inspiron 15',
      purchaseYear: currentYear - 4, // 4 years old
      condition: 'FAIR',
      issues: ['weak battery'],
      repairCost: 3000,
      userWantsToSell: true,
      batteryHealthPercent: 62,
      status: 'REGISTERED',
      chosenPath: 'SELL_OR_DONATE',
      lifecycleEvents: [],
    });

    addLifecycleEvent(demoDevice, EVENT_TYPES.DEVICE_REGISTERED, 'Dell Inspiron 15 registered by demo user');

    // 3. Assessment
    const recommendation = runRecommendationEngine(demoDevice);
    recommendation.aiExplanation =
      'This 4-year-old Dell Inspiron 15 is in fair condition with a weak battery. Replacing the battery for ₹3,000 restores high resale value, making repair and resale the optimal economic and sustainable path.';

    const repairComparison = calculateRepairComparison(demoDevice);
    demoDevice.recommendation = recommendation;
    demoDevice.repairComparison = repairComparison;
    demoDevice.status = 'ASSESSED';
    addLifecycleEvent(
      demoDevice,
      EVENT_TYPES.ASSESSMENT_COMPLETED,
      `Assessment completed: ${recommendation.action}`
    );

    // 4. Select Path
    demoDevice.chosenPath = 'SELL_OR_DONATE';
    demoDevice.status = 'PATH_SELECTED';
    addLifecycleEvent(demoDevice, EVENT_TYPES.PATH_SELECTED, 'Chosen path: SELL_OR_DONATE');

    // 5. Add Repair Record
    demoDevice.repairHistory = [
      {
        description: 'Replaced degraded battery with official OEM cell',
        cost: 3000,
        date: new Date(),
      },
    ];
    demoDevice.batteryHealthPercent = 100;
    demoDevice.status = 'REPAIRED';
    addLifecycleEvent(demoDevice, EVENT_TYPES.REPAIR_COMPLETED, 'Battery replaced (Cost: ₹3,000)');

    // 6. Data Safety Checklist Completed
    const now = new Date();
    demoDevice.dataSafety = {
      completed: true,
      items: {
        backup: { done: true, verification: 'USER_VERIFIED', evidence: 'Backed up to Google Drive', updatedAt: now },
        accountsRemoved: { done: true, verification: 'USER_VERIFIED', evidence: 'Signed out of Google & Microsoft accounts', updatedAt: now },
        encryptionChecked: { done: true, verification: 'USER_VERIFIED', evidence: 'BitLocker drive encryption turned off', updatedAt: now },
        factoryReset: { done: true, verification: 'USER_VERIFIED', evidence: 'Windows 11 factory reset performed', updatedAt: now },
        storageSanitized: { done: true, verification: 'USER_VERIFIED', evidence: 'Full disk overwrite sanitization complete', updatedAt: now },
      },
    };
    demoDevice.status = 'SAFETY_COMPLETED';
    addLifecycleEvent(demoDevice, EVENT_TYPES.DATA_SAFETY_COMPLETED, 'All 5 data safety checklist items verified.');

    // 7. Issue Certificate RL-2026-00091
    const verificationId = 'RL-2026-00091';
    const verifyUrl = `${env.PUBLIC_VERIFY_BASE_URL}/${verificationId}`;

    const certificate = await Certificate.create({
      verificationId,
      deviceId: demoDevice.deviceId,
      verifyUrl,
      deviceSummary: {
        deviceType: demoDevice.deviceType,
        brand: demoDevice.brand,
        model: demoDevice.model,
        purchaseYear: demoDevice.purchaseYear,
        condition: demoDevice.condition,
        batteryHealthPercent: demoDevice.batteryHealthPercent,
        repairHistory: demoDevice.repairHistory,
      },
      dataSafetySnapshot: demoDevice.dataSafety,
      lifecycleEvents: demoDevice.lifecycleEvents,
      status: 'TRANSFER_READY',
      issuedAt: now,
      disclaimer:
        'Verification reflects the checks and evidence recorded at the verification date; it is not a guarantee of future performance.',
    });

    demoDevice.verificationId = verificationId;
    demoDevice.status = 'TRANSFER_READY';
    addLifecycleEvent(
      demoDevice,
      EVENT_TYPES.TRANSFER_READY,
      `Verification Certificate ${verificationId} issued.`
    );

    await demoDevice.save();

    console.log('✅ Demo Device journey completed successfully!');
    console.log('📋 Seed Details:');
    console.log(`   - User ID: ${guestUser.userId}`);
    console.log(`   - Device ID: ${demoDevice.deviceId}`);
    console.log(`   - Verification ID: ${certificate.verificationId}`);
    console.log(`   - Public Verify URL: ${verifyUrl}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
