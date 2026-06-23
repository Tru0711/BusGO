const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStatic',
      required: true,
      index: true,
    },
    seatNumber: {
      type: Number,
      required: [true, 'Seat number is required'],
      min: 1,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'booked', 'female-only', 'blocked'],
      default: 'available',
      index: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockToken: {
      type: String,
      default: null,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    reservedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Unique seat per trip
seatSchema.index({ tripId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
