const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { processUploadedFile } = require('../middlewares/uploadMiddleware');
const { INVOICE_STATUS, BOOKING_STATUS } = require('../constants/statuses');

/**
 * Issue a monthly rent invoice (Landlord only)
 * POST /api/v1/invoices
 */
const createInvoice = asyncHandler(async (req, res, next) => {
  const { bookingId, billingMonth, amount, dueDate } = req.body;

  // 1. Verify booking exists and belongs to this landlord
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (booking.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to issue invoices for this booking', 403));
  }

  if (booking.status !== BOOKING_STATUS.ACCEPTED && booking.status !== BOOKING_STATUS.COMPLETED) {
    return next(new AppError('Invoices can only be issued for accepted tenancies', 400));
  }

  // 2. Check for duplicate invoice for the same cycle
  const existingInvoice = await Invoice.findOne({
    bookingId,
    billingMonth,
  });

  if (existingInvoice) {
    return next(
      new AppError(`An invoice for "${billingMonth}" has already been issued for this tenancy`, 400)
    );
  }

  // 3. Create invoice with server-derived IDs
  const invoice = await Invoice.create({
    bookingId: booking._id,
    listingId: booking.listingId,
    studentId: booking.studentId, // Strictly server-assigned
    ownerId: req.user._id,        // Strictly server-assigned
    billingMonth,
    amount: Number(amount),
    dueDate,
    status: INVOICE_STATUS.UNPAID,
  });

  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate('listingId', 'title address city')
    .populate('studentId', 'name email phone university');

  res.status(201).json({
    status: 'success',
    message: 'Rent invoice issued successfully',
    data: {
      invoice: populatedInvoice,
    },
  });
});

/**
 * Get all invoices for the authenticated student
 * GET /api/v1/invoices/my
 */
const getStudentInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ studentId: req.user._id })
    .populate('listingId', 'title address city rentAmount nearestUniversity')
    .populate('ownerId', 'name email phone')
    .sort({ dueDate: -1, createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: invoices.length,
    data: {
      invoices,
    },
  });
});

/**
 * Get all invoices issued by the authenticated landlord
 * GET /api/v1/invoices/landlord
 */
const getLandlordInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ ownerId: req.user._id })
    .populate('listingId', 'title address city')
    .populate('studentId', 'name email phone university avatar')
    .sort({ dueDate: -1, createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: invoices.length,
    data: {
      invoices,
    },
  });
});

/**
 * Upload payment slip & mark invoice as submitted (Student only)
 * PATCH /api/v1/invoices/:id/slip
 */
const submitPaymentSlip = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  // Ensure caller is the tenant
  if (invoice.studentId.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to pay this invoice', 403));
  }

  if (!req.file) {
    return next(new AppError('Please attach a payment slip image or PDF', 400));
  }

  // Process uploaded slip (Cloudinary or local static path)
  const slipUrl = await processUploadedFile(req.file, 'slips');

  invoice.paymentSlipUrl = slipUrl;
  invoice.transactionRef = req.body.transactionRef || '';
  invoice.status = INVOICE_STATUS.SUBMITTED;
  invoice.submittedAt = new Date();
  invoice.rejectionReason = ''; // Clear previous rejection if resubmitting

  await invoice.save();

  const populated = await Invoice.findById(invoice._id)
    .populate('listingId', 'title address city')
    .populate('ownerId', 'name email phone');

  res.status(200).json({
    status: 'success',
    message: 'Payment slip submitted successfully. Awaiting landlord verification.',
    data: {
      invoice: populated,
    },
  });
});

/**
 * Verify or Reject payment slip (Landlord only)
 * PATCH /api/v1/invoices/:id/verify
 */
const verifyPaymentSlip = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  // Ensure caller is the landlord
  if (invoice.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to verify this invoice', 403));
  }

  if (status === INVOICE_STATUS.VERIFIED) {
    invoice.status = INVOICE_STATUS.VERIFIED;
    invoice.verifiedAt = new Date();
    invoice.rejectionReason = '';
  } else if (status === INVOICE_STATUS.REJECTED) {
    invoice.status = INVOICE_STATUS.REJECTED;
    invoice.rejectionReason = rejectionReason || 'Payment slip could not be verified';
  }

  await invoice.save();

  const populated = await Invoice.findById(invoice._id)
    .populate('studentId', 'name email phone university')
    .populate('listingId', 'title address city');

  res.status(200).json({
    status: 'success',
    message: `Payment slip has been ${status}`,
    data: {
      invoice: populated,
    },
  });
});

module.exports = {
  createInvoice,
  getStudentInvoices,
  getLandlordInvoices,
  submitPaymentSlip,
  verifyPaymentSlip,
};
