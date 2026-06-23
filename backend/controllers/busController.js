const Trip = require('../models/Trip');
const Seat = require('../models/Seat');
const BusStatic = require('../models/BusStatic');
const Review = require('../models/Review');

const normalizeDate = (value) => {
  const date = value ? new Date(value) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getSeatSummariesForTrip = async (tripId) => {
  const seats = await Seat.find({ tripId, status: { $in: ['booked', 'reserved', 'female-only'] } })
    .select('seatNumber status lockExpiresAt')
    .lean();

  return seats;
};

const getBusLocations = async (req, res) => {
  try {
    const locations = await Trip.aggregate([
      {
        $project: {
          allLocations: ['$fromLocation', '$toLocation'],
        },
      },
      { $unwind: '$allLocations' },
      {
        $group: {
          _id: '$allLocations',
        },
      },
      {
        $project: {
          _id: 0,
          location: '$_id',
        },
      },
      {
        $sort: {
          location: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      locations: locations.map((entry) => entry.location),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch locations.',
      error: error.message,
    });
  }
};

const getPublicRoutes = async (req, res) => {
  try {
    const routes = await Trip.aggregate([
      { $match: { isActive: true, status: 'scheduled' } },
      {
        $group: {
          _id: { from: '$fromLocation', to: '$toLocation' },
          fare: { $min: '$price' },
          firstBus: { $min: '$departureTime' },
          lastBus: { $max: '$departureTime' },
          buses: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          from: '$_id.from',
          to: '$_id.to',
          fare: 1,
          firstBus: 1,
          lastBus: 1,
          buses: 1,
        },
      },
      { $sort: { from: 1, to: 1 } },
    ]);

    return res.status(200).json({ success: true, routes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch routes.', error: error.message });
  }
};

const getFeaturedOperators = async (req, res) => {
  try {
    const operators = await BusStatic.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$vendorId', busCount: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'vendor' } },
      { $unwind: '$vendor' },
      { $project: { _id: 0, id: '$_id', name: { $ifNull: ['$vendor.companyName', '$vendor.name'] }, busCount: 1 } },
      { $sort: { busCount: -1 } },
      { $limit: 8 },
    ]);

    return res.status(200).json({ success: true, operators });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch operators.', error: error.message });
  }
};

const searchBuses = async (req, res) => {
  try {
    const { source, destination, date, minPrice, maxPrice, sortBy } = req.query;

    if (!source || !destination || !date) {
      return res.status(400).json({
        success: false,
        message: 'Source, destination, and date are required.',
      });
    }

    const targetDate = normalizeDate(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const query = {
      fromLocation: { $regex: new RegExp(`^${String(source).trim()}$`, 'i') },
      toLocation: { $regex: new RegExp(`^${String(destination).trim()}$`, 'i') },
      travelDate: {
        $gte: targetDate,
        $lt: nextDate,
      },
      status: 'scheduled',
      isActive: true,
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    const trips = await Trip.find(query)
      .populate('busId', 'busName busNumber busType totalSeats amenities')
      .sort(sortBy === 'price' ? { price: 1 } : { departureTime: 1 })
      .lean();

    const tripIds = trips.map((trip) => trip._id);
    const reviewStats = await Review.aggregate([
      { $match: { tripId: { $in: tripIds }, isVisible: true } },
      { $group: { _id: '$tripId', rating: { $avg: '$overallRating' }, count: { $sum: 1 } } },
    ]);
    const statsByTrip = reviewStats.reduce((acc, stat) => {
      acc[String(stat._id)] = stat;
      return acc;
    }, {});

    const response = await Promise.all(trips.map(async (trip) => {
      const seatSummaries = await getSeatSummariesForTrip(trip._id);
      const bookedSeats = seatSummaries.filter((seat) => seat.status === 'booked').map((seat) => seat.seatNumber);
      const reservedSeats = seatSummaries.filter((seat) => seat.status === 'reserved').map((seat) => seat.seatNumber);
      const availableSeats = Math.max((trip.busId?.totalSeats || 0) - bookedSeats.length - reservedSeats.length, 0);
      const reviewSummary = statsByTrip[String(trip._id)] || { rating: 0, count: 0 };

      return {
        id: trip._id,
        tripId: trip._id,
        busId: trip.busId?._id,
        busName: trip.busId?.busName,
        busNumber: trip.busId?.busNumber,
        busType: trip.busId?.busType,
        amenities: trip.busId?.amenities || [],
        source: trip.fromLocation,
        destination: trip.toLocation,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        travelDate: trip.travelDate,
        price: trip.price,
        totalSeats: trip.busId?.totalSeats || trip.availableSeats,
        availableSeats,
        bookedSeats,
        reservedSeats,
        rating: Number(reviewSummary.rating || 0).toFixed(1),
        reviewCount: reviewSummary.count || 0,
      };
    }));

    return res.status(200).json({
      success: true,
      buses: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to search buses.',
      error: error.message,
    });
  }
};

const getBusById = async (req, res) => {
  try {
    const { date } = req.query;
    const trip = await Trip.findById(req.params.id).populate('busId', 'busName busNumber busType totalSeats amenities vendorId');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found.',
      });
    }

    const seatSummaries = await getSeatSummariesForTrip(trip._id);
    const bookedSeats = seatSummaries.filter((seat) => seat.status === 'booked').map((seat) => seat.seatNumber);
    const reservedSeats = seatSummaries.filter((seat) => seat.status === 'reserved').map((seat) => seat.seatNumber);
    const availableSeats = Math.max((trip.busId?.totalSeats || trip.availableSeats || 0) - bookedSeats.length - reservedSeats.length, 0);
    const reviewStats = await Review.aggregate([
      { $match: { tripId: trip._id, isVisible: true } },
      { $group: { _id: '$tripId', rating: { $avg: '$overallRating' }, count: { $sum: 1 } } },
    ]);
    const reviewSummary = reviewStats[0] || { rating: 0, count: 0 };

    return res.status(200).json({
      success: true,
      bus: {
        id: trip._id,
        tripId: trip._id,
        busId: trip.busId?._id,
        busName: trip.busId?.busName,
        busNumber: trip.busId?.busNumber,
        busType: trip.busId?.busType,
        amenities: trip.busId?.amenities || [],
        source: trip.fromLocation,
        destination: trip.toLocation,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        travelDate: trip.travelDate,
        price: trip.price,
        totalSeats: trip.busId?.totalSeats || trip.availableSeats,
        bookedSeats,
        reservedSeats,
        seatMap: seatSummaries,
        availableSeats,
        rating: Number(reviewSummary.rating || 0).toFixed(1),
        reviewCount: reviewSummary.count || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bus details.',
      error: error.message,
    });
  }
};

module.exports = {
  getBusLocations,
  getPublicRoutes,
  getFeaturedOperators,
  searchBuses,
  getBusById,
};
