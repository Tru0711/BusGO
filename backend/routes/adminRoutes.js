const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const {
  adminLogin,
  getAllVendors,
  approveVendor,
  rejectVendor,
  getAllUsers,
  getAllBookings,
  getAdminStats,
} = require('../controllers/adminController');

const router = express.Router();

router.post('/login', adminLogin);

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.get('/vendors', getAllVendors);
router.put('/approve-vendor/:id', approveVendor);
router.put('/reject-vendor/:id', rejectVendor);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);

module.exports = router;