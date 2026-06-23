const Review = require('../models/Review');
const Booking = require('../models/Booking');

const buildReviewPayload = (review) => ({
  id: review._id,
  bookingId: review.bookingId,
  tripId: review.tripId,
  busId: review.busId,
  overallRating: review.overallRating,
  cleanlinessRating: review.cleanlinessRating,
  punctualityRating: review.punctualityRating,
  comfortRating: review.comfortRating,
  comment: review.comment,
  createdAt: review.createdAt,
  userName: review.userId?.name || 'Verified traveler',
  userRole: review.userId?.role || 'user',
  routeLabel: review.tripId ? `${review.tripId.fromLocation || ''} - ${review.tripId.toLocation || ''}`.trim() : '',
  busName: review.busId?.busName || '',
});

const listPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isVisible: true })
      .populate('userId', 'name role')
      .populate('tripId', 'fromLocation toLocation')
      .populate('busId', 'busName busNumber')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return res.status(200).json({
      success: true,
      reviews: reviews.map(buildReviewPayload),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.', error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { bookingId, overallRating, cleanlinessRating, punctualityRating, comfortRating, comment } = req.body;

    if (!bookingId || !overallRating || !cleanlinessRating || !punctualityRating || !comfortRating) {
      return res.status(400).json({ success: false, message: 'All review fields are required.' });
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user.userId })
      .populate('tripId')
      .populate('busId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const review = await Review.create({
      bookingId: booking._id,
      userId: req.user.userId,
      tripId: booking.tripId?._id,
      busId: booking.busId?._id,
      overallRating: Number(overallRating),
      cleanlinessRating: Number(cleanlinessRating),
      punctualityRating: Number(punctualityRating),
      comfortRating: Number(comfortRating),
      comment: comment ? String(comment).trim() : '',
      isVisible: true,
    });

    return res.status(201).json({ success: true, message: 'Review created successfully.', review });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create review.', error: error.message });
  }
};

module.exports = {
  listPublicReviews,
  createReview,
};