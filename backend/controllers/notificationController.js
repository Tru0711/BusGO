const Notification = require('../models/Notification');

const normalizeLimit = (value, fallback = 20) => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 100);
};

const listNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = normalizeLimit(req.query.limit, 20);
    const sort = String(req.query.sort || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const unreadOnly = String(req.query.unreadOnly || 'false').toLowerCase() === 'true';
    const filter = { user: req.user.userId };

    if (unreadOnly) {
      filter.isRead = false;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user.userId, isRead: false }),
      Notification.find(filter).sort({ createdAt: sort }).skip((page - 1) * limit).limit(limit).lean(),
    ]);

    return res.status(200).json({
      success: true,
      notifications: notifications.map((notification) => ({
        id: notification._id,
        user: notification.user,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        relatedBooking: notification.relatedBooking,
        relatedPayment: notification.relatedPayment,
        isRead: notification.isRead,
        readAt: notification.readAt,
        metadata: notification.metadata || {},
        createdAt: notification.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ user: req.user.userId, isRead: false });

    return res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch unread count.', error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({ user: req.user.userId, isRead: false });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification: {
        id: notification._id,
        isRead: notification.isRead,
        readAt: notification.readAt,
      },
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read.', error: error.message });
  }
};

const markNotificationUnread = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        $set: {
          isRead: false,
          readAt: null,
        },
      },
      { new: true },
    ).lean();

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({ user: req.user.userId, isRead: false });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as unread.',
      notification: {
        id: notification._id,
        isRead: notification.isRead,
        readAt: notification.readAt,
      },
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notification as unread.', error: error.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      modifiedCount: result.modifiedCount || 0,
      unreadCount: 0,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark all notifications as read.', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const result = await Notification.deleteOne({ _id: req.params.id, user: req.user.userId });

    if (!result.deletedCount) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({ user: req.user.userId, isRead: false });

    return res.status(200).json({ success: true, message: 'Notification deleted.', unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete notification.', error: error.message });
  }
};

module.exports = {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markNotificationUnread,
  markAllRead,
  deleteNotification,
};