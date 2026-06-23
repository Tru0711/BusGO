const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const {
  createEmergencyContact,
  createSOSAlert,
  deleteEmergencyContact,
  getAdminSOSAlerts,
  getEmergencyContacts,
  getSafetyReports,
  getUserSOSHistory,
  updateEmergencyContact,
  updateSOSStatus,
} = require('../controllers/safetyController');

const router = express.Router();

router.get('/contacts', protect, authorizeRoles('user'), getEmergencyContacts);
router.post('/contacts', protect, authorizeRoles('user'), createEmergencyContact);
router.put('/contacts/:id', protect, authorizeRoles('user'), updateEmergencyContact);
router.delete('/contacts/:id', protect, authorizeRoles('user'), deleteEmergencyContact);

router.post('/sos', protect, authorizeRoles('user'), createSOSAlert);
router.get('/sos/history', protect, authorizeRoles('user'), getUserSOSHistory);

router.get('/admin/sos-alerts', protect, authorizeRoles('admin'), getAdminSOSAlerts);
router.patch('/admin/sos-alerts/:id', protect, authorizeRoles('admin'), updateSOSStatus);
router.get('/admin/reports', protect, authorizeRoles('admin'), getSafetyReports);

module.exports = router;
