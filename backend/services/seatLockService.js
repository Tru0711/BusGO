const Seat = require('../models/Seat');
const SeatReservation = require('../models/SeatReservation');

const LOCK_MINUTES = 10;
const activeLocks = new Map();

const buildLockKey = (tripId, seatNumber) => `${tripId}:${seatNumber}`;

const clearScheduledLock = (key) => {
  const existing = activeLocks.get(key);
  if (existing) {
    clearTimeout(existing.timer);
    activeLocks.delete(key);
  }
};

const emitSeatUpdate = (req, tripId, payload) => {
  const io = req?.app?.get('io');
  if (io) {
    io.to(`trip:${tripId}`).emit('seat:update', payload);
  }
};

const releaseSeat = async ({ tripId, seatNumber, userId, reason = 'expired', req }) => {
  const key = buildLockKey(tripId, seatNumber);
  clearScheduledLock(key);

  const seat = await Seat.findOne({ tripId, seatNumber });
  if (!seat || seat.status === 'booked') {
    return null;
  }

  if (userId && seat.lockedBy && seat.lockedBy.toString() !== String(userId)) {
    return null;
  }

  const reservationToken = seat.lockToken;

  seat.status = 'available';
  seat.lockedBy = null;
  seat.lockToken = null;
  seat.lockExpiresAt = null;
  seat.reservedAt = null;
  await seat.save();

  if (reservationToken) {
    await SeatReservation.updateMany(
      { reservationToken, status: 'active' },
      { $set: { status: 'expired' } },
    );
  }

  emitSeatUpdate(req, tripId, { tripId: String(tripId), releasedSeats: [seatNumber], reason });
  return seat;
};

const scheduleSeatRelease = ({ tripId, seatNumber, lockToken, userId, req }) => {
  const key = buildLockKey(tripId, seatNumber);
  clearScheduledLock(key);

  const timer = setTimeout(() => {
    releaseSeat({ tripId, seatNumber, userId, reason: 'timeout', req }).catch(() => undefined);
  }, LOCK_MINUTES * 60 * 1000);

  activeLocks.set(key, { timer, lockToken, userId });
};

const registerExpiredLocksRecovery = async () => {
  const expiredLocks = await Seat.find({ status: 'reserved', lockExpiresAt: { $lte: new Date() } });
  await Promise.all(
    expiredLocks.map(async (seat) => {
      seat.status = 'available';
      seat.lockedBy = null;
      seat.lockToken = null;
      seat.lockExpiresAt = null;
      seat.reservedAt = null;
      await seat.save();
    }),
  );
  await SeatReservation.updateMany(
    { status: 'active', reservationExpiryTime: { $lte: new Date() } },
    { $set: { status: 'expired' } },
  );
};

module.exports = {
  LOCK_MINUTES,
  buildLockKey,
  clearScheduledLock,
  releaseSeat,
  scheduleSeatRelease,
  registerExpiredLocksRecovery,
};
