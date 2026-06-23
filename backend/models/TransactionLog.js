const mongoose = require('mongoose');

const transactionLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['Booking', 'Payment', 'Refund', 'User'],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    referenceId: {
      type: String,
      default: null,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    performedByRole: {
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

transactionLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('TransactionLog', transactionLogSchema);
