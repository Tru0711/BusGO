const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const {
  addBus,
  deleteBus,
  getVendorBuses,
  getVendorBookings,
  getVendorDashboardSummary,
  getVendorTrips,
  getVendorTripBookings,
  getVendorTripAnalytics,
  getVendorProfile,
  updateBus,
  updateVendorProfile,
} = require('../controllers/vendorController');
const {
  createOffer,
  getVendorOffers,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('vendor'));

router.get('/dashboard', getVendorDashboardSummary);
router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);
router.post('/add-bus', addBus);
router.get('/buses', getVendorBuses);
router.put('/buses/:id', updateBus);
router.delete('/buses/:id', deleteBus);
router.get('/bookings', getVendorBookings);
router.get('/trips', getVendorTrips);
router.get('/trips/:tripId/bookings', getVendorTripBookings);
router.get('/trips/:tripId/analytics', getVendorTripAnalytics);

// Offer routes
router.post('/offers', createOffer);
router.get('/offers', getVendorOffers);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

module.exports = router;