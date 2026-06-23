const express = require('express');
const { getAllOffers } = require('../controllers/offerController');

const router = express.Router();

// Public endpoint to get all active offers
router.get('/', getAllOffers);

module.exports = router;
