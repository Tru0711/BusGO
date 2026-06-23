const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    assignedTrips: {
      type: [
        {
          tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
          assignedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

driverSchema.index({ vendorId: 1, licenseNumber: 1 }, { unique: true });

module.exports = mongoose.model('Driver', driverSchema);