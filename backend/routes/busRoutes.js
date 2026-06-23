const express = require('express');
const { getBusLocations, getPublicRoutes, getFeaturedOperators, searchBuses, getBusById } = require('../controllers/busController');

const router = express.Router();

router.get('/locations', getBusLocations);
router.get('/routes', getPublicRoutes);
router.get('/operators', getFeaturedOperators);
router.get('/search', searchBuses);
router.get('/:id', getBusById);

module.exports = router;
