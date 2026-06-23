const mongoose = require('mongoose');

const seatReservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStatic',
      required: true,
      index: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    seatNumbers: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one seat must be reserved.',
      },
    },
    reservationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reservationStartTime: {
      type: Date,
      required: true,
    },
    reservationExpiryTime: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SeatReservation', seatReservationSchema);
