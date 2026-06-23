const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { Server } = require('socket.io');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
// const busRoutes = require('./routes/busRoutes'); // Deprecated: Use busStaticRoutes + tripRoutes instead
const busStaticRoutes = require('./routes/busStaticRoutes');
const tripRoutes = require('./routes/tripRoutes');
const busRoutes = require('./routes/busRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const { registerRealtimeLayer } = require('./services/realtime');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const { registerExpiredLocksRecovery } = require('./services/seatLockService');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

connectDB();
registerExpiredLocksRecovery().catch(() => undefined);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true,
    credentials: true,
  }),
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(requestLogger);
app.use(
  express.json({
    verify: (req, res, buffer) => {
      if (req.originalUrl === '/api/payments/webhook') {
        req.rawBody = Buffer.from(buffer);
      }
    },
  }),
);
app.use(mongoSanitize());

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true,
    credentials: true,
  },
});

app.set('io', io);
registerRealtimeLayer(io);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Online Bus Ticket Booking API is running.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/buses-static', busStaticRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/safety', safetyRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
