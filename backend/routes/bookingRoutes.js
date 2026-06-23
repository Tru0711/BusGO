const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const { createBooking, lockSeats, releaseSeats, getUserBookings, getBookingById, cancelBooking, downloadTicket } = require('../controllers/bookingController');

const router = express.Router();

router.post('/', protect, authorizeRoles('user'), createBooking);
router.post('/lock', protect, authorizeRoles('user'), lockSeats);
router.post('/release', protect, authorizeRoles('user'), releaseSeats);
router.patch('/:id/cancel', protect, authorizeRoles('user'), cancelBooking);
router.get('/:id/ticket', protect, authorizeRoles('user'), downloadTicket);
router.get('/user', protect, authorizeRoles('user'), getUserBookings);
router.get('/:id', protect, authorizeRoles('user'), getBookingById);

module.exports = router;