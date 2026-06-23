const BusStatic = require('../models/BusStatic');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const User = require('../models/User');

const buildVendorProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  companyName: user.companyName,
  businessType: user.businessType,
  address: user.address,
  gstNumber: user.gstNumber,
  serviceAreas: user.serviceAreas,
  isVerified: user.isVerified,
  isApproved: user.isApproved,
});

const getVendorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email phone role companyName businessType address gstNumber serviceAreas isVerified isApproved');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    return res.status(200).json({
      success: true,
      profile: buildVendorProfile(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load vendor profile.', error: error.message });
  }
};

const updateVendorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    const { name, phone, companyName, businessType, address, gstNumber, serviceAreas } = req.body;

    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (companyName !== undefined) user.companyName = String(companyName).trim();
    if (businessType !== undefined) user.businessType = String(businessType).trim();
    if (address !== undefined) user.address = String(address).trim();
    if (gstNumber !== undefined) user.gstNumber = String(gstNumber).trim();
    if (serviceAreas !== undefined) {
      if (Array.isArray(serviceAreas)) {
        user.serviceAreas = serviceAreas.map((area) => String(area).trim()).filter(Boolean);
      } else {
        user.serviceAreas = String(serviceAreas)
          .split(',')
          .map((area) => area.trim())
          .filter(Boolean);
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: buildVendorProfile(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update vendor profile.', error: error.message });
  }
};

const addBus = async (req, res) => {
  try {
    const { busName, source, destination, departureTime, arrivalTime, price, totalSeats } = req.body;

    if (!busName || !source || !destination || !departureTime || !arrivalTime || price === undefined || totalSeats === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All bus fields are required.',
      });
    }

    const bus = await Bus.create({
      busName: String(busName).trim(),
      source: String(source).trim(),
      destination: String(destination).trim(),
      departureTime: String(departureTime).trim(),
      arrivalTime: String(arrivalTime).trim(),
      price: Number(price),
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      vendorId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Bus added successfully.',
      bus,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add bus.', error: error.message });
  }
};

const getVendorBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ vendorId: req.user.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      buses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load buses.', error: error.message });
  }
};

const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findOne({ _id: req.params.id, vendorId: req.user.userId });

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    const fields = ['busName', 'source', 'destination', 'departureTime', 'arrivalTime', 'price', 'totalSeats', 'availableSeats'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        bus[field] = field === 'price' || field === 'totalSeats' || field === 'availableSeats' ? Number(req.body[field]) : String(req.body[field]).trim();
      }
    });

    if (bus.availableSeats > bus.totalSeats) {
      bus.availableSeats = bus.totalSeats;
    }

    await bus.save();

    return res.status(200).json({ success: true, message: 'Bus updated successfully.', bus });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update bus.', error: error.message });
  }
};

const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findOneAndDelete({ _id: req.params.id, vendorId: req.user.userId });

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    return res.status(200).json({ success: true, message: 'Bus deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete bus.', error: error.message });
  }
};

const getVendorBookings = async (req, res) => {
  try {
      const bookings = await Booking.find({ vendorId: req.user.userId })
        .populate('userId', 'name email phone')
        .populate('busId', 'busName source destination departureTime arrivalTime')
        .populate('tripId', 'fromLocation toLocation departureTime arrivalTime price')
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings: bookings.map((booking) => ({
        id: booking._id,
        userName: booking.userId?.name || '',
        userEmail: booking.userId?.email || '',
        busName:
          (booking.busId && booking.busId.busName) ||
          (booking.tripId && `${booking.tripId.fromLocation || ''} → ${booking.tripId.toLocation || ''}`) ||
          '',
        seats: Array.isArray(booking.seats) ? booking.seats.length : booking.seats,
        date: booking.date,
        bookingStatus: booking.bookingStatus,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load bookings.', error: error.message });
  }
};

const getVendorDashboardSummary = async (req, res) => {
  try {
    const [busCount, bookingCount, buses, bookings] = await Promise.all([
      BusStatic.countDocuments({ vendorId: req.user.userId, isActive: true }),
      Booking.countDocuments({ vendorId: req.user.userId }),
      BusStatic.find({ vendorId: req.user.userId, isActive: true }).sort({ createdAt: -1 }).limit(5),
      Booking.find({ vendorId: req.user.userId }).populate('userId', 'name email').sort({ createdAt: -1 }).limit(5),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalBuses: busCount,
        totalBookings: bookingCount,
      },
      buses,
      bookings: bookings.map((booking) => ({
        id: booking._id,
        userName: booking.userId?.name || '',
        seats: Array.isArray(booking.seats) ? booking.seats.length : booking.seats,
        date: booking.date,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load dashboard summary.', error: error.message });
  }
};

// Exports moved to the end to ensure functions are defined before exporting

// Return list of trips (or bus-wise) with aggregated stats for vendor
const getVendorTrips = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Aggregate bookings per trip
    const bookingAgg = await Booking.aggregate([
      { $match: { vendorId: require('mongoose').Types.ObjectId(vendorId) } },
      { $unwind: '$seats' },
      { $group: { _id: '$tripId', bookingsCount: { $sum: 1 }, bookedSeats: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
    ]).allowDiskUse(true);

    const statsByTrip = bookingAgg.reduce((acc, cur) => {
      acc[String(cur._id)] = cur;
      return acc;
    }, {});

    // Fetch trips for vendor with pagination
    const trips = await Trip.find({ vendorId })
      .populate('busId', 'busName busNumber busType totalSeats')
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // total count
    const total = await Trip.countDocuments({ vendorId });

    const results = trips.map((trip) => {
      const stat = statsByTrip[String(trip._id)] || { bookingsCount: 0, bookedSeats: 0, revenue: 0 };
      const totalSeats = trip.busId?.totalSeats || 0;
      const occupancy = totalSeats > 0 ? Math.min(100, Math.round((stat.bookedSeats / totalSeats) * 100)) : 0;

      return {
        id: String(trip._id),
        busName: trip.busId?.busName || '',
        busNumber: trip.busId?.busNumber || '',
        busImage: trip.busId?.imageUrl || null,
        route: `${trip.fromLocation || ''} → ${trip.toLocation || ''}`,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        date: trip.travelDate || trip.date || trip.createdAt,
        totalSeats,
        bookedSeats: stat.bookedSeats || 0,
        revenue: stat.revenue || 0,
        bookingCount: stat.bookingsCount || 0,
        occupancy,
        status: trip.isActive ? 'active' : 'inactive',
      };
    });

    return res.status(200).json({ success: true, trips: results, page, limit, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load trips.', error: error.message });
  }
};

// Return bookings for a specific trip with filtering, sorting and pagination
const getVendorTripBookings = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const tripId = req.params.tripId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 25);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const paymentStatus = req.query.paymentStatus;
    const bookingStatus = req.query.bookingStatus;

    const match = { vendorId: require('mongoose').Types.ObjectId(vendorId), tripId: require('mongoose').Types.ObjectId(tripId) };

    if (bookingStatus) match.bookingStatus = bookingStatus;
    if (paymentStatus) match.transactionStatus = paymentStatus;

    if (search) {
      match.$or = [
        { 'userId.name': { $regex: search, $options: 'i' } },
        { _id: { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } },
      ];
    }

    // populate user and select fields
    const bookings = await Booking.find(match)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Booking.countDocuments(match);

    const rows = bookings.map((b) => ({
      id: String(b._id),
      passengerName: b.userId?.name || '',
      seatNumbers: Array.isArray(b.seats) ? b.seats : [],
      bookingId: String(b._id),
      paymentStatus: b.transactionStatus || '',
      bookingStatus: b.bookingStatus || '',
      amountPaid: b.totalPrice || 0,
      createdAt: b.createdAt,
    }));

    return res.status(200).json({ success: true, bookings: rows, page, limit, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load trip bookings.', error: error.message });
  }
};

const getVendorTripAnalytics = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const tripId = req.params.tripId;

    const trip = await Trip.findOne({ _id: tripId, vendorId }).populate('busId', 'totalSeats busName');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });

    const stats = await Booking.aggregate([
      { $match: { vendorId: require('mongoose').Types.ObjectId(vendorId), tripId: require('mongoose').Types.ObjectId(tripId) } },
      { $unwind: '$seats' },
      { $group: { _id: null, bookings: { $sum: 1 }, bookedSeats: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
    ]).allowDiskUse(true);

    const stat = stats[0] || { bookings: 0, bookedSeats: 0, revenue: 0 };
    const totalSeats = trip.busId?.totalSeats || 0;
    const occupancy = totalSeats ? Math.min(100, Math.round((stat.bookedSeats / totalSeats) * 100)) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        tripId,
        busName: trip.busId?.busName || '',
        totalTrips: 1,
        totalBookings: stat.bookings || 0,
        totalRevenue: stat.revenue || 0,
        bookedSeats: stat.bookedSeats || 0,
        totalSeats,
        occupancy,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load analytics.', error: error.message });
  }
};

module.exports = {
  getVendorProfile,
  updateVendorProfile,
  addBus,
  getVendorBuses,
  updateBus,
  deleteBus,
  getVendorBookings,
  getVendorDashboardSummary,
  getVendorTrips,
  getVendorTripBookings,
  getVendorTripAnalytics,
};