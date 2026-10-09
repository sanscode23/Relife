const mongoose = require('mongoose');

const safetyItemSchema = new mongoose.Schema(
  {
    done: { type: Boolean, default: false },
    verification: {
      type: String,
      enum: ['USER_VERIFIED', 'SYSTEM_VERIFIED', 'NOT_VERIFIED'],
      default: 'NOT_VERIFIED',
    },
    evidence: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ['LAPTOP', 'PHONE', 'TABLET', 'DESKTOP', 'ROUTER', 'OTHER'],
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseYear: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      enum: ['GOOD', 'FAIR', 'POOR'],
      required: true,
    },
    issues: {
      type: [String],
      default: [],
    },
    repairCost: {
      type: Number,
      default: 0,
    },
    userWantsToSell: {
      type: Boolean,
      default: false,
    },
    repairHistory: [
      {
        description: { type: String, required: true },
        cost: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    batteryHealthPercent: {
      type: Number,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'REGISTERED',
        'ASSESSED',
        'PATH_SELECTED',
        'REPAIRED',
        'SAFETY_IN_PROGRESS',
        'SAFETY_COMPLETED',
        'TRANSFER_READY',
        'TRANSFERRED',
        'DONATED',
        'REPURPOSED',
        'RECYCLED',
        'IN_USE',
      ],
      default: 'REGISTERED',
    },
    chosenPath: {
      type: String,
      enum: ['CONTINUE_OR_REPAIR', 'SELL_OR_DONATE', 'REPURPOSE', 'RECYCLE', null],
      default: null,
    },
    recommendation: {
      action: {
        type: String,
        enum: [
          'CONTINUE_USING',
          'REPAIR_AND_REUSE',
          'REPAIR_AND_RESELL',
          'SELL',
          'DONATE',
          'REPURPOSE',
          'COMPONENT_RECOVERY',
          'RECYCLE',
        ],
      },
      recommendedPath: {
        type: String,
        enum: ['CONTINUE_OR_REPAIR', 'SELL_OR_DONATE', 'REPURPOSE', 'RECYCLE'],
      },
      score: { type: Number },
      reason: { type: String },
      aiExplanation: { type: String, default: null },
      nextSteps: [{ type: String }],
      estimatedExtraLifeYears: { type: String },
      potentialResale: {
        min: { type: Number },
        max: { type: Number },
      },
    },
    repairComparison: {
      repairCost: { type: Number },
      estimatedValueBeforeRepair: { type: Number },
      estimatedValueAfterRepair: { type: Number },
      costRatioPercent: { type: Number },
      expectedExtraLifeYears: { type: String },
      verdict: {
        type: String,
        enum: ['REPAIR', 'DONT_REPAIR', 'BORDERLINE'],
      },
      summary: { type: String },
    },
    dataSafety: {
      completed: { type: Boolean, default: false },
      items: {
        backup: { type: safetyItemSchema, default: () => ({}) },
        accountsRemoved: { type: safetyItemSchema, default: () => ({}) },
        encryptionChecked: { type: safetyItemSchema, default: () => ({}) },
        factoryReset: { type: safetyItemSchema, default: () => ({}) },
        storageSanitized: { type: safetyItemSchema, default: () => ({}) },
      },
    },
    verificationId: {
      type: String,
      default: null,
    },
    lifecycleEvents: [
      {
        type: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

deviceSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Device', deviceSchema);
