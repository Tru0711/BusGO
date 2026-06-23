const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const { listPublicReviews, createReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/public', listPublicReviews);
router.post('/', protect, authorizeRoles('user'), createReview);

module.exports = router;