const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, authorizeRoles('user'), getUserProfile);
router.patch('/profile', protect, authorizeRoles('user'), updateUserProfile);

module.exports = router;