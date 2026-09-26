const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { BOOKING_STATUS } = require('../constants/statuses');

/**
 * Submit a booking request (Students only)
 * POST /api/v1/bookings
 */
const createBooking = asyncHandler(async (req, res, next) => {
  const { listingId, moveInDate, message } = req.body;

  // 1. Fetch listing to verify existence and check bed availability
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return next(new AppError('No accommodation found with that ID', 404));
  }

  if (!listing.isAvailable || listing.availableBeds <= 0) {
    return next(new AppError('Sorry, this accommodation has no available beds left', 400));
  }

  // 2. Prevent landlord from booking their own property
  if (listing.ownerId.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot request a booking on your own property', 400));
  }

  // 3. Prevent duplicate active booking by the same student
  const existingPending = await Booking.findOne({
    studentId: req.user._id,
    listingId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED] },
  });

  if (existingPending) {
    return next(
      new AppError(
        'You already have an active or pending booking request for this accommodation',
        400
      )
    );
  }

  // 4. Create booking with server-derived ownerId
  const booking = await Booking.create({
    studentId: req.user._id,
    listingId: listing._id,
    ownerId: listing.ownerId, // Strictly derived server-side
    moveInDate,
    message: message || '',
    status: BOOKING_STATUS.PENDING,
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate('listingId', 'title address city rentAmount images nearestUniversity')
    .populate('ownerId', 'name email phone avatar');

  res.status(201).json({
    status: 'success',
    message: 'Booking request sent successfully. Awaiting landlord review.',
    data: {
      booking: populatedBooking,
    },
  });
});

/**
 * Get all booking requests for the authenticated student
 * GET /api/v1/bookings/my
 */
const getMyStudentBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ studentId: req.user._id })
    .populate('listingId', 'title address city rentAmount keyMoney roomType images nearestUniversity')
    .populate('ownerId', 'name email phone avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

/**
 * Get incoming booking requests for landlord's properties
 * GET /api/v1/bookings/incoming
 */
const getLandlordIncomingBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ ownerId: req.user._id })
    .populate('listingId', 'title address city rentAmount roomType availableBeds totalBeds')
    .populate('studentId', 'name email phone university avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

/**
 * Accept or Reject a booking request (Landlord only)
 * PATCH /api/v1/bookings/:id/status
 */
const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(new AppError('No booking request found with that ID', 404));
  }

  // Ensure caller is the owner landlord
  if (booking.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to manage this booking', 403));
  }

  // If already accepted/rejected, prevent invalid state jumps
  if (booking.status === status) {
    return next(new AppError(`Booking is already ${status}`, 400));
  }

  const previousStatus = booking.status;

  // Case 1: Accepting a booking request
  if (status === BOOKING_STATUS.ACCEPTED) {
    // Atomic Bed Decrement to prevent race conditions on shared rooms
    const updatedListing = await Listing.findOneAndUpdate(
      {
        _id: booking.listingId,
        availableBeds: { $gt: 0 },
      },
      {
        $inc: { availableBeds: -1 },
      },
      { new: true }
    );

    if (!updatedListing) {
      return next(
        new AppError(
          'Cannot accept booking: No bed capacity remaining for this property',
          400
        )
      );
    }

    // Toggle listing availability to false if all beds are now taken
    if (updatedListing.availableBeds === 0) {
      await Listing.findByIdAndUpdate(booking.listingId, { isAvailable: false });
    }

    booking.status = BOOKING_STATUS.ACCEPTED;
    booking.rejectionReason = '';
    await booking.save();
  }
  // Case 2: Rejecting a booking request
  else if (status === BOOKING_STATUS.REJECTED) {
    // If it was previously accepted, reverse bed decrement!
    if (previousStatus === BOOKING_STATUS.ACCEPTED) {
      await Listing.findByIdAndUpdate(booking.listingId, {
        $inc: { availableBeds: 1 },
        $set: { isAvailable: true },
      });
    }

    booking.status = BOOKING_STATUS.REJECTED;
    booking.rejectionReason = rejectionReason || 'Landlord declined the request';
    await booking.save();
  }
  // Case 3: Completing a tenancy
  else if (status === BOOKING_STATUS.COMPLETED) {
    // Tenancy concluded, free up bed
    if (previousStatus === BOOKING_STATUS.ACCEPTED) {
      await Listing.findByIdAndUpdate(booking.listingId, {
        $inc: { availableBeds: 1 },
        $set: { isAvailable: true },
      });
    }

    booking.status = BOOKING_STATUS.COMPLETED;
    await booking.save();
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate('listingId', 'title address city rentAmount availableBeds totalBeds isAvailable')
    .populate('studentId', 'name email phone university');

  res.status(200).json({
    status: 'success',
    message: `Booking has been ${status}`,
    data: {
      booking: populatedBooking,
    },
  });
});

/**
 * Cancel a booking request (Student or Landlord)
 * PATCH /api/v1/bookings/:id/cancel
 */
const cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  const isStudent = booking.studentId.toString() === req.user._id.toString();
  const isOwner = booking.ownerId.toString() === req.user._id.toString();

  if (!isStudent && !isOwner && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to cancel this booking', 403));
  }

  // If this booking was already accepted, execute Cancellation Reversal
  if (booking.status === BOOKING_STATUS.ACCEPTED) {
    await Listing.findByIdAndUpdate(booking.listingId, {
      $inc: { availableBeds: 1 },
      $set: { isAvailable: true },
    });
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      booking,
    },
  });
});

module.exports = {
  createBooking,
  getMyStudentBookings,
  getLandlordIncomingBookings,
  updateBookingStatus,
  cancelBooking,
};
