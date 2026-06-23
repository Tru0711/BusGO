const User = require('../models/User');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email phone role isVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
      error: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }

    if (typeof phone === 'string') {
      updates.phone = phone.trim();
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: 'At least one profile field is required.',
      });
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('name email phone role isVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user profile.',
      error: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};