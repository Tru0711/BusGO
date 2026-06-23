const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const {
  addBus,
  getVendorBuses,
  updateBus,
  deleteBus,
  getBusDetails,
} = require('../controllers/busStaticController');

const router = express.Router();

// Protected routes (vendor only)
router.use(protect);
router.use(authorizeRoles('vendor'));

router.post('/', addBus);
router.get('/', getVendorBuses);
router.get('/:busId', getBusDetails);
router.put('/:busId', updateBus);
router.delete('/:busId', deleteBus);

module.exports = router;
