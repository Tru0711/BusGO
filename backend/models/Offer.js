const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor ID is required'],
    },
    label: {
      type: String,
      required: [true, 'Offer label is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Offer description is required'],
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: 1,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Offer', offerSchema);
