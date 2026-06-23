const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    refundType: {
      type: String,
      enum: ['full', 'partial', 'none'],
      default: 'partial',
    },
    status: {
      type: String,
      enum: ['requested', 'processing', 'completed', 'failed', 'rejected'],
      default: 'requested',
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay'],
      default: 'razorpay',
    },
    providerRefundId: {
      type: String,
      default: null,
      index: { unique: true, sparse: true },
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    referenceNumber: {
      type: String,
      default: null,
      index: true,
    },
    webhookProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Refund', refundSchema);