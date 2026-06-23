const express = require('express');
const protect = require('../middleware/authMiddleware');
const {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markNotificationUnread,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);

router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markNotificationRead);
router.patch('/:id/unread', markNotificationUnread);
router.delete('/:id', deleteNotification);

module.exports = router;