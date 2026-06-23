const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');

const createToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const admin = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (!admin || admin.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.',
      });
    }

    const token = createToken(admin._id);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Admin login failed.',
      error: error.message,
    });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' })
      .select('name email companyName isApproved isVerified createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      vendors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors.',
      error: error.message,
    });
  }
};

const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor' },
      { isApproved: true },
      { new: true },
    ).select('name email companyName isApproved');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor approved successfully.',
      vendor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve vendor.',
      error: error.message,
    });
  }
};

// Keep rejection simple by removing the vendor account.
const rejectVendor = async (req, res) => {
  try {
    const vendor = await User.findOneAndDelete({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor rejected and removed.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject vendor.',
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['user', 'vendor', 'admin'] } })
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('busId', 'busName')
      .populate('tripId', 'fromLocation toLocation travelDate departureTime arrivalTime price')
      .sort({ createdAt: -1 });

    const bookingIds = bookings.map((booking) => booking._id);
    const payments = await Payment.find({ bookingId: { $in: bookingIds } });
    const refunds = await Refund.find({ bookingId: { $in: bookingIds } }).sort({ createdAt: -1 });

    const paymentByBookingId = new Map(payments.map((payment) => [String(payment.bookingId), payment]));
    const refundByBookingId = refunds.reduce((accumulator, refund) => {
      const key = String(refund.bookingId);
      if (!accumulator.has(key)) {
        accumulator.set(key, []);
      }
      accumulator.get(key).push(refund);
      return accumulator;
    }, new Map());

    return res.status(200).json({
      success: true,
      bookings: bookings.map((booking) => {
        const payment = paymentByBookingId.get(String(booking._id));
        const bookingRefunds = refundByBookingId.get(String(booking._id)) || [];

        return {
          id: booking._id,
          userName: booking.userId?.name || booking.passengerName,
          userEmail: booking.userId?.email || '',
          busName: booking.busId?.busName || 'N/A',
          route: booking.tripId ? `${booking.tripId.fromLocation || ''} to ${booking.tripId.toLocation || ''}` : 'N/A',
          seats: booking.seats,
          date: booking.date || booking.travelDate,
          bookingStatus: booking.bookingStatus,
          transactionStatus: booking.transactionStatus,
          refundStatus: booking.refundStatus,
          totalPrice: booking.totalPrice,
          refundedAmount: booking.refundedAmount || 0,
          remainingRefundableAmount: booking.remainingRefundableAmount || Math.max(0, Number(booking.totalPrice || 0) - Number(booking.refundedAmount || 0)),
          paymentMethod: booking.paymentMethod,
          paymentId: booking.paymentId || payment?.paymentId || null,
          paymentRecordId: payment?._id || null,
          isRefundEligible: Boolean(payment?.paymentId) && Math.max(0, Number(booking.totalPrice || 0) - Number(booking.refundedAmount || 0)) > 0 && !['refunded'].includes(booking.bookingStatus),
          refundHistory: bookingRefunds.map((refund) => ({
            id: refund._id,
            amount: refund.amount,
            reason: refund.reason,
            refundType: refund.refundType,
            status: refund.status,
            providerRefundId: refund.providerRefundId,
            refundedAt: refund.refundedAt,
            processedAt: refund.processedAt,
            failureReason: refund.failureReason,
            requestedBy: refund.requestedBy,
            refundedBy: refund.refundedBy,
          })),
        };
      }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.',
      error: error.message,
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalBookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'vendor' }),
      Booking.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        totalBookings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats.',
      error: error.message,
    });
  }
};

module.exports = {
  adminLogin,
  getAllVendors,
  approveVendor,
  rejectVendor,
  getAllUsers,
  getAllBookings,
  getAdminStats,
};