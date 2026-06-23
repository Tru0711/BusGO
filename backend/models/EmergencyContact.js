const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    relation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
