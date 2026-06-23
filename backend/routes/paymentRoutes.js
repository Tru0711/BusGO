const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const { createRazorpayOrder, verifyRazorpayPayment, simulateDemoPayment, getUserPaymentHistory, razorpayWebhook, createRefund } = require('../controllers/paymentController');
const expressRaw = require('express').raw;

// Create order (user must be authenticated)
router.post('/create-order', protect, createRazorpayOrder);

// Verify payment from frontend
router.post('/verify', protect, verifyRazorpayPayment);

router.post('/demo/simulate', protect, authorizeRoles('user'), simulateDemoPayment);
router.get('/history', protect, authorizeRoles('user'), getUserPaymentHistory);

// Refund booking payment (admin only)
router.post('/refund/:bookingId', protect, authorizeRoles('admin'), createRefund);

// Webhook (no auth) - use raw body for signature verification
router.post('/webhook', expressRaw({ type: 'application/json' }), razorpayWebhook);

module.exports = router;
