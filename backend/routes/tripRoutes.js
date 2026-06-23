const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const {
  addTrip,
  getVendorTrips,
  getAllPublicTrips,
  updateTrip,
  cancelTrip,
  getTripDetails,
} = require('../controllers/tripController');

const router = express.Router();

// Public routes (no auth required)
router.get('/public/search', getAllPublicTrips);

// Protected routes (vendor only)
router.use(protect);
router.use(authorizeRoles('vendor'));

router.post('/', addTrip);
router.get('/', getVendorTrips);
router.put('/:tripId', updateTrip);
router.delete('/:tripId', cancelTrip);

// Public route to get trip details (auth required here for now, can be made public)
router.get('/:tripId/details', getTripDetails);

module.exports = router;
