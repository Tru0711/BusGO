const express = require('express');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Trip = require('../models/Trip');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const SeatReservation = require('../models/SeatReservation');
const Refund = require('../models/Refund');
const TransactionLog = require('../models/TransactionLog');
const User = require('../models/User');
const {
  createNotification,
  createTransactionLog,
  sendRefundNotifications,
  notifyBookingConfirmed,
  notifyPaymentSuccess,
  notifyPaymentFailed,
  notifyRefundFailed,
  notifyAdminAlert,
} = require('../services/notificationService');

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};
const { LOCK_MINUTES } = require('../services/seatLockService');
const { createOrder, validateSignature, getRazorpayClient } = require('../services/razorpayService');

const normalizeCurrencyAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount);
};

const demoPaymentMethods = ['upi', 'credit_card', 'debit_card', 'net_banking', 'wallet'];

const createTransactionId = () => `DEMO-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const paymentHistoryPayload = (payment) => ({
  id: payment._id,
  bookingId: payment.bookingId,
  transactionId: payment.transactionId || payment.paymentId,
  amount: payment.amount,
  paymentMethod: payment.paymentProvider,
  paymentStatus: payment.status,
  createdAt: payment.createdAt,
  isDemoPayment: payment.isDemoPayment,
});

const buildRefundKey = ({ bookingId, amount, reason, refundType, refundableAmount }) => {
  return [String(bookingId), String(amount), String(reason || '').trim().toLowerCase(), String(refundType), String(refundableAmount)].join(':');
};

const appendLog = async ({ booking, payment, refund, action, status, message, amount, referenceId, performedBy, performedByRole, metadata = {} }) => {
  const payload = {
    entityType: refund ? 'Refund' : payment ? 'Payment' : 'Booking',
    entityId: refund?._id || payment?._id || booking?._id,
    action,
    status,
    message,
    amount,
    referenceId,
    performedBy,
    performedByRole,
    metadata,
  };

  await TransactionLog.create(payload);

  if (booking) {
    booking.transactionLogs = booking.transactionLogs || [];
    booking.transactionLogs.push({ action, status, message, amount, referenceId, createdAt: new Date() });
    await booking.save();
  }

  if (payment) {
    payment.transactionLogs = payment.transactionLogs || [];
    payment.transactionLogs.push({ action, status, message, amount, referenceId, createdAt: new Date() });
    await payment.save();
  }
};

const updateRefundSnapshots = async ({ booking, payment, refundRecord, amount, reason, refundType, status, providerRefundId = null, failureReason = null, refundedBy = null, processedAt = null, refundedAt = null, metadata = {} }) => {
  const snapshot = {
    refundId: refundRecord._id,
    providerRefundId,
    amount,
    reason,
    refundType,
    status,
    refundedBy,
    refundedAt,
    processedAt,
    failureReason,
    metadata,
  };

  booking.refundHistory = booking.refundHistory || [];
  payment.refunds = payment.refunds || [];

  const bookingIndex = booking.refundHistory.findIndex((item) => String(item.refundId) === String(refundRecord._id));
  const paymentIndex = payment.refunds.findIndex((item) => String(item.refundId) === String(refundRecord._id));

  if (bookingIndex >= 0) booking.refundHistory[bookingIndex] = snapshot;
  else booking.refundHistory.push(snapshot);

  if (paymentIndex >= 0) payment.refunds[paymentIndex] = snapshot;
  else payment.refunds.push(snapshot);

  booking.refundedAmount = booking.refundHistory
    .filter((item) => item.status === 'completed')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  payment.refundedAmount = booking.refundedAmount;

  booking.remainingRefundableAmount = Math.max(0, Number(booking.totalPrice || payment.amount || 0) - booking.refundedAmount);
  payment.remainingRefundableAmount = booking.remainingRefundableAmount;

  if (booking.refundHistory.some((item) => item.status === 'processing')) {
    booking.refundStatus = 'processing';
  } else if (booking.remainingRefundableAmount === 0 && booking.refundHistory.some((item) => item.status === 'completed')) {
    booking.refundStatus = 'completed';
  } else if (booking.refundHistory.some((item) => item.status === 'completed')) {
    booking.refundStatus = 'partial';
  }

  if (booking.refundStatus === 'completed') {
    booking.bookingStatus = 'refunded';
    booking.transactionStatus = 'refunded';
    payment.status = 'refunded';
  } else if (booking.refundStatus === 'partial') {
    booking.bookingStatus = 'confirmed';
    booking.transactionStatus = 'partially_refunded';
    payment.status = 'paid';
  }

  await booking.save();
  await payment.save();
};

const releaseBookedSeats = async ({ booking, tripId, reason = 'refund' }) => {
  const seats = await Seat.find({ tripId, seatNumber: { $in: booking.seats } });

  if (!seats.length) {
    return;
  }

  const stillBookedSeats = seats.filter((seat) => seat.status === 'booked' && String(seat.bookingId) === String(booking._id));

  if (!stillBookedSeats.length) {
    return;
  }

  await Seat.updateMany(
    { tripId, seatNumber: { $in: booking.seats }, bookingId: booking._id },
    {
      $set: {
        status: 'available',
        bookedBy: null,
        bookingId: null,
      },
      $unset: {
        lockedBy: '',
        lockToken: '',
        lockExpiresAt: '',
        reservedAt: '',
      },
    },
  );

  await Trip.updateOne({ _id: tripId }, { $inc: { availableSeats: booking.seats.length } });

  return reason;
};

// Create Razorpay order after validating reservation
async function createRazorpayOrder(req, res) {
  try {
    const userId = req.user.userId;
    const { tripId, selectedSeats, reservationToken } = req.body;

    if (!tripId || !Array.isArray(selectedSeats) || selectedSeats.length === 0 || !reservationToken) {
      return res.status(400).json({ success: false, message: 'tripId, selectedSeats and reservationToken are required.' });
    }

    const trip = await Trip.findById(tripId).populate('busId');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });

    const uniqueSeats = [...new Set(selectedSeats.map((s) => Number(s)))];
    const seats = await Seat.find({ tripId: trip._id, seatNumber: { $in: uniqueSeats } }).lean();
    if (seats.length !== uniqueSeats.length) {
      return res.status(400).json({ success: false, message: 'Invalid seat selection.' });
    }

    const invalid = seats.find((seat) => seat.lockToken !== reservationToken || String(seat.lockedBy) !== userId || !seat.lockExpiresAt || new Date(seat.lockExpiresAt) < new Date());
    if (invalid) {
      const io = req.app.get('io');
      await notifyAdminAlert({
        message: `Suspicious or expired seat-hold attempt detected while creating a Razorpay order for trip ${tripId}.`,
        title: 'Suspicious payment attempt',
        metadata: {
          tripId,
          userId,
          selectedSeats,
          reservationToken,
        },
        io,
        sourceEvent: 'duplicate_payment_attempt',
        relatedBooking: null,
        relatedPayment: null,
        performedByRole: req.user.role,
      });
      return res.status(409).json({ success: false, message: 'Seat hold is invalid or expired. Please reserve again.' });
    }

    // Calculate amount server-side
    const amount = uniqueSeats.length * trip.price;

    // Create Payment record (created state)
    const payment = await Payment.create({
      bookingId: null,
      userId,
      vendorId: trip.vendorId,
      paymentProvider: 'razorpay',
      orderId: `temp_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`,
      paymentId: null,
      amount,
      currency: 'INR',
      status: 'created',
      metadata: { tripId: trip._id.toString(), seatNumbers: uniqueSeats, reservationToken },
    });

    // Create Razorpay order
    const razorOrder = await createOrder({ amount, currency: 'INR', receipt: `payment_${payment._id}`, notes: { booking: String(payment._id) } });

    payment.orderId = razorOrder.id;
    await payment.save();

    return res.status(200).json({ success: true, data: { razorpayKeyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: razorOrder.id, amount: razorOrder.amount, currency: razorOrder.currency, paymentRecordId: payment._id } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create payment order.', error: error.message });
  }
}

async function simulateDemoPayment(req, res) {
  try {
    const userId = req.user.userId;
    const {
      tripId,
      selectedSeats,
      reservationToken,
      date,
      passengerDetails = {},
      paymentMethod = 'upi',
      outcome = 'success',
      womenSafetyMode = false,
    } = req.body;

    if (!tripId || !Array.isArray(selectedSeats) || selectedSeats.length === 0 || !reservationToken || !date) {
      return res.status(400).json({ success: false, message: 'Trip, seats, date, and reservation token are required.' });
    }

    if (!demoPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Unsupported demo payment method.' });
    }

    if (!['success', 'failure'].includes(outcome)) {
      return res.status(400).json({ success: false, message: 'Invalid demo payment outcome.' });
    }

    const reservation = await SeatReservation.findOne({ reservationToken, userId, tripId });
    if (!reservation || reservation.status !== 'active' || new Date(reservation.reservationExpiryTime) <= new Date()) {
      if (reservation && reservation.status !== 'expired') {
        reservation.status = 'expired';
        await reservation.save();
      }
      return res.status(409).json({ success: false, message: 'Seat reservation expired. Please select seats again.' });
    }

    const uniqueSeats = [...new Set(selectedSeats.map((seat) => Number(seat)))].filter((seat) => Number.isInteger(seat) && seat > 0);
    const reservationSeatSet = new Set(reservation.seatNumbers.map((seat) => Number(seat)));
    if (uniqueSeats.length !== reservation.seatNumbers.length || uniqueSeats.some((seat) => !reservationSeatSet.has(seat))) {
      return res.status(409).json({ success: false, message: 'Selected seats do not match the active reservation.' });
    }

    const existingPaidPayment = await Payment.findOne({
      userId,
      status: 'paid',
      'metadata.reservationToken': reservationToken,
    }).populate('bookingId');

    if (existingPaidPayment?.bookingId) {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed for this reservation.',
        booking: existingPaidPayment.bookingId,
        payment: paymentHistoryPayload(existingPaidPayment),
      });
    }

    const trip = await Trip.findById(tripId).populate('busId');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const seats = await Seat.find({ tripId: trip._id, seatNumber: { $in: uniqueSeats } });
    if (seats.length !== uniqueSeats.length) {
      return res.status(409).json({ success: false, message: 'One or more selected seats are no longer available.' });
    }

    const invalidSeat = seats.find((seat) => (
      seat.status !== 'reserved'
      || seat.lockToken !== reservationToken
      || String(seat.lockedBy) !== String(userId)
      || !seat.lockExpiresAt
      || new Date(seat.lockExpiresAt) <= new Date()
      || seat.bookingId
    ));

    if (invalidSeat) {
      return res.status(409).json({ success: false, message: 'One or more selected seats are no longer available.' });
    }

    const bookingTotal = uniqueSeats.length * Number(trip.price || 0);
    const transactionId = createTransactionId();

    if (outcome === 'failure') {
      const failedPayment = await Payment.create({
        bookingId: null,
        userId,
        vendorId: trip.vendorId,
        paymentProvider: paymentMethod,
        orderId: `demo_fail_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        paymentId: transactionId,
        transactionId,
        amount: bookingTotal,
        currency: 'INR',
        status: 'failed',
        failureReason: 'Simulated demo payment failure.',
        isDemoPayment: true,
        metadata: { tripId: trip._id.toString(), seatNumbers: uniqueSeats, reservationToken },
      });

      await notifyPaymentFailed({
        userId,
        booking: null,
        payment: failedPayment,
        reason: failedPayment.failureReason,
        io: req.app.get('io'),
      });

      return res.status(200).json({
        success: false,
        message: 'Demo payment failed. Your seat reservation is still active until the timer expires.',
        payment: paymentHistoryPayload(failedPayment),
        reservationExpiryTime: reservation.reservationExpiryTime,
      });
    }

    const booking = await Booking.create({
      userId,
      busId: trip.busId._id,
      busName: trip.busId.busName,
      from: trip.fromLocation,
      to: trip.toLocation,
      journeyDate: normalizeDate(date),
      departureTime: trip.departureTime,
      seatNumber: uniqueSeats,
      passengerName: passengerDetails.name || req.user.name || '',
      womenSafetyMode: Boolean(womenSafetyMode),
      price: bookingTotal,
      status: 'confirmed',
      tripId: trip._id,
      vendorId: trip.vendorId,
      seats: uniqueSeats,
      date: normalizeDate(date),
      totalPrice: bookingTotal,
      bookingStatus: 'confirmed',
      reservationStatus: 'active',
      transactionStatus: 'paid',
      paymentStatus: 'paid',
      paymentMethod,
      paymentId: transactionId,
      transactionId,
      reservationToken,
    });

    const payment = await Payment.create({
      bookingId: booking._id,
      userId,
      vendorId: trip.vendorId,
      paymentProvider: paymentMethod,
      orderId: `demo_success_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      paymentId: transactionId,
      transactionId,
      amount: bookingTotal,
      currency: 'INR',
      status: 'paid',
      isDemoPayment: true,
      metadata: {
        tripId: trip._id.toString(),
        seatNumbers: uniqueSeats,
        reservationToken,
        passengerDetails,
      },
    });

    await Seat.updateMany(
      { tripId: trip._id, seatNumber: { $in: uniqueSeats }, lockedBy: userId, lockToken: reservationToken },
      {
        $set: {
          status: 'booked',
          bookedBy: userId,
          bookingId: booking._id,
          lockedBy: null,
          lockToken: null,
        },
        $unset: { lockExpiresAt: '', reservedAt: '' },
      },
    );

    reservation.status = 'expired';
    await reservation.save();
    await Trip.updateOne({ _id: trip._id }, { $inc: { availableSeats: -uniqueSeats.length } });

    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${trip._id.toString()}`).emit('seat:update', { tripId: trip._id.toString(), bookedSeats: uniqueSeats, action: 'booked' });
    }

    await notifyPaymentSuccess({ booking, payment, userId, io });
    await notifyBookingConfirmed({ booking, payment, userId, io });
    await appendLog({
      booking,
      payment,
      action: 'demo_payment_success',
      status: 'paid',
      message: 'Demo payment completed and booking confirmed.',
      amount: bookingTotal,
      referenceId: transactionId,
      performedBy: userId,
      performedByRole: req.user.role,
      metadata: { isDemoPayment: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Demo payment successful. Booking confirmed.',
      booking: {
        id: booking._id,
        busName: booking.busName,
        from: booking.from,
        to: booking.to,
        journeyDate: booking.journeyDate,
        departureTime: booking.departureTime,
        seatNumber: booking.seatNumber,
        passengerName: booking.passengerName,
        totalPrice: booking.totalPrice,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
      },
      payment: paymentHistoryPayload(payment),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Demo payment failed.', error: error.message });
  }
}

async function getUserPaymentHistory(req, res) {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .populate('bookingId', 'busName from to journeyDate departureTime seatNumber bookingStatus paymentStatus')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      payments: payments.map(paymentHistoryPayload),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payment history.', error: error.message });
  }
}

// Verify Razorpay payment signature from frontend and finalize booking
async function verifyRazorpayPayment(req, res) {
  try {
    const userId = req.user.userId;
    const { paymentRecordId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!paymentRecordId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters.' });
    }

    const payment = await Payment.findById(paymentRecordId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found.' });

    // Prevent duplicate processing
    if (payment.status === 'paid' && payment.paymentId) {
      const io = req.app.get('io');
      await notifyAdminAlert({
        message: `Duplicate payment verification attempt for booking payment ${String(payment._id)} was blocked.`,
        title: 'Duplicate payment attempt',
        metadata: {
          paymentId: payment._id,
          bookingId: payment.bookingId,
        },
        io,
        sourceEvent: 'duplicate_payment_attempt',
        relatedBooking: payment.bookingId,
        relatedPayment: payment._id,
        performedByRole: req.user.role,
      });
      return res.status(200).json({ success: true, message: 'Payment already processed.', paymentId: payment.paymentId });
    }

    const valid = validateSignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (!valid) {
      await notifyAdminAlert({
        message: `Invalid Razorpay signature detected while verifying payment for record ${String(payment._id)}.`,
        title: 'Webhook verification failure',
        metadata: { paymentRecordId, orderId: razorpay_order_id, paymentId: razorpay_payment_id },
        io: req.app.get('io'),
        sourceEvent: 'payment_signature_invalid',
        relatedBooking: payment.bookingId,
        relatedPayment: payment._id,
        performedByRole: req.user.role,
      });
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    // Mark payment as paid
    payment.paymentId = razorpay_payment_id;
    payment.status = 'paid';
    await payment.save();

    // If booking already exists for this payment, return it
    if (payment.bookingId) {
      const existingBooking = await Booking.findById(payment.bookingId);
      return res.status(200).json({ success: true, message: 'Booking already created.', booking: existingBooking });
    }

    // Create booking now (finalize)
    const { tripId, seatNumbers, reservationToken } = payment.metadata || {};
    const trip = await Trip.findById(tripId).populate('busId');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found for booking.' });

    // Verify seat holds again
    const seats = await Seat.find({ tripId: trip._id, seatNumber: { $in: seatNumbers } });
    if (seats.length !== seatNumbers.length) return res.status(409).json({ success: false, message: 'Seats are no longer available.' });

    const invalid = seats.find((seat) => seat.lockToken !== reservationToken || String(seat.lockedBy) !== userId || !seat.lockExpiresAt || new Date(seat.lockExpiresAt) < new Date());
    if (invalid) return res.status(409).json({ success: false, message: 'Seat hold is invalid or expired. Please reserve again.' });

    const bookingTotal = seatNumbers.length * trip.price;

    const booking = await Booking.create({
      userId,
      busId: trip.busId._id,
      tripId: trip._id,
      vendorId: trip.vendorId,
      seats: seatNumbers,
      date: normalizeDate(new Date()),
      totalPrice: bookingTotal,
      bookingStatus: 'confirmed',
      transactionStatus: 'paid',
      paymentMethod: 'card',
      paymentId: razorpay_payment_id,
      reservationToken,
    });

    payment.bookingId = booking._id;
    await payment.save();

    // Mark seats as booked
    await Seat.updateMany({ tripId: trip._id, seatNumber: { $in: seatNumbers }, lockedBy: userId, lockToken: reservationToken }, { $set: { status: 'booked', bookedBy: userId, bookingId: booking._id }, $unset: { lockExpiresAt: '', reservedAt: '' , lockedBy: '', lockToken: '' } });

    await Trip.updateOne({ _id: trip._id }, { $inc: { availableSeats: -seatNumbers.length } });

    // Emit seat updates
    const io = req.app.get('io');
    if (io) io.to(`trip:${trip._id.toString()}`).emit('seat:update', { tripId: trip._id.toString(), bookedSeats: seatNumbers, action: 'booked' });

    await notifyPaymentSuccess({ booking, payment, userId, io });
    await notifyBookingConfirmed({ booking, payment, userId, io });

    return res.status(200).json({ success: true, message: 'Payment verified and booking confirmed.', booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Payment verification failed.', error: error.message });
  }
}

// Razorpay webhook handler (idempotent)
async function razorpayWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.rawBody || req.body;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    const cryptoFn = require('crypto');
    const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body || {}));
    const generated = cryptoFn.createHmac('sha256', webhookSecret).update(bodyBuffer).digest('hex');

    if (!signature || generated !== signature) {
      await notifyAdminAlert({
        message: 'Razorpay webhook signature validation failed.',
        title: 'Webhook verification failure',
        metadata: { eventType: 'unknown' },
        io: req.app.get('io'),
        sourceEvent: 'webhook_signature_invalid',
        performedByRole: 'system',
      });
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const payload = JSON.parse(bodyBuffer.toString());
    const event = payload.event;

    if (event === 'payment.captured' || event === 'payment.authorized') {
      const entity = payload.payload?.payment?.entity;
      const orderId = entity?.order_id;
      const paymentId = entity?.id;

      if (!orderId || !paymentId) return res.status(400).json({ success: false, message: 'Malformed webhook payload.' });

      // Find payment by orderId
      const payment = await Payment.findOne({ orderId });
      if (!payment) {
        return res.status(200).json({ success: true, message: 'No matching payment record.' });
      }

      // Idempotent: if already processed, return
      if (payment.webhookProcessed || payment.status === 'paid') {
        await notifyAdminAlert({
          message: `Webhook attempted to re-process a payment already marked paid for payment ${String(payment._id)}.`,
          title: 'Duplicate webhook payment',
          metadata: { paymentId: payment._id, orderId },
          io: req.app.get('io'),
          sourceEvent: 'duplicate_webhook_payment',
          relatedBooking: payment.bookingId,
          relatedPayment: payment._id,
          performedByRole: 'system',
        });
        return res.status(200).json({ success: true, message: 'Already processed.' });
      }

      payment.paymentId = paymentId;
      payment.status = 'paid';
      payment.webhookProcessed = true;
      await payment.save();

      // If booking not created yet, try to create booking similar to verify flow
      if (!payment.bookingId) {
        try {
          const { tripId, seatNumbers, reservationToken } = payment.metadata || {};
          const trip = await Trip.findById(tripId).populate('busId');
          if (!trip) return res.status(200).json({ success: true, message: 'Trip missing; webhook noted.' });

          const seats = await Seat.find({ tripId: trip._id, seatNumber: { $in: seatNumbers } });
          if (seats.length !== seatNumbers.length) return res.status(200).json({ success: true, message: 'Seat mismatch; webhook noted.' });

          const invalid = seats.find((seat) => seat.lockToken !== reservationToken);
          if (invalid) return res.status(200).json({ success: true, message: 'Seat hold invalid; webhook noted.' });

          const bookingTotal = seatNumbers.length * trip.price;
          const booking = await Booking.create({
            userId: payment.userId,
            busId: trip.busId._id,
            tripId: trip._id,
            vendorId: trip.vendorId,
            seats: seatNumbers,
            date: normalizeDate(new Date()),
            totalPrice: bookingTotal,
            bookingStatus: 'confirmed',
            transactionStatus: 'paid',
            paymentMethod: 'card',
            paymentId,
            reservationToken,
          });

          payment.bookingId = booking._id;
          await payment.save();

          await Seat.updateMany({ tripId: trip._id, seatNumber: { $in: seatNumbers } }, { $set: { status: 'booked', bookingId: booking._id }, $unset: { lockExpiresAt: '', lockedBy: '', lockToken: '', reservedAt: '' } });

          await Trip.updateOne({ _id: trip._id }, { $inc: { availableSeats: -seatNumbers.length } });

          const io = req.app.get('io');
          if (io) io.to(`trip:${trip._id.toString()}`).emit('seat:update', { tripId: trip._id.toString(), bookedSeats: seatNumbers, action: 'booked' });

          await notifyPaymentSuccess({ booking, payment, userId: payment.userId, io });
          await notifyBookingConfirmed({ booking, payment, userId: payment.userId, io });
        } catch (err) {
          // swallow booking errors but keep webhook processed flag
        }
      }

      return res.status(200).json({ success: true });
    }

    if (event === 'payment.failed') {
      const entity = payload.payload?.payment?.entity;
      const orderId = entity?.order_id;
      const paymentId = entity?.id;
      const failureReason = entity?.error_description || entity?.error_reason || 'Payment failed at provider';

      if (!orderId) {
        return res.status(400).json({ success: false, message: 'Malformed payment failed webhook payload.' });
      }

      const payment = await Payment.findOne({ orderId });
      if (!payment) {
        await notifyAdminAlert({
          message: `Razorpay reported a failed payment for order ${orderId} but no matching payment record was found.`,
          title: 'Webhook payment failed',
          metadata: { orderId, paymentId, failureReason },
          io: req.app.get('io'),
          sourceEvent: 'webhook_payment_failed_missing_record',
          performedByRole: 'system',
        });
        return res.status(200).json({ success: true, message: 'No matching payment record.' });
      }

      payment.status = 'failed';
      payment.failureReason = failureReason;
      await payment.save();

      const booking = payment.bookingId ? await Booking.findById(payment.bookingId).populate('tripId') : null;
      await notifyPaymentFailed({
        userId: payment.userId,
        booking,
        payment,
        reason: failureReason,
        io: req.app.get('io'),
      });

      await notifyAdminAlert({
        message: `Payment failed for booking ${String(payment.bookingId || 'N/A')} (order ${orderId}).`,
        title: 'Payment failed',
        metadata: { orderId, paymentId, failureReason, bookingId: payment.bookingId },
        io: req.app.get('io'),
        sourceEvent: 'payment_failed',
        relatedBooking: payment.bookingId,
        relatedPayment: payment._id,
        performedByRole: 'system',
      });

      await createTransactionLog({
        entityType: 'Payment',
        entityId: payment._id,
        action: 'payment_failed_webhook',
        status: 'failed',
        message: failureReason,
        amount: payment.amount,
        referenceId: paymentId || orderId,
        metadata: { orderId },
      });

      return res.status(200).json({ success: true });
    }

    if (event === 'refund.processed') {
      const entity = payload.payload?.refund?.entity;
      const providerRefundId = entity?.id;
      const paymentId = entity?.payment_id;
      const amount = Number(entity?.amount || 0) / 100;

      if (!providerRefundId || !paymentId) {
        return res.status(400).json({ success: false, message: 'Malformed refund webhook payload.' });
      }

      const refundRecord = await Refund.findOne({ providerRefundId }).populate('bookingId').populate('paymentId');
      if (!refundRecord) {
        return res.status(200).json({ success: true, message: 'No matching refund record.' });
      }

      if (refundRecord.webhookProcessed || refundRecord.status === 'completed') {
        return res.status(200).json({ success: true, message: 'Refund already processed.' });
      }

      const booking = await Booking.findById(refundRecord.bookingId?._id || refundRecord.bookingId).populate('tripId');
      const payment = await Payment.findById(refundRecord.paymentId?._id || refundRecord.paymentId);

      if (!booking || !payment) {
        refundRecord.status = 'failed';
        refundRecord.failureReason = 'Associated booking or payment not found.';
        refundRecord.webhookProcessed = true;
        await refundRecord.save();
        return res.status(200).json({ success: true, message: 'Related records missing.' });
      }

      refundRecord.status = 'completed';
      refundRecord.processedAt = new Date();
      refundRecord.refundedAt = new Date();
      refundRecord.webhookProcessed = true;
      await refundRecord.save();

      await updateRefundSnapshots({
        booking,
        payment,
        refundRecord,
        amount: refundRecord.amount,
        reason: refundRecord.reason,
        refundType: refundRecord.refundType,
        status: 'completed',
        providerRefundId,
        refundedBy: refundRecord.refundedBy,
        processedAt: refundRecord.processedAt,
        refundedAt: refundRecord.refundedAt,
        metadata: { event: 'refund.processed', paymentId, webhookAmount: amount },
      });

      if (refundRecord.refundType === 'full') {
        await releaseBookedSeats({ booking, tripId: booking.tripId._id, reason: 'full-refund' });
      }

      const bookingAfterUpdate = await Booking.findById(booking._id).populate('tripId').populate('userId', 'name email');
      const paymentAfterUpdate = await Payment.findById(payment._id);

      await createTransactionLog({
        entityType: 'Refund',
        entityId: refundRecord._id,
        action: 'refund_processed_webhook',
        status: 'completed',
        message: 'Razorpay refund webhook processed successfully.',
        amount: refundRecord.amount,
        referenceId: providerRefundId,
        metadata: { paymentId },
      });

      if (refundRecord.status === 'completed') {
        await sendRefundNotifications({
          userId: bookingAfterUpdate.userId._id,
          bookingId: bookingAfterUpdate._id,
          refund: refundRecord,
          booking: bookingAfterUpdate,
          payment: paymentAfterUpdate,
          adminName: null,
          io: req.app.get('io'),
        });
      }

      return res.status(200).json({ success: true });
    }

    if (event === 'refund.failed') {
      const entity = payload.payload?.refund?.entity;
      const providerRefundId = entity?.id;
      const paymentId = entity?.payment_id;
      const failureReason = entity?.error_description || entity?.status || 'Refund failed at provider';

      if (!providerRefundId && !paymentId) {
        return res.status(400).json({ success: false, message: 'Malformed refund failed webhook payload.' });
      }

      const refundRecord = providerRefundId ? await Refund.findOne({ providerRefundId }) : await Refund.findOne({ razorpayPaymentId: paymentId });
      if (!refundRecord) {
        await notifyAdminAlert({
          message: `Razorpay reported a failed refund but no matching refund record was found.`,
          title: 'Refund webhook mismatch',
          metadata: { providerRefundId, paymentId, failureReason },
          io: req.app.get('io'),
          sourceEvent: 'refund_failed_missing_record',
          performedByRole: 'system',
        });
        return res.status(200).json({ success: true, message: 'No matching refund record.' });
      }

      const booking = await Booking.findById(refundRecord.bookingId).populate('tripId').populate('userId', 'name email');
      const payment = await Payment.findById(refundRecord.paymentId);

      refundRecord.status = 'failed';
      refundRecord.failureReason = failureReason;
      refundRecord.webhookProcessed = true;
      await refundRecord.save();

      if (booking && payment) {
        await updateRefundSnapshots({
          booking,
          payment,
          refundRecord,
          amount: refundRecord.amount,
          reason: refundRecord.reason,
          refundType: refundRecord.refundType,
          status: 'failed',
          providerRefundId: providerRefundId || null,
          failureReason,
          refundedBy: refundRecord.refundedBy,
          processedAt: new Date(),
          refundedAt: null,
          metadata: { event: 'refund.failed', paymentId },
        });
      }

      await notifyRefundFailed({
        userId: refundRecord.userId,
        booking,
        payment,
        refund: refundRecord,
        reason: failureReason,
        io: req.app.get('io'),
      });

      await notifyAdminAlert({
        message: `Refund failed for booking ${String(refundRecord.bookingId)}.`,
        title: 'Refund failed',
        metadata: { providerRefundId, paymentId, failureReason, refundId: refundRecord._id },
        io: req.app.get('io'),
        sourceEvent: 'refund_failed',
        relatedBooking: refundRecord.bookingId,
        relatedPayment: refundRecord.paymentId,
        performedByRole: 'system',
      });

      await createTransactionLog({
        entityType: 'Refund',
        entityId: refundRecord._id,
        action: 'refund_failed_webhook',
        status: 'failed',
        message: failureReason,
        amount: refundRecord.amount,
        referenceId: providerRefundId || paymentId || null,
        metadata: { paymentId },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ success: true, message: 'Event ignored.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Webhook handling failed.', error: error.message });
  }
}

async function createRefund(req, res) {
  try {
    const { bookingId } = req.params;
    const { amount, reason, refundType = 'partial' } = req.body;
    const adminId = req.user.userId;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required.' });
    }

    const booking = await Booking.findById(bookingId).populate('tripId').populate('userId', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (!payment.paymentId) {
      return res.status(409).json({ success: false, message: 'Paid Razorpay payment not found for this booking.' });
    }

    if (booking.bookingStatus === 'refunded' && Number(booking.remainingRefundableAmount || 0) === 0) {
      return res.status(409).json({ success: false, message: 'This booking is already fully refunded.' });
    }

    const pendingRefund = await Refund.findOne({
      bookingId: booking._id,
      status: { $in: ['requested', 'processing'] },
    });

    if (pendingRefund) {
      return res.status(409).json({
        success: false,
        message: 'A refund request for this booking is already in progress.',
        refundId: pendingRefund._id,
      });
    }

    const refundableAmount = Number(booking.remainingRefundableAmount || payment.remainingRefundableAmount || booking.totalPrice || payment.amount || 0);
    if (!Number.isFinite(refundableAmount) || refundableAmount <= 0) {
      return res.status(409).json({ success: false, message: 'No refundable amount remains for this booking.' });
    }

    const normalizedRefundType = refundType === 'full' ? 'full' : 'partial';
    let normalizedAmount = normalizedRefundType === 'full' ? refundableAmount : normalizeCurrencyAmount(amount);

    if (normalizedRefundType === 'partial' && normalizedAmount === null) {
      return res.status(400).json({ success: false, message: 'Valid refund amount is required for partial refunds.' });
    }

    if (normalizedRefundType === 'partial' && normalizedAmount > refundableAmount) {
      return res.status(400).json({ success: false, message: 'Refund amount cannot exceed the remaining refundable amount.' });
    }

    if (normalizedRefundType === 'full') {
      normalizedAmount = refundableAmount;
    }

    const normalizedReason = String(reason || '').trim();
    if (normalizedReason.length < 3) {
      return res.status(400).json({ success: false, message: 'Refund reason is required.' });
    }

    const idempotencyKey = buildRefundKey({
      bookingId: booking._id,
      amount: normalizedAmount,
      reason: normalizedReason,
      refundType: normalizedRefundType,
      refundableAmount,
    });

    const duplicateRefund = await Refund.findOne({ idempotencyKey });
    if (duplicateRefund && ['requested', 'processing', 'completed'].includes(duplicateRefund.status)) {
      return res.status(409).json({
        success: false,
        message: 'A matching refund request is already in progress or completed.',
        refundId: duplicateRefund._id,
      });
    }

    const refundRecord = await Refund.create({
      bookingId: booking._id,
      paymentId: payment._id,
      userId: booking.userId._id,
      requestedBy: adminId,
      refundedBy: adminId,
      amount: normalizedAmount,
      reason: normalizedReason,
      refundType: normalizedRefundType,
      status: 'processing',
      provider: 'razorpay',
      razorpayPaymentId: payment.paymentId,
      idempotencyKey,
      metadata: {
        bookingTotal: booking.totalPrice,
        refundableAmount,
        tripId: booking.tripId?._id || booking.tripId,
      },
    });

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Razorpay credentials are not configured.' });
    }

    let razorpayRefund;

    try {
      razorpayRefund = await razorpay.refunds.create({
        payment_id: payment.paymentId,
        amount: normalizedAmount * 100,
        notes: {
          bookingId: String(booking._id),
          reason: normalizedReason,
          refundType: normalizedRefundType,
          idempotencyKey,
        },
      });
    } catch (refundError) {
      refundRecord.status = 'failed';
      refundRecord.failureReason = refundError.message;
      refundRecord.processedAt = new Date();
      await refundRecord.save();

      await updateRefundSnapshots({
        booking,
        payment,
        refundRecord,
        amount: normalizedAmount,
        reason: normalizedReason,
        refundType: normalizedRefundType,
        status: 'failed',
        failureReason: refundError.message,
        refundedBy: req.user.userId,
        processedAt: refundRecord.processedAt,
        metadata: {
          idempotencyKey,
          providerError: refundError.message,
        },
      });

      await notifyRefundFailed({
        userId: booking.userId._id,
        booking,
        payment,
        refund: refundRecord,
        reason: refundError.message,
        io: req.app.get('io'),
      });

      await notifyAdminAlert({
        message: `Refund request for booking ${String(booking._id)} failed before provider processing.`,
        title: 'Refund failed',
        metadata: { bookingId: booking._id, paymentId: payment._id, reason: refundError.message },
        io: req.app.get('io'),
        sourceEvent: 'refund_failed',
        relatedBooking: booking._id,
        relatedPayment: payment._id,
        performedByRole: req.user.role,
      });

      await createTransactionLog({
        entityType: 'Refund',
        entityId: refundRecord._id,
        action: 'refund_failed_request',
        status: 'failed',
        message: refundError.message,
        amount: normalizedAmount,
        referenceId: payment.paymentId,
        performedBy: req.user.userId,
        performedByRole: req.user.role,
        metadata: { bookingId: booking._id, paymentId: payment._id, refundType: normalizedRefundType },
      });

      return res.status(502).json({ success: false, message: 'Refund could not be processed at Razorpay.', error: refundError.message });
    }

    refundRecord.providerRefundId = razorpayRefund.id;
    refundRecord.referenceNumber = razorpayRefund.id;
    refundRecord.status = razorpayRefund.status === 'processed' ? 'completed' : 'processing';
    refundRecord.processedAt = razorpayRefund.status === 'processed' ? new Date() : null;
    refundRecord.refundedAt = razorpayRefund.status === 'processed' ? new Date() : null;
    await refundRecord.save();

    await updateRefundSnapshots({
      booking,
      payment,
      refundRecord,
      amount: normalizedAmount,
      reason: normalizedReason,
      refundType: normalizedRefundType,
      status: refundRecord.status,
      providerRefundId: razorpayRefund.id,
      refundedBy: req.user.userId,
      processedAt: refundRecord.processedAt,
      refundedAt: refundRecord.refundedAt,
      metadata: {
        razorpayStatus: razorpayRefund.status,
        idempotencyKey,
      },
    });

    if (refundRecord.status === 'completed' && normalizedRefundType === 'full') {
      await releaseBookedSeats({ booking, tripId: booking.tripId._id, reason: 'full-refund' });
    }

    await createTransactionLog({
      entityType: 'Refund',
      entityId: refundRecord._id,
      action: 'refund_requested',
      status: refundRecord.status,
      message: `Refund ${refundRecord.status} by admin.`,
      amount: normalizedAmount,
      referenceId: razorpayRefund.id,
      performedBy: req.user.userId,
      performedByRole: req.user.role,
      metadata: { bookingId: booking._id, paymentId: payment._id, refundType: normalizedRefundType },
    });

    const bookingAfter = await Booking.findById(booking._id).populate('tripId').populate('userId', 'name email');
    const paymentAfter = await Payment.findById(payment._id);

    if (refundRecord.status === 'completed') {
      await sendRefundNotifications({
        userId: bookingAfter.userId._id,
        bookingId: bookingAfter._id,
        refund: refundRecord,
        booking: bookingAfter,
        payment: paymentAfter,
        adminName: req.user.name || 'Admin',
        io: req.app.get('io'),
      });
    }

    return res.status(201).json({
      success: true,
      message: refundRecord.status === 'completed' ? 'Refund processed successfully.' : 'Refund is processing.',
      refund: refundRecord,
      booking: bookingAfter,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Refund processing failed.', error: error.message });
  }
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  simulateDemoPayment,
  getUserPaymentHistory,
  razorpayWebhook,
  createRefund,
};
