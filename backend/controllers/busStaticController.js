const BusStatic = require('../models/BusStatic');
const Trip = require('../models/Trip');

// Add new bus (static data)
const addBus = async (req, res) => {
  try {
    const { busName, busNumber, busType, totalSeats, amenities } = req.body;
    const vendorId = req.user.userId;

    if (!busName || !busNumber || !busType || !totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Bus name, number, type, and total seats are required.',
      });
    }

    // Check if bus number already exists for this vendor
    const existingBus = await BusStatic.findOne({
      busNumber: busNumber.toUpperCase(),
      vendorId,
    });

    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: 'Bus number already exists for your account.',
      });
    }

    const newBus = new BusStatic({
      vendorId,
      busName: String(busName).trim(),
      busNumber: String(busNumber).trim().toUpperCase(),
      busType,
      totalSeats: parseInt(totalSeats),
      amenities: Array.isArray(amenities) ? amenities : [],
    });

    await newBus.save();

    return res.status(201).json({
      success: true,
      message: 'Bus added successfully.',
      bus: newBus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add bus.',
      error: error.message,
    });
  }
};

// Get vendor's buses
const getVendorBuses = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const buses = await BusStatic.find({ vendorId, isActive: true })
      .select('_id busName busNumber busType totalSeats amenities')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      buses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch buses.',
      error: error.message,
    });
  }
};

// Update bus
const updateBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const vendorId = req.user.userId;
    const { busName, busType, totalSeats, amenities } = req.body;

    const bus = await BusStatic.findOne({ _id: busId, vendorId });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.',
      });
    }

    // Note: busNumber and vendorId cannot be changed
    if (busName) bus.busName = String(busName).trim();
    if (busType) bus.busType = busType;
    if (totalSeats) bus.totalSeats = parseInt(totalSeats);
    if (amenities) bus.amenities = Array.isArray(amenities) ? amenities : [];

    await bus.save();

    return res.status(200).json({
      success: true,
      message: 'Bus updated successfully.',
      bus,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update bus.',
      error: error.message,
    });
  }
};

// Delete bus (soft delete)
const deleteBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const vendorId = req.user.userId;

    // Check if bus has any active trips
    const activeTrips = await Trip.findOne({
      busId,
      vendorId,
      status: { $ne: 'cancelled' },
    });

    if (activeTrips) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete bus with active trips. Cancel all trips first.',
      });
    }

    await BusStatic.findOneAndUpdate(
      { _id: busId, vendorId },
      { isActive: false },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Bus deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete bus.',
      error: error.message,
    });
  }
};

// Get single bus details
const getBusDetails = async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await BusStatic.findById(busId);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found.',
      });
    }

    return res.status(200).json({
      success: true,
      bus,
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
  addBus,
  getVendorBuses,
  updateBus,
  deleteBus,
  getBusDetails,
};
