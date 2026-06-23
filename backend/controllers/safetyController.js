const Booking = require('../models/Booking');
const EmergencyContact = require('../models/EmergencyContact');
const SOSAlert = require('../models/SOSAlert');

const contactPayload = (contact) => ({
  id: contact._id,
  name: contact.name,
  relation: contact.relation,
  mobileNumber: contact.mobileNumber,
  createdAt: contact.createdAt,
  updatedAt: contact.updatedAt,
});

const alertPayload = (alert) => ({
  id: alert._id,
  user: alert.userId,
  booking: alert.bookingId,
  bookingId: alert.bookingId?._id || alert.bookingId,
  timestamp: alert.timestamp,
  status: alert.status,
  createdAt: alert.createdAt,
});

const getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, contacts: contacts.map(contactPayload) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch emergency contacts.', error: error.message });
  }
};

const createEmergencyContact = async (req, res) => {
  try {
    const { name, relation, mobileNumber } = req.body;

    if (!name || !relation || !mobileNumber) {
      return res.status(400).json({ success: false, message: 'Name, relation, and mobile number are required.' });
    }

    const contact = await EmergencyContact.create({
      userId: req.user.userId,
      name,
      relation,
      mobileNumber,
    });

    return res.status(201).json({ success: true, contact: contactPayload(contact) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create emergency contact.', error: error.message });
  }
};

const updateEmergencyContact = async (req, res) => {
  try {
    const { name, relation, mobileNumber } = req.body;
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: { name, relation, mobileNumber } },
      { new: true, runValidators: true },
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found.' });
    }

    return res.status(200).json({ success: true, contact: contactPayload(contact) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update emergency contact.', error: error.message });
  }
};

const deleteEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found.' });
    }

    return res.status(200).json({ success: true, message: 'Emergency contact deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete emergency contact.', error: error.message });
  }
};

const createSOSAlert = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking is required for SOS.' });
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user.userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found for this user.' });
    }

    const alert = await SOSAlert.create({
      userId: req.user.userId,
      bookingId: booking._id,
      timestamp: new Date(),
      status: 'active',
    });

    return res.status(201).json({ success: true, alert: alertPayload(alert) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create SOS alert.', error: error.message });
  }
};

const getUserSOSHistory = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.user.userId })
      .populate('bookingId', 'busName from to journeyDate departureTime seatNumber status bookingStatus')
      .sort({ timestamp: -1 });

    return res.status(200).json({ success: true, alerts: alerts.map(alertPayload) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch SOS history.', error: error.message });
  }
};

const getAdminSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find()
      .populate('userId', 'name email phone')
      .populate('bookingId', 'busName from to journeyDate departureTime seatNumber status bookingStatus')
      .sort({ timestamp: -1 });

    return res.status(200).json({ success: true, alerts: alerts.map(alertPayload) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch SOS alerts.', error: error.message });
  }
};

const updateSOSStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid SOS status.' });
    }

    const alert = await SOSAlert.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true })
      .populate('userId', 'name email phone')
      .populate('bookingId', 'busName from to journeyDate departureTime seatNumber status bookingStatus');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'SOS alert not found.' });
    }

    return res.status(200).json({ success: true, alert: alertPayload(alert) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update SOS alert.', error: error.message });
  }
};

const getSafetyReports = async (req, res) => {
  try {
    const [activeAlerts, resolvedAlerts, contactCount] = await Promise.all([
      SOSAlert.countDocuments({ status: 'active' }),
      SOSAlert.countDocuments({ status: 'resolved' }),
      EmergencyContact.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      report: {
        activeAlerts,
        resolvedAlerts,
        emergencyContacts: contactCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch safety reports.', error: error.message });
  }
};

module.exports = {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  createSOSAlert,
  getUserSOSHistory,
  getAdminSOSAlerts,
  updateSOSStatus,
  getSafetyReports,
};
