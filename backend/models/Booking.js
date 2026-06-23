const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStatic',
      required: true,
    },
    busName: {
      type: String,
      trim: true,
      default: '',
    },
    from: {
      type: String,
      trim: true,
      default: '',
    },
    to: {
      type: String,
      trim: true,
      default: '',
    },
    journeyDate: {
      type: Date,
      default: null,
    },
    departureTime: {
      type: String,
      trim: true,
      default: '',
    },
    seatNumber: {
      type: [Number],
      default: [],
    },
    passengerName: {
      type: String,
      trim: true,
      default: '',
    },
    womenSafetyMode: {
      type: Boolean,
      default: false,
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: 'confirmed',
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seats: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one seat must be selected.',
      },
    },
    date: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: 'confirmed',
    },
    reservationStatus: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      default: null,
      index: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    transactionStatus: {
      type: String,
      enum: ['pending', 'authorized', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded'],
      default: 'pending',
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'processing', 'partial', 'completed', 'rejected'],
      default: 'none',
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingRefundableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'upi', 'wallet', 'card', 'credit_card', 'debit_card', 'net_banking', 'cash', 'pending'],
      default: 'pending',
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
    reservationToken: {
      type: String,
      default: null,
    },
    refundHistory: {
      type: [
        {
          refundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Refund' },
          providerRefundId: { type: String, default: null },
          amount: { type: Number, required: true, min: 0 },
          reason: { type: String, required: true },
          refundType: { type: String, enum: ['full', 'partial'], required: true },
          status: { type: String, enum: ['requested', 'processing', 'completed', 'failed', 'rejected'], required: true },
          refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
          refundedAt: { type: Date, default: null },
          processedAt: { type: Date, default: null },
          failureReason: { type: String, default: null },
          metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
        },
      ],
      default: [],
    },
    transactionLogs: {
      type: [
        {
          action: { type: String, required: true },
          status: { type: String, required: true },
          message: { type: String, default: '' },
          amount: { type: Number, default: 0 },
          referenceId: { type: String, default: null },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Booking', bookingSchema);
