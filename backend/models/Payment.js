const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      unique: true,
      sparse: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentProvider: {
      type: String,
      enum: ['razorpay', 'stripe', 'cashfree', 'wallet', 'upi', 'credit_card', 'debit_card', 'net_banking'],
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'authorized', 'paid', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    transactionId: {
      type: String,
      default: null,
      index: true,
    },
    isDemoPayment: {
      type: Boolean,
      default: false,
      index: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
      default: null,
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
    webhookProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },
    refunds: {
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
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Payment', paymentSchema);
