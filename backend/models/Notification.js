const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      alias: 'userId',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'payment_success',
        'payment_failed',
        'refund_processed',
        'booking_cancelled',
        'refund_failed',
        'admin_alert',
      ],
      required: true,
      index: true,
    },
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },
    relatedPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    channels: {
      type: [String],
      default: ['in-app'],
    },
    dedupeKey: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailStatus: {
      type: String,
      enum: ['pending', 'sent', 'skipped', 'failed'],
      default: 'pending',
    },
    createdByRole: {
      type: String,
      default: null,
    },
    sourceEvent: {
      type: String,
      default: null,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    channelsDeliveryState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    extra: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, dedupeKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Notification', notificationSchema);