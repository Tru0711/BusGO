const Notification = require('../models/Notification');
const TransactionLog = require('../models/TransactionLog');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const sanitizeText = (value) => String(value || '').replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, '').trim();

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildNotificationKey = ({ userId, type, relatedBookingId = null, relatedPaymentId = null, sourceEvent = null, extraKey = null }) => {
  return [String(userId), String(type), String(relatedBookingId || ''), String(relatedPaymentId || ''), String(sourceEvent || ''), String(extraKey || '')].join(':');
};

const buildEmailTemplate = ({ title, message, details = [], ctaLabel = null, ctaUrl = null, accent = '#0F766E' }) => {
  const detailRows = details
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#64748b;font-size:14px;">${escapeHtml(item.label)}</td>
          <td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;text-align:right;">${escapeHtml(item.value)}</td>
        </tr>
      `,
    )
    .join('');

  return `
    <div style="margin:0;padding:0;background:#f7f4ee;font-family:Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ee;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.08);">
              <tr>
                <td style="background:${accent};padding:24px 28px;color:#ffffff;">
                  <div style="font-size:22px;font-weight:800;line-height:1.2;">BusGo</div>
                  <div style="font-size:13px;opacity:0.9;margin-top:6px;">${escapeHtml(title)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <h2 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0f172a;">${escapeHtml(title)}</h2>
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(message)}</p>
                  ${details.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;border-top:1px solid #e2e8f0;">${detailRows}</table>` : ''}
                  ${ctaLabel && ctaUrl ? `<div style="margin-top:24px;"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;">${escapeHtml(ctaLabel)}</a></div>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

const getEventTemplate = ({ type, payload }) => {
  switch (type) {
    case 'booking_confirmed':
      return {
        subject: `${process.env.APP_NAME || 'BusGo'} booking confirmed`,
        title: 'Booking confirmed',
        message: `Your booking for ${payload.routeLabel} has been confirmed successfully.`,
        details: [
          { label: 'Booking ID', value: payload.bookingId },
          { label: 'Seats', value: payload.seatsLabel },
          { label: 'Journey date', value: payload.dateLabel },
          { label: 'Amount', value: `₹${payload.amountLabel}` },
        ],
        ctaLabel: 'View booking',
        ctaUrl: payload.ctaUrl,
      };
    case 'payment_success':
      return {
        subject: `${process.env.APP_NAME || 'BusGo'} payment successful`,
        title: 'Payment successful',
        message: `We received your payment for ${payload.routeLabel}.`,
        details: [
          { label: 'Payment ID', value: payload.paymentId },
          { label: 'Booking ID', value: payload.bookingId },
          { label: 'Amount', value: `₹${payload.amountLabel}` },
        ],
        ctaLabel: 'View booking',
        ctaUrl: payload.ctaUrl,
      };
    case 'payment_failed':
      return {
        subject: `${process.env.APP_NAME || 'BusGo'} payment failed`,
        title: 'Payment failed',
        message: `Your payment for ${payload.routeLabel} could not be completed.`,
        details: [
          { label: 'Booking ID', value: payload.bookingId || 'N/A' },
          { label: 'Reason', value: payload.reasonLabel || 'Payment failed at provider' },
        ],
      };
    case 'refund_processed':
      return {
        subject: `${process.env.APP_NAME || 'BusGo'} refund processed`,
        title: 'Refund processed',
        message: `Your ${payload.refundTypeLabel} refund for ${payload.routeLabel} has been processed.`,
        details: [
          { label: 'Refund ID', value: payload.refundId },
          { label: 'Amount', value: `₹${payload.amountLabel}` },
          { label: 'Status', value: payload.statusLabel },
        ],
        ctaLabel: 'View booking',
        ctaUrl: payload.ctaUrl,
        accent: '#b45309',
      };
    case 'booking_cancelled':
      return {
        subject: `${process.env.APP_NAME || 'BusGo'} booking cancelled`,
        title: 'Booking cancelled',
        message: `Your booking for ${payload.routeLabel} has been cancelled.`,
        details: [
          { label: 'Booking ID', value: payload.bookingId },
          { label: 'Seats', value: payload.seatsLabel },
        ],
      };
    case 'refund_failed':
      return {
        subject: `${process.env.APP_NAME || 'BusGo'} refund failed`,
        title: 'Refund failed',
        message: `Your refund request could not be completed.`,
        details: [
          { label: 'Refund ID', value: payload.refundId || 'N/A' },
          { label: 'Reason', value: payload.reasonLabel || 'Provider rejection' },
        ],
      };
    case 'admin_alert':
      return {
        subject: `${process.env.APP_NAME || 'BusGo'} admin alert`,
        title: 'Admin alert',
        message: payload.messageLabel || 'A system alert requires attention.',
        details: payload.details || [],
      };
    default:
      return {
        subject: `${process.env.APP_NAME || 'BusGo'} notification`,
        title: 'Notification',
        message: payload.messageLabel || 'You have a new notification.',
        details: payload.details || [],
      };
  }
};

const emitNotification = (io, notification, unreadCount = null) => {
  if (!io || !notification) {
    return;
  }

  io.to(`user:${notification.user.toString()}`).emit('notification:new', {
    notification,
  });

  if (typeof unreadCount === 'number') {
    io.to(`user:${notification.user.toString()}`).emit('notification:count', {
      unreadCount,
    });
  }
};

const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedBooking = null,
  relatedPayment = null,
  metadata = {},
  channels = ['in-app'],
  dedupeKey = null,
  sourceEvent = null,
  createdByRole = null,
  emailEnabled = true,
  io = null,
  ctaUrl = null,
  payload = {},
}) => {
  if (!userId || !type || !title || !message) {
    throw new Error('Notification requires userId, type, title, and message.');
  }

  const cleanTitle = sanitizeText(title);
  const cleanMessage = sanitizeText(message);
  const nextDedupeKey = dedupeKey || buildNotificationKey({
    userId,
    type,
    relatedBookingId: relatedBooking,
    relatedPaymentId: relatedPayment,
    sourceEvent,
    extraKey: metadata?.dedupeKey || metadata?.referenceId || metadata?.orderId || metadata?.paymentId || metadata?.bookingId || metadata?.refundId || title,
  });

  let notification = await Notification.findOne({ dedupeKey: nextDedupeKey });

  if (!notification) {
    notification = await Notification.create({
      user: userId,
      title: cleanTitle,
      message: cleanMessage,
      type,
      relatedBooking,
      relatedPayment,
      metadata,
      channels,
      dedupeKey: nextDedupeKey,
      createdByRole,
      sourceEvent,
      extra: payload,
    });
  }

  const user = await User.findById(userId).select('name email role');
  const shouldEmail = emailEnabled && channels.includes('email') && Boolean(user?.email) && !notification.emailSentAt;

  if (shouldEmail) {
    const template = getEventTemplate({ type, payload: { ...payload, ...metadata, bookingId: metadata.bookingId || relatedBooking, paymentId: metadata.paymentId || relatedPayment, ctaUrl, messageLabel: cleanMessage } });
    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: buildEmailTemplate({
        title: template.title,
        message: template.message,
        details: template.details || [],
        ctaLabel: template.ctaLabel || null,
        ctaUrl: template.ctaUrl || null,
        accent: template.accent || '#0F766E',
      }),
    });

    notification.emailSentAt = new Date();
    notification.emailStatus = 'sent';
    await notification.save();
  } else if (channels.includes('email') && !user?.email) {
    notification.emailStatus = 'skipped';
    await notification.save();
  }

  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
  emitNotification(io, notification.toObject(), unreadCount);

  return notification;
};

const createTransactionLog = async ({ entityType, entityId, action, status, message = '', amount = 0, referenceId = null, performedBy = null, performedByRole = null, metadata = {} }) => {
  return TransactionLog.create({
    entityType,
    entityId,
    action,
    status,
    message,
    amount,
    referenceId,
    performedBy,
    performedByRole,
    metadata,
  });
};

const notifyBookingConfirmed = async ({ booking, payment = null, userId, io = null }) => {
  const routeLabel = booking.tripId ? `${booking.tripId.fromLocation || 'Route'} to ${booking.tripId.toLocation || 'destination'}` : 'your trip';
  return createNotification({
    userId,
    type: 'booking_confirmed',
    title: 'Booking confirmed',
    message: `Your booking for ${routeLabel} has been confirmed.`,
    relatedBooking: booking._id,
    relatedPayment: payment?._id || null,
    channels: ['in-app', 'email'],
    metadata: {
      bookingId: booking._id,
      paymentId: payment?._id || null,
      routeLabel,
      seatsLabel: Array.isArray(booking.seats) ? booking.seats.join(', ') : '',
      dateLabel: booking.date ? new Date(booking.date).toLocaleDateString() : '',
      amountLabel: booking.totalPrice,
      ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-confirmation/${booking._id}`,
      dedupeKey: `booking_confirmed:${booking._id}`,
    },
    sourceEvent: 'booking_confirmed',
    createdByRole: 'system',
    io,
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-confirmation/${booking._id}`,
    payload: {
      bookingId: booking._id,
      routeLabel,
      seatsLabel: Array.isArray(booking.seats) ? booking.seats.join(', ') : '',
      dateLabel: booking.date ? new Date(booking.date).toLocaleDateString() : '',
      amountLabel: booking.totalPrice,
    },
  });
};

const notifyPaymentSuccess = async ({ booking, payment, userId, io = null }) => {
  const routeLabel = booking.tripId ? `${booking.tripId.fromLocation || 'Route'} to ${booking.tripId.toLocation || 'destination'}` : 'your trip';
  return createNotification({
    userId,
    type: 'payment_success',
    title: 'Payment successful',
    message: `Payment received for ${routeLabel}.`,
    relatedBooking: booking?._id || null,
    relatedPayment: payment?._id || null,
    channels: ['in-app', 'email'],
    metadata: {
      bookingId: booking?._id || null,
      paymentId: payment?._id || null,
      routeLabel,
      amountLabel: payment?.amount || booking?.totalPrice || 0,
      dedupeKey: `payment_success:${payment?._id || booking?._id}`,
      ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-confirmation/${booking._id}`,
    },
    sourceEvent: 'payment_success',
    createdByRole: 'system',
    io,
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-confirmation/${booking._id}`,
    payload: {
      bookingId: booking?._id,
      paymentId: payment?._id,
      routeLabel,
      amountLabel: payment?.amount || booking?.totalPrice || 0,
    },
  });
};

const notifyPaymentFailed = async ({ userId, booking = null, payment = null, reason = 'Payment failed at provider', io = null }) => {
  const routeLabel = booking?.tripId ? `${booking.tripId.fromLocation || 'Route'} to ${booking.tripId.toLocation || 'destination'}` : 'your trip';
  return createNotification({
    userId,
    type: 'payment_failed',
    title: 'Payment failed',
    message: `Your payment for ${routeLabel} could not be completed.`,
    relatedBooking: booking?._id || null,
    relatedPayment: payment?._id || null,
    channels: ['in-app', 'email'],
    metadata: {
      bookingId: booking?._id || null,
      paymentId: payment?._id || null,
      routeLabel,
      reasonLabel: reason,
      dedupeKey: `payment_failed:${payment?._id || booking?._id || reason}`,
    },
    sourceEvent: 'payment_failed',
    createdByRole: 'system',
    io,
    payload: { bookingId: booking?._id, paymentId: payment?._id, reasonLabel: reason, routeLabel },
  });
};

const notifyRefundProcessed = async ({ userId, booking, payment, refund, io = null }) => {
  const routeLabel = booking?.tripId ? `${booking.tripId.fromLocation || 'Route'} to ${booking.tripId.toLocation || 'destination'}` : 'your trip';
  return createNotification({
    userId,
    type: 'refund_processed',
    title: 'Refund processed',
    message: `Your ${refund.refundType} refund for ${routeLabel} has been processed.`,
    relatedBooking: booking?._id || null,
    relatedPayment: payment?._id || null,
    channels: ['in-app', 'email'],
    metadata: {
      bookingId: booking?._id || null,
      paymentId: payment?._id || null,
      refundId: refund?._id || null,
      routeLabel,
      refundTypeLabel: refund.refundType,
      amountLabel: refund.amount,
      statusLabel: refund.status,
      dedupeKey: `refund_processed:${refund?._id || booking?._id}`,
      ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/refund-status/success/${refund._id}`,
    },
    sourceEvent: 'refund_processed',
    createdByRole: 'system',
    io,
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/refund-status/success/${refund._id}`,
    payload: {
      bookingId: booking?._id,
      paymentId: payment?._id,
      refundId: refund._id,
      routeLabel,
      refundTypeLabel: refund.refundType,
      amountLabel: refund.amount,
      statusLabel: refund.status,
    },
  });
};

const notifyRefundFailed = async ({ userId, booking = null, payment = null, refund = null, reason = 'Refund failed at provider', io = null }) => {
  const routeLabel = booking?.tripId ? `${booking.tripId.fromLocation || 'Route'} to ${booking.tripId.toLocation || 'destination'}` : 'your trip';
  return createNotification({
    userId,
    type: 'refund_failed',
    title: 'Refund failed',
    message: `Your refund for ${routeLabel} could not be completed.`,
    relatedBooking: booking?._id || null,
    relatedPayment: payment?._id || null,
    channels: ['in-app', 'email'],
    metadata: {
      bookingId: booking?._id || null,
      paymentId: payment?._id || null,
      refundId: refund?._id || null,
      routeLabel,
      reasonLabel: reason,
      dedupeKey: `refund_failed:${refund?._id || payment?._id || booking?._id || reason}`,
    },
    sourceEvent: 'refund_failed',
    createdByRole: 'system',
    io,
    payload: {
      bookingId: booking?._id,
      paymentId: payment?._id,
      refundId: refund?._id,
      reasonLabel: reason,
      routeLabel,
    },
  });
};

const notifyBookingCancelled = async ({ booking, userId, io = null }) => {
  const routeLabel = booking.tripId ? `${booking.tripId.fromLocation || 'Route'} to ${booking.tripId.toLocation || 'destination'}` : 'your trip';
  return createNotification({
    userId,
    type: 'booking_cancelled',
    title: 'Booking cancelled',
    message: `Your booking for ${routeLabel} has been cancelled.`,
    relatedBooking: booking._id,
    channels: ['in-app', 'email'],
    metadata: {
      bookingId: booking._id,
      routeLabel,
      seatsLabel: Array.isArray(booking.seats) ? booking.seats.join(', ') : '',
      dedupeKey: `booking_cancelled:${booking._id}`,
      ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings`,
    },
    sourceEvent: 'booking_cancelled',
    createdByRole: 'system',
    io,
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings`,
    payload: {
      bookingId: booking._id,
      routeLabel,
      seatsLabel: Array.isArray(booking.seats) ? booking.seats.join(', ') : '',
    },
  });
};

const notifyAdminAlert = async ({ message, title = 'Admin alert', metadata = {}, io = null, sourceEvent = 'admin_alert', relatedBooking = null, relatedPayment = null, performedByRole = 'system' }) => {
  const admins = await User.find({ role: 'admin' }).select('_id email');
  if (!admins.length) {
    return [];
  }

  const notifications = [];

  for (const admin of admins) {
    const notification = await createNotification({
      userId: admin._id,
      type: 'admin_alert',
      title,
      message,
      relatedBooking,
      relatedPayment,
      channels: ['in-app'],
      metadata: { ...metadata, adminId: admin._id, dedupeKey: `admin_alert:${sourceEvent}:${metadata?.dedupeKey || metadata?.referenceId || title}:${admin._id}` },
      sourceEvent,
      createdByRole: performedByRole,
      io,
      emailEnabled: false,
      payload: {
        messageLabel: message,
        details: metadata.details || [],
      },
    });
    notifications.push(notification);
  }

  return notifications;
};

const sendRefundNotifications = async ({ userId, bookingId, refund, booking, payment, adminName, io = null }) => {
  const user = await User.findById(userId).select('_id name email');

  if (user) {
    await notifyRefundProcessed({
      userId: user._id,
      booking,
      payment,
      refund,
      io,
    });
  }

  if (adminName) {
    await notifyAdminAlert({
      message: `Admin ${adminName} processed a ${refund.refundType} refund of ₹${Number(refund.amount).toFixed(2)} for booking ${String(bookingId)}.`,
      title: 'Refund completed',
      metadata: {
        refundId: refund._id,
        providerRefundId: refund.providerRefundId,
        refundedBy: refund.refundedBy,
      },
      io,
      sourceEvent: 'refund_processed',
      relatedBooking: bookingId,
      relatedPayment: payment?._id || null,
      performedByRole: 'admin',
    });
  }

  return { notified: true };
};

module.exports = {
  sanitizeText,
  buildNotificationKey,
  buildEmailTemplate,
  createNotification,
  createTransactionLog,
  emitNotification,
  notifyBookingConfirmed,
  notifyPaymentSuccess,
  notifyPaymentFailed,
  notifyRefundProcessed,
  notifyRefundFailed,
  notifyBookingCancelled,
  notifyAdminAlert,
  sendRefundNotifications,
};

