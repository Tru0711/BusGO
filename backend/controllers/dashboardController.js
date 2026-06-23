const Booking = require('../models/Booking');
const User = require('../models/User');
const Offer = require('../models/Offer');

const toIsoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email phone');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('busId', 'busName busNumber busType')
      .populate('tripId', 'fromLocation toLocation travelDate departureTime arrivalTime price')
      .sort({ createdAt: -1 });

    const now = new Date();
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((sum, booking) => sum + Number(booking.price || booking.totalPrice || 0), 0);
    const cancelledTrips = bookings.filter((booking) => ['cancelled', 'refunded'].includes(booking.status || booking.bookingStatus)).length;
    const upcomingTrips = bookings
      .filter((booking) => {
        const journeyDate = booking.journeyDate || booking.date;
        return journeyDate && new Date(journeyDate).getTime() >= new Date(now.toDateString()).getTime() && !['cancelled', 'refunded'].includes(booking.status || booking.bookingStatus);
      })
      .slice(0, 5)
      .map((booking) => ({
        id: booking._id,
        busName: booking.busName || booking.busId?.busName || 'N/A',
        from: booking.from || booking.tripId?.fromLocation || '',
        to: booking.to || booking.tripId?.toLocation || '',
        journeyDate: toIsoDate(booking.journeyDate || booking.date),
        departureTime: booking.departureTime || booking.tripId?.departureTime || '',
        seatNumber: booking.seatNumber?.length ? booking.seatNumber : booking.seats,
        status: booking.status || booking.bookingStatus,
        price: booking.price || booking.totalPrice,
      }));

    const activeOffers = await Offer.find({ isActive: true }).sort({ createdAt: -1 }).limit(3).lean();

    return res.status(200).json({
      success: true,
      dashboard: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
        },
        stats: {
          totalBookings,
          upcomingTrips: upcomingTrips.length,
          cancelledTrips,
          totalSpent,
        },
        upcomingTrips,
        offers: activeOffers.map((offer) => ({
          id: offer._id,
          label: offer.label,
          title: offer.title,
          description: offer.description,
          discountPercent: offer.discountPercent,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data.',
      error: error.message,
    });
  }
};

module.exports = {
  getUserDashboard,
};
