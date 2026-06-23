const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor ID is required'],
      index: true,
    },
    busName: {
      type: String,
      required: [true, 'Bus name is required'],
      trim: true,
    },
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    busType: {
      type: String,
      enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'],
      required: [true, 'Bus type is required'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [10, 'Bus must have at least 10 seats'],
      max: 60,
    },
    amenities: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure unique constraint on busNumber
busSchema.index({ vendorId: 1, busNumber: 1 }, { unique: true });

module.exports = mongoose.model('BusStatic', busSchema);
