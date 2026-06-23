const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStatic',
      required: [true, 'Bus is required'],
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor ID is required'],
      index: true,
    },
    fromLocation: {
      type: String,
      required: [true, 'Source location is required'],
      trim: true,
    },
    toLocation: {
      type: String,
      required: [true, 'Destination location is required'],
      trim: true,
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
      index: true,
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required'],
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
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

// Compound index for efficient overlap checking
tripSchema.index({ busId: 1, travelDate: 1, departureTime: 1, arrivalTime: 1 });

module.exports = mongoose.model('Trip', tripSchema);
