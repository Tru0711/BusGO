const activeSeatLocks = new Map();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ROOM_PREFIX = 'trip:';
const USER_ROOM_PREFIX = 'user:';

const registerRealtimeLayer = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id name email role isVerified isApproved');

      if (!user) {
        return next(new Error('Authentication required.'));
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };

      return next();
    } catch (error) {
      return next(new Error('Authentication required.'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.user?.id) {
      socket.join(`${USER_ROOM_PREFIX}${socket.user.id}`);
      if (socket.user.role === 'admin') {
        socket.join('role:admin');
      }
    }

    socket.on('trip:join', (tripId) => {
      if (!tripId) {
        return;
      }

      socket.join(`${ROOM_PREFIX}${tripId}`);
    });

    socket.on('trip:leave', (tripId) => {
      if (!tripId) {
        return;
      }

      socket.leave(`${ROOM_PREFIX}${tripId}`);
    });

    socket.on('notification:subscribe', () => {
      if (socket.user?.id) {
        socket.join(`${USER_ROOM_PREFIX}${socket.user.id}`);
        if (socket.user.role === 'admin') {
          socket.join('role:admin');
        }
      }
    });

    socket.on('notification:unsubscribe', () => {
      if (socket.user?.id) {
        socket.leave(`${USER_ROOM_PREFIX}${socket.user.id}`);
      }
    });
  });
};

const setSeatLock = (key, payload, onExpire) => {
  clearSeatLock(key);

  const timeout = setTimeout(() => {
    activeSeatLocks.delete(key);
    if (typeof onExpire === 'function') {
      onExpire(payload);
    }
  }, payload.ttlMs);

  activeSeatLocks.set(key, { payload, timeout });
};

const clearSeatLock = (key) => {
  const existing = activeSeatLocks.get(key);
  if (existing) {
    clearTimeout(existing.timeout);
    activeSeatLocks.delete(key);
  }
};

const getSeatLock = (key) => activeSeatLocks.get(key)?.payload || null;

module.exports = {
  registerRealtimeLayer,
  setSeatLock,
  clearSeatLock,
  getSeatLock,
};