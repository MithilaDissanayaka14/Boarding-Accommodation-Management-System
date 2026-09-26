const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { BOOKING_STATUS } = require('../constants/statuses');

/**
 * Submit a property review (Verified Students only)
 * POST /api/v1/reviews
 */
const createReview = asyncHandler(async (req, res, next) => {
  const {
    listingId,
    rating,
    cleanliness,
    landlordCommunication,
    safety,
    comment,
  } = req.body;

  // 1. Verify listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return next(new AppError('No listing found with that ID', 404));
  }

  // 2. ENFORCE VERIFIED TENANCY: Student must have an accepted or completed booking
  const verifiedTenancy = await Booking.findOne({
    studentId: req.user._id,
    listingId,
    status: { $in: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.COMPLETED] },
  });

  if (!verifiedTenancy) {
    return next(
      new AppError(
        'Access denied: Only verified tenants with an accepted or completed stay can review this accommodation.',
        403
      )
    );
  }

  // 3. Prevent duplicate reviews by the same student for this listing
  const existingReview = await Review.findOne({
    studentId: req.user._id,
    listingId,
  });

  if (existingReview) {
    return next(
      new AppError('You have already submitted a review for this accommodation', 400)
    );
  }

  // 4. Create review (Mongoose post-save hook will recalculate listing's aggregate ratings)
  const review = await Review.create({
    listingId,
    studentId: req.user._id,
    rating: Number(rating),
    cleanliness: cleanliness ? Number(cleanliness) : 5,
    landlordCommunication: landlordCommunication ? Number(landlordCommunication) : 5,
    safety: safety ? Number(safety) : 5,
    comment,
  });

  const populated = await Review.findById(review._id).populate(
    'studentId',
    'name university avatar'
  );

  res.status(201).json({
    status: 'success',
    message: 'Review submitted successfully. Thank you for your feedback!',
    data: {
      review: populated,
    },
  });
});

/**
 * Get all reviews for a specific listing
 * GET /api/v1/reviews/listing/:listingId
 */
const getListingReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ listingId: req.params.listingId })
    .populate('studentId', 'name university avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

/**
 * Get reviews submitted by the logged-in student
 * GET /api/v1/reviews/my
 */
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ studentId: req.user._id })
    .populate('listingId', 'title address city')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

module.exports = {
  createReview,
  getListingReviews,
  getMyReviews,
};
