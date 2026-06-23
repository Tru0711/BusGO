const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Trip = require('../models/Trip');
const Seat = require('../models/Seat');
const SeatReservation = require('../models/SeatReservation');
const { notifyBookingConfirmed, notifyPaymentSuccess, notifyBookingCancelled, notifyAdminAlert, createTransactionLog } = require('../services/notificationService');
const {
  LOCK_MINUTES,
  releaseSeat,
  scheduleSeatRelease,
} = require('../services/seatLockService');

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const createReservationToken = () => crypto.randomBytes(16).toString('hex');

const emitSeatUpdate = (req, tripId, payload) => {
  const io = req.app.get('io');

  if (io) {
    io.to(`trip:${tripId}`).emit('seat:update', payload);
  }
};

const emitBookingUpdate = (req, userId, payload) => {
  const io = req.app.get('io');

  if (io) {
    io.to(`user:${userId}`).emit('booking:update', payload);
  }
};

const getTripWithBus = async (tripId) => Trip.findById(tripId).populate('busId');

const releaseBookedSeats = async (booking) => {
  if (!booking?.tripId || !Array.isArray(booking.seats) || booking.seats.length === 0) {
    return;
  }

  await Seat.updateMany(
    { tripId: booking.tripId, seatNumber: { $in: booking.seats }, bookingId: booking._id },
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

  await Trip.updateOne({ _id: booking.tripId }, { $inc: { availableSeats: booking.seats.length } });
};

const lockSeats = async (req, res) => {
  try {
    const { tripId, selectedSeats } = req.body;
    const userId = req.user.userId;

    if (!tripId || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: 'Trip and seats are required.' });
    }

    const trip = await getTripWithBus(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const uniqueSeats = [...new Set(selectedSeats.map((seat) => Number(seat)))].filter((seat) => Number.isInteger(seat) && seat > 0);
    if (uniqueSeats.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected seats are invalid.' });
    }

    const seats = await Seat.find({ tripId: trip._id, seatNumber: { $in: uniqueSeats } }).lean();
    if (seats.length !== uniqueSeats.length) {
      return res.status(400).json({ success: false, message: 'One or more seats are invalid.' });
    }

    const unavailableSeat = seats.find((seat) => {
      if (seat.status === 'booked') return true;
      if (seat.status === 'reserved' && seat.lockExpiresAt && new Date(seat.lockExpiresAt) > new Date()) return true;
      if (seat.status === 'female-only' && req.user.role !== 'user') return true;
      return false;
    });

    if (unavailableSeat) {
      return res.status(409).json({ success: false, message: 'One or more selected seats are not available.' });
    }

    const reservationToken = createReservationToken();
    const lockExpiresAt = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);

    for (const seatNumber of uniqueSeats) {
      const updatedSeat = await Seat.findOneAndUpdate(
        {
          tripId: trip._id,
          seatNumber,
          $or: [
            { status: 'available' },
            { status: 'reserved', lockExpiresAt: { $lte: new Date() } },
          ],
        },
        {
          $set: {
            status: 'reserved',
            lockedBy: userId,
            lockToken: reservationToken,
            lockExpiresAt,
            reservedAt: new Date(),
          },
        },
        { new: true },
      );

      if (!updatedSeat) {
        await Promise.all(uniqueSeats.map((seat) => releaseSeat({ tripId: trip._id, seatNumber: seat, userId, req, reason: 'rollback' })));
        return res.status(409).json({ success: false, message: 'One or more selected seats were just taken. Please retry.' });
      }

      scheduleSeatRelease({ tripId: trip._id, seatNumber, lockToken: reservationToken, userId, req });
    }

    const reservation = await SeatReservation.create({
      userId,
      busId: trip.busId._id,
      tripId: trip._id,
      seatNumbers: uniqueSeats,
      reservationToken,
      reservationStartTime: new Date(),
      reservationExpiryTime: lockExpiresAt,
      status: 'active',
    });

    emitSeatUpdate(req, trip._id.toString(), {
      tripId: trip._id.toString(),
      reservedSeats: uniqueSeats,
      action: 'reserved',
      lockExpiresAt,
    });

    return res.status(200).json({
      success: true,
      message: 'Seats reserved successfully.',
      reservationToken,
      lockExpiresAt,
      reservation: {
        id: reservation._id,
        userId: reservation.userId,
        busId: reservation.busId,
        tripId: reservation.tripId,
        seatNumbers: reservation.seatNumbers,
        reservationStartTime: reservation.reservationStartTime,
        reservationExpiryTime: reservation.reservationExpiryTime,
        status: reservation.status,
      },
      tripId: trip._id,
      seats: uniqueSeats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reserve seats.', error: error.message });
  }
};

const releaseSeats = async (req, res) => {
  try {
    const { tripId, seats } = req.body;
    const userId = req.user.userId;

    if (!tripId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Trip and seats are required.' });
    }

    await Promise.all(
      seats.map((seatNumber) => releaseSeat({ tripId, seatNumber: Number(seatNumber), userId, req, reason: 'manual' })),
    );

    return res.status(200).json({ success: true, message: 'Seats released.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to release seats.', error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      busId,
      tripId,
      selectedSeats,
      date,
      reservationToken,
      paymentMethod = 'pending',
      paymentId = null,
      womenSafetyMode = false,
    } = req.body;
    const userId = req.user.userId;
    const journeyId = tripId || busId;

    if (!journeyId || !Array.isArray(selectedSeats) || selectedSeats.length === 0 || !date) {
      return res.status(400).json({ success: false, message: 'Trip, seats, and date are required.' });
    }

    if (req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only users can create bookings.' });
    }

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Bookings can only be confirmed after successful payment. Please continue to the payment step.',
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your account before booking.' });
    }

    const seatNumbers = selectedSeats.map((value) => Number(value));
    const hasInvalidSeat = seatNumbers.some((seat) => !Number.isInteger(seat) || seat < 1);
    if (hasInvalidSeat) {
      return res.status(400).json({ success: false, message: 'Selected seats are invalid.' });
    }

    const uniqueSeats = [...new Set(seatNumbers)];
    const travelDate = normalizeDate(date);

    const trip = await getTripWithBus(journeyId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const totalSeats = trip.busId?.totalSeats || trip.availableSeats || 0;
    if (uniqueSeats.some((seat) => seat > totalSeats)) {
      return res.status(400).json({ success: false, message: 'One or more selected seats are outside valid seat range.' });
    }

    const reservedSeats = await Seat.find({ tripId: trip._id, seatNumber: { $in: uniqueSeats } }).lean();
    if (reservedSeats.length !== uniqueSeats.length) {
      return res.status(409).json({ success: false, message: 'Seats are no longer available.' });
    }

    const invalidReservation = reservedSeats.find((seat) => {
      if (seat.status === 'booked') return true;
      if (seat.status === 'female-only' && req.user.role !== 'user') return true;
      if (seat.lockToken !== reservationToken) return true;
      if (!seat.lockExpiresAt || new Date(seat.lockExpiresAt) < new Date()) return true;
      if (String(seat.lockedBy) !== userId) return true;
      return false;
    });

    if (invalidReservation) {
      return res.status(409).json({ success: false, message: 'Your seat hold expired or is invalid. Please reserve again.' });
    }

    const bookingTotal = uniqueSeats.length * trip.price;

    const booking = await Booking.create({
      userId,
      busId: trip.busId._id,
      busName: trip.busId.busName,
      from: trip.fromLocation,
      to: trip.toLocation,
      journeyDate: travelDate,
      departureTime: trip.departureTime,
      seatNumber: uniqueSeats,
      passengerName: req.user.name || '',
      womenSafetyMode: Boolean(womenSafetyMode),
      price: bookingTotal,
      status: paymentId ? 'confirmed' : 'pending',
      tripId: trip._id,
      vendorId: trip.vendorId,
      seats: uniqueSeats,
      date: travelDate,
      totalPrice: bookingTotal,
      bookingStatus: paymentId ? 'confirmed' : 'pending',
      transactionStatus: paymentId ? 'paid' : 'pending',
      paymentStatus: paymentId ? 'paid' : 'pending',
      reservationStatus: 'active',
      paymentMethod,
      paymentId,
      reservationToken,
      lockExpiresAt: new Date(Date.now() + LOCK_MINUTES * 60 * 1000),
    });

    const paymentRecord = await Payment.create({
      bookingId: booking._id,
      userId,
      vendorId: trip.vendorId,
      paymentProvider: paymentMethod === 'pending' ? 'upi' : paymentMethod,
      orderId: `ord_${Date.now()}_${createReservationToken().slice(0, 8)}`,
      paymentId,
      amount: bookingTotal,
      currency: 'INR',
      status: paymentId ? 'paid' : 'created',
      metadata: { tripId: trip._id, seatNumbers: uniqueSeats },
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

    await Trip.updateOne({ _id: trip._id }, { $inc: { availableSeats: -uniqueSeats.length } });

    emitSeatUpdate(req, trip._id.toString(), {
      tripId: trip._id.toString(),
      bookedSeats: uniqueSeats,
      action: 'booked',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('busId', 'busName busNumber busType')
      .populate('tripId', 'fromLocation toLocation travelDate departureTime arrivalTime price')
      .populate('userId', 'name email');

    if (paymentId || booking.bookingStatus === 'confirmed') {
      const io = req.app.get('io');
      await notifyBookingConfirmed({ booking: populatedBooking, payment: paymentRecord, userId, io });
      if (paymentId) {
        await notifyPaymentSuccess({ booking: populatedBooking, payment: paymentRecord, userId, io });
      }
      if (paymentId) {
        await createTransactionLog({
          entityType: 'Booking',
          entityId: booking._id,
          action: 'booking_created',
          status: 'confirmed',
          message: 'Booking confirmed and notification sent.',
          amount: bookingTotal,
          referenceId: paymentRecord._id.toString(),
          performedBy: userId,
          performedByRole: req.user.role,
          metadata: { tripId: trip._id.toString(), seats: uniqueSeats },
        });
      }
    }

    emitBookingUpdate(req, userId, {
      action: 'created',
      bookingId: booking._id.toString(),
      status: booking.bookingStatus,
    });

    return res.status(201).json({
      success: true,
      message: paymentId ? 'Booking confirmed successfully.' : 'Booking created and awaiting payment confirmation.',
      booking: {
        id: populatedBooking._id,
        bus: populatedBooking.busId,
        trip: populatedBooking.tripId,
        user: populatedBooking.userId,
        seats: populatedBooking.seats,
        date: populatedBooking.date,
        busName: populatedBooking.busName,
        from: populatedBooking.from,
        to: populatedBooking.to,
        journeyDate: populatedBooking.journeyDate || populatedBooking.date,
        departureTime: populatedBooking.departureTime,
        seatNumber: populatedBooking.seatNumber?.length ? populatedBooking.seatNumber : populatedBooking.seats,
        passengerName: populatedBooking.passengerName || populatedBooking.userId?.name || '',
        womenSafetyMode: populatedBooking.womenSafetyMode,
        price: populatedBooking.price || populatedBooking.totalPrice,
        totalPrice: populatedBooking.totalPrice,
        status: populatedBooking.status || populatedBooking.bookingStatus,
        paymentId: populatedBooking.paymentId,
        transactionStatus: populatedBooking.transactionStatus,
        paymentStatus: populatedBooking.paymentStatus,
        reservationStatus: populatedBooking.reservationStatus,
        transactionId: populatedBooking.transactionId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create booking.', error: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('busId', 'busName busNumber busType')
      .populate('tripId', 'fromLocation toLocation travelDate departureTime arrivalTime price')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings: bookings.map((booking) => ({
        id: booking._id,
        busName: booking.busId?.busName || 'N/A',
        from: booking.from || booking.tripId?.fromLocation || '',
        to: booking.to || booking.tripId?.toLocation || '',
        journeyDate: booking.journeyDate || booking.date,
        departureTime: booking.departureTime || booking.tripId?.departureTime || '',
        seatNumber: booking.seatNumber?.length ? booking.seatNumber : booking.seats,
        passengerName: booking.passengerName || req.user.name || '',
        womenSafetyMode: booking.womenSafetyMode,
        price: booking.price || booking.totalPrice,
        status: booking.status || booking.bookingStatus,
        totalPrice: booking.totalPrice,
        transactionStatus: booking.transactionStatus,
        paymentStatus: booking.paymentStatus,
        reservationStatus: booking.reservationStatus,
        transactionId: booking.transactionId,
        createdAt: booking.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user bookings.', error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.userId })
      .populate('busId', 'busName busNumber busType')
      .populate('tripId', 'fromLocation toLocation travelDate departureTime arrivalTime price');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.status(200).json({
      success: true,
      booking: {
        id: booking._id,
        bus: booking.busId,
        trip: booking.tripId,
        seats: booking.seats,
        date: booking.date,
        busName: booking.busName,
        from: booking.from,
        to: booking.to,
        journeyDate: booking.journeyDate || booking.date,
        departureTime: booking.departureTime,
        seatNumber: booking.seatNumber?.length ? booking.seatNumber : booking.seats,
        passengerName: booking.passengerName || req.user.name || '',
        womenSafetyMode: booking.womenSafetyMode,
        price: booking.price || booking.totalPrice,
        totalPrice: booking.totalPrice,
        status: booking.status || booking.bookingStatus,
        transactionStatus: booking.transactionStatus,
        paymentStatus: booking.paymentStatus,
        reservationStatus: booking.reservationStatus,
        transactionId: booking.transactionId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch booking details.', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.userId }).populate('tripId').populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if ((booking.paymentStatus || booking.transactionStatus) !== 'paid') {
      return res.status(409).json({ success: false, message: 'Ticket is available only after successful payment.' });
    }

    if (['cancelled', 'refunded'].includes(booking.bookingStatus)) {
      return res.status(409).json({ success: false, message: 'Booking is already cancelled or refunded.' });
    }

    await releaseBookedSeats(booking);

    booking.bookingStatus = 'cancelled';
    booking.status = 'cancelled';
    booking.transactionStatus = 'cancelled';
    booking.refundStatus = booking.refundStatus === 'completed' ? booking.refundStatus : 'none';
    await booking.save();

    const io = req.app.get('io');
    await notifyBookingCancelled({ booking, userId: req.user.userId, io });
    await notifyAdminAlert({
      message: `Booking ${String(booking._id)} was cancelled by ${req.user.name || booking.userId?.name || 'a user'}.`,
      title: 'Booking cancelled',
      metadata: {
        bookingId: booking._id,
        userId: req.user.userId,
        routeLabel: booking.tripId ? `${booking.tripId.fromLocation || 'Route'} to ${booking.tripId.toLocation || 'destination'}` : 'route',
      },
      io,
      sourceEvent: 'booking_cancelled',
      relatedBooking: booking._id,
      relatedPayment: null,
      performedByRole: req.user.role,
    });

    await createTransactionLog({
      entityType: 'Booking',
      entityId: booking._id,
      action: 'booking_cancelled',
      status: 'cancelled',
      message: 'Booking cancelled by user.',
      amount: Number(booking.totalPrice || 0),
      referenceId: booking.paymentId || null,
      performedBy: req.user.userId,
      performedByRole: req.user.role,
      metadata: { seats: booking.seats },
    });

    emitBookingUpdate(req, req.user.userId, {
      action: 'cancelled',
      bookingId: booking._id.toString(),
      status: booking.status,
    });

    return res.status(200).json({ success: true, message: 'Booking cancelled successfully.', bookingId: booking._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel booking.', error: error.message });
  }
};

const downloadTicket = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.userId })
      .populate('busId', 'busName busNumber busType')
      .populate('tripId', 'fromLocation toLocation travelDate departureTime arrivalTime price')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const ticketText = [
      'BusGo Ticket',
      `Booking ID: ${booking._id}`,
      `Ticket ID: TKT-${String(booking._id).slice(-8).toUpperCase()}`,
      `Transaction ID: ${booking.transactionId || booking.paymentId || ''}`,
      `Passenger: ${booking.passengerName || booking.userId?.name || ''}`,
      `Bus Name: ${booking.busName || booking.busId?.busName || 'N/A'}`,
      `Route: ${booking.from || booking.tripId?.fromLocation || ''} -> ${booking.to || booking.tripId?.toLocation || ''}`,
      `Journey Date: ${(booking.journeyDate || booking.date || new Date()).toLocaleDateString()}`,
      `Departure Time: ${booking.departureTime || booking.tripId?.departureTime || ''}`,
      `Seat Number: ${(booking.seatNumber || booking.seats || []).join(', ')}`,
      `Women's Safety Mode: ${booking.womenSafetyMode ? 'Enabled' : 'Disabled'}`,
      `Ticket Price: ₹${booking.price || booking.totalPrice || 0}`,
      `Booking Status: ${booking.status || booking.bookingStatus}`,
      `Created At: ${booking.createdAt ? new Date(booking.createdAt).toLocaleString() : ''}`,
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${booking._id}.txt"`);
    return res.status(200).send(ticketText);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to download ticket.', error: error.message });
  }
};

module.exports = {
  createBooking,
  lockSeats,
  releaseSeats,
  getUserBookings,
  getBookingById,
  cancelBooking,
  downloadTicket,
};
