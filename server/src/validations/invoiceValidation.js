const { z } = require('zod');
const { INVOICE_STATUS } = require('../constants/statuses');

const createInvoiceSchema = z.object({
  bookingId: z.string().min(24).max(24),
  billingMonth: z.string().min(3).max(50),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  dueDate: z.string().or(z.date()).refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }),
});

const submitSlipSchema = z.object({
  transactionRef: z.string().max(100).optional().default(''),
});

const verifyInvoiceSchema = z.object({
  status: z.enum([INVOICE_STATUS.VERIFIED, INVOICE_STATUS.REJECTED]),
  rejectionReason: z.string().max(300).optional().default(''),
});

module.exports = {
  createInvoiceSchema,
  submitSlipSchema,
  verifyInvoiceSchema,
};
