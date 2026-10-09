const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    verifyUrl: {
      type: String,
      required: true,
    },
    deviceSummary: {
      deviceType: { type: String, required: true },
      brand: { type: String, required: true },
      model: { type: String, required: true },
      purchaseYear: { type: Number, required: true },
      condition: { type: String, required: true },
      batteryHealthPercent: { type: Number, default: null },
      repairHistory: { type: Array, default: [] },
    },
    dataSafetySnapshot: {
      type: Object,
      required: true,
    },
    lifecycleEvents: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      default: 'TRANSFER_READY',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    disclaimer: {
      type: String,
      default:
        'Verification reflects the checks and evidence recorded at the verification date; it is not a guarantee of future performance.',
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Certificate', certificateSchema);
