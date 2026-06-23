const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const { getUserDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/user', protect, authorizeRoles('user'), getUserDashboard);

module.exports = router;
