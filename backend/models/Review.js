const mongoose = require('mongoose');

const ratingField = {
  type: Number,
  min: 1,
  max: 5,
  required: true,
};

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStatic',
      required: true,
      index: true,
    },
    overallRating: ratingField,
    cleanlinessRating: ratingField,
    punctualityRating: ratingField,
    comfortRating: ratingField,
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

reviewSchema.index({ busId: 1, createdAt: -1 });
reviewSchema.index({ tripId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);