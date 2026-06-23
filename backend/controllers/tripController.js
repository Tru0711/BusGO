const Trip = require('../models/Trip');
const Seat = require('../models/Seat');
const BusStatic = require('../models/BusStatic');
const Review = require('../models/Review');

// Convert time string (HH:mm) to minutes for comparison
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if two time ranges overlap
const isTimeOverlap = (depTime1, arrTime1, depTime2, arrTime2) => {
  const dep1 = timeToMinutes(depTime1);
  const arr1 = timeToMinutes(arrTime1);
  const dep2 = timeToMinutes(depTime2);
  const arr2 = timeToMinutes(arrTime2);

  // If arrival is before departure (trip crosses midnight)
  if (arr1 < dep1) {
    return !(arr2 < dep1 && arr2 < arr1) && !(dep2 > arr1 && dep2 > dep1);
  }
  if (arr2 < dep2) {
    return !(arr1 < dep2 && arr1 < arr2) && !(dep1 > arr2 && dep1 > dep2);
  }

  // Normal case: check if ranges overlap
  return dep1 < arr2 && dep2 < arr1;
};

// Check for overlapping trips
const checkTripOverlap = async (busId, travelDate, departureTime, arrivalTime, excludeTripId = null) => {
  try {
    // Parse travelDate to get just the date part for comparison
    const targetDate = new Date(travelDate);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Find all trips for this bus on the same date
    let query = {
      busId,
      travelDate: {
        $gte: targetDate,
        $lt: nextDate,
      },
      status: { $ne: 'cancelled' },
    };

    if (excludeTripId) {
      query._id = { $ne: excludeTripId };
    }

    const existingTrips = await Trip.find(query);

    // Check for time overlap with any existing trip
    for (const existingTrip of existingTrips) {
      if (
        isTimeOverlap(
          departureTime,
          arrivalTime,
          existingTrip.departureTime,
          existingTrip.arrivalTime
        )
      ) {
        return {
          hasOverlap: true,
          conflictingTrip: existingTrip,
        };
      }
    }

    return { hasOverlap: false };
  } catch (error) {
    throw new Error(`Error checking trip overlap: ${error.message}`);
  }
};

// Validate time format and logic
const validateTimes = (departureTime, arrivalTime) => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

  if (!timeRegex.test(departureTime)) {
    return { valid: false, message: 'Invalid departure time format. Use HH:mm' };
  }

  if (!timeRegex.test(arrivalTime)) {
    return { valid: false, message: 'Invalid arrival time format. Use HH:mm' };
  }

  const depMinutes = timeToMinutes(departureTime);
  const arrMinutes = timeToMinutes(arrivalTime);

  // Check if arrival is after departure (or next day if crossing midnight)
  let duration = arrMinutes - depMinutes;
  if (duration <= 0) {
    duration += 24 * 60; // Assume next day
  }

  // Max 24 hours duration
  if (duration > 24 * 60) {
    return { valid: false, message: 'Trip duration cannot exceed 24 hours' };
  }

  return { valid: true, duration };
};

// Auto-generate seats for a trip
const generateSeats = async (tripId, busId, totalSeats) => {
  try {
    const seatsToCreate = [];
    for (let i = 1; i <= totalSeats; i++) {
      seatsToCreate.push({
        tripId,
        busId,
        seatNumber: i,
        status: 'available',
      });
    }

    await Seat.insertMany(seatsToCreate);
    return true;
  } catch (error) {
    throw new Error(`Failed to generate seats: ${error.message}`);
  }
};

// Add new trip
const addTrip = async (req, res) => {
  try {
    const { busId, fromLocation, toLocation, travelDate, departureTime, arrivalTime, price } = req.body;
    const vendorId = req.user.userId;

    // Validate required fields
    if (!busId || !fromLocation || !toLocation || !travelDate || !departureTime || !arrivalTime || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    // Validate times
    const timeValidation = validateTimes(departureTime, arrivalTime);
    if (!timeValidation.valid) {
      return res.status(400).json({
        success: false,
        message: timeValidation.message,
      });
    }

    // Get bus details
    const bus = await BusStatic.findOne({ _id: busId, vendorId });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found or unauthorized.',
      });
    }

    // Check for overlapping trips
    const overlapCheck = await checkTripOverlap(busId, travelDate, departureTime, arrivalTime);
    if (overlapCheck.hasOverlap) {
      return res.status(400).json({
        success: false,
        message: `This bus already has a trip scheduled from ${overlapCheck.conflictingTrip.departureTime} to ${overlapCheck.conflictingTrip.arrivalTime} on the same date.`,
        conflictingTrip: overlapCheck.conflictingTrip,
      });
    }

    // Create trip
    const newTrip = new Trip({
      busId,
      vendorId,
      fromLocation: String(fromLocation).trim(),
      toLocation: String(toLocation).trim(),
      travelDate: new Date(travelDate),
      departureTime,
      arrivalTime,
      price: parseFloat(price),
      availableSeats: bus.totalSeats,
    });

    await newTrip.save();

    // Auto-generate seats
    await generateSeats(newTrip._id, busId, bus.totalSeats);

    return res.status(201).json({
      success: true,
      message: 'Trip added successfully.',
      trip: newTrip,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add trip.',
      error: error.message,
    });
  }
};

// Get vendor's trips
const getVendorTrips = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { status, busId, fromDate, toDate } = req.query;

    let query = { vendorId };

    if (status) query.status = status;
    if (busId) query.busId = busId;

    if (fromDate || toDate) {
      query.travelDate = {};
      if (fromDate) query.travelDate.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.travelDate.$lte = endDate;
      }
    }

    const trips = await Trip.find(query)
      .populate('busId', 'busName busNumber')
      .sort({ travelDate: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      trips,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trips.',
      error: error.message,
    });
  }
};

// Get all public trips (for users to search)
const getAllPublicTrips = async (req, res) => {
  try {
    const { fromLocation, toLocation, travelDate } = req.query;

    let query = { status: 'scheduled', isActive: true };

    if (fromLocation) {
      query.fromLocation = { $regex: fromLocation, $options: 'i' };
    }

    if (toLocation) {
      query.toLocation = { $regex: toLocation, $options: 'i' };
    }

    if (travelDate) {
      const targetDate = new Date(travelDate);
      targetDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      query.travelDate = {
        $gte: targetDate,
        $lt: nextDate,
      };
    }

    const trips = await Trip.find(query)
      .populate('busId', 'busName busNumber busType totalSeats')
      .select('_id busId fromLocation toLocation travelDate departureTime arrivalTime price availableSeats')
      .sort({ departureTime: 1 })
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

    return res.status(200).json({
      success: true,
      trips: trips.map((trip) => ({
        ...trip,
        rating: Number((statsByTrip[String(trip._id)] || {}).rating || 0).toFixed(1),
        reviewCount: (statsByTrip[String(trip._id)] || {}).count || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trips.',
      error: error.message,
    });
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const vendorId = req.user.userId;
    const { fromLocation, toLocation, departureTime, arrivalTime, price } = req.body;

    const trip = await Trip.findOne({ _id: tripId, vendorId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found.',
      });
    }

    // Only allow updates if trip is scheduled
    if (trip.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update trip that is not scheduled.',
      });
    }

    // If times are being updated, check for overlaps
    if (departureTime || arrivalTime) {
      const newDep = departureTime || trip.departureTime;
      const newArr = arrivalTime || trip.arrivalTime;

      const timeValidation = validateTimes(newDep, newArr);
      if (!timeValidation.valid) {
        return res.status(400).json({
          success: false,
          message: timeValidation.message,
        });
      }

      const overlapCheck = await checkTripOverlap(trip.busId, trip.travelDate, newDep, newArr, tripId);
      if (overlapCheck.hasOverlap) {
        return res.status(400).json({
          success: false,
          message: 'This bus already has a trip in this time range on the same date.',
        });
      }

      trip.departureTime = newDep;
      trip.arrivalTime = newArr;
    }

    if (fromLocation) trip.fromLocation = String(fromLocation).trim();
    if (toLocation) trip.toLocation = String(toLocation).trim();
    if (price) trip.price = parseFloat(price);

    await trip.save();

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully.',
      trip,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update trip.',
      error: error.message,
    });
  }
};

// Cancel trip
const cancelTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const vendorId = req.user.userId;

    const trip = await Trip.findOne({ _id: tripId, vendorId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found.',
      });
    }

    trip.status = 'cancelled';
    await trip.save();

    return res.status(200).json({
      success: true,
      message: 'Trip cancelled successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel trip.',
      error: error.message,
    });
  }
};

// Get trip details with seats
const getTripDetails = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId)
      .populate('busId', 'busName busNumber busType totalSeats')
      .lean();

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found.',
      });
    }

    const seats = await Seat.find({ tripId })
      .select('seatNumber status')
      .lean();

    return res.status(200).json({
      success: true,
      trip: { ...trip, seats },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trip details.',
      error: error.message,
    });
  }
};

module.exports = {
  addTrip,
  getVendorTrips,
  getAllPublicTrips,
  updateTrip,
  cancelTrip,
  getTripDetails,
  checkTripOverlap,
};
