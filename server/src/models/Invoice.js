const mongoose = require('mongoose');
const { INVOICE_STATUS } = require('../constants/statuses');

const invoiceSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'An invoice must belong to a booking'],
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'An invoice must be linked to a listing'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An invoice must be addressed to a student'],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An invoice must belong to a landlord/owner'],
      index: true,
    },
    billingMonth: {
      type: String,
      required: [true, 'Please specify the billing month/cycle (e.g., October 2026)'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the invoice amount in LKR'],
      min: [0, 'Invoice amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Please specify the payment due date'],
    },
    paymentSlipUrl: {
      type: String,
      default: '',
    },
    transactionRef: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: [
          INVOICE_STATUS.UNPAID,
          INVOICE_STATUS.SUBMITTED,
          INVOICE_STATUS.VERIFIED,
          INVOICE_STATUS.REJECTED,
        ],
        message: '{VALUE} is not a valid invoice status',
      },
      default: INVOICE_STATUS.UNPAID,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
invoiceSchema.index({ studentId: 1, status: 1 });
invoiceSchema.index({ ownerId: 1, status: 1 });
invoiceSchema.index({ bookingId: 1, billingMonth: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
