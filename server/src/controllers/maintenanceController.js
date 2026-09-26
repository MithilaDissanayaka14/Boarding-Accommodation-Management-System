const MaintenanceRequest = require('../models/MaintenanceRequest');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { MAINTENANCE_STATUS, BOOKING_STATUS } = require('../constants/statuses');

/**
 * Report a new maintenance issue (Student only)
 * POST /api/v1/maintenance
 */
const createMaintenanceRequest = asyncHandler(async (req, res, next) => {
  const { listingId, title, description, priority } = req.body;

  // 1. Verify listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return next(new AppError('No listing found with that ID', 404));
  }

  // 2. Verify that the student is an accepted tenant of this listing
  const activeTenancy = await Booking.findOne({
    studentId: req.user._id,
    listingId,
    status: { $in: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.COMPLETED] },
  });

  if (!activeTenancy) {
    return next(
      new AppError(
        'You can only submit maintenance tickets for properties where you have an active tenancy',
        403
      )
    );
  }

  // 3. Create ticket with server-assigned IDs
  const ticket = await MaintenanceRequest.create({
    listingId,
    tenantId: req.user._id,
    ownerId: listing.ownerId, // Strictly server-derived
    title,
    description,
    priority: priority || 'medium',
    status: MAINTENANCE_STATUS.PENDING,
  });

  const populatedTicket = await MaintenanceRequest.findById(ticket._id)
    .populate('listingId', 'title address city')
    .populate('tenantId', 'name email phone university');

  res.status(201).json({
    status: 'success',
    message: 'Maintenance ticket submitted successfully',
    data: {
      ticket: populatedTicket,
    },
  });
});

/**
 * Get maintenance tickets submitted by the logged-in student
 * GET /api/v1/maintenance/my
 */
const getStudentMaintenanceRequests = asyncHandler(async (req, res) => {
  const tickets = await MaintenanceRequest.find({ tenantId: req.user._id })
    .populate('listingId', 'title address city')
    .populate('ownerId', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

/**
 * Get maintenance tickets assigned to the logged-in landlord
 * GET /api/v1/maintenance/landlord
 */
const getLandlordMaintenanceRequests = asyncHandler(async (req, res) => {
  const tickets = await MaintenanceRequest.find({ ownerId: req.user._id })
    .populate('listingId', 'title address city')
    .populate('tenantId', 'name email phone university avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

/**
 * Update maintenance ticket status and notes (Landlord only)
 * PATCH /api/v1/maintenance/:id/status
 */
const updateMaintenanceStatus = asyncHandler(async (req, res, next) => {
  const { status, landlordNote } = req.body;

  const ticket = await MaintenanceRequest.findById(req.params.id);
  if (!ticket) {
    return next(new AppError('No maintenance ticket found with that ID', 404));
  }

  // Ensure caller is the landlord
  if (ticket.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to manage this ticket', 403));
  }

  if (status) {
    ticket.status = status;
    if (status === MAINTENANCE_STATUS.RESOLVED) {
      ticket.resolvedAt = new Date();
    }
  }

  if (landlordNote !== undefined) {
    ticket.landlordNote = landlordNote;
  }

  await ticket.save();

  const populated = await MaintenanceRequest.findById(ticket._id)
    .populate('listingId', 'title address city')
    .populate('tenantId', 'name email phone university');

  res.status(200).json({
    status: 'success',
    message: 'Maintenance ticket updated successfully',
    data: {
      ticket: populated,
    },
  });
});

module.exports = {
  createMaintenanceRequest,
  getStudentMaintenanceRequests,
  getLandlordMaintenanceRequests,
  updateMaintenanceStatus,
};
