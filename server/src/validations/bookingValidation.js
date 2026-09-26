const { z } = require('zod');
const { BOOKING_STATUS } = require('../constants/statuses');

const createBookingSchema = z.object({
  listingId: z.string().min(24, 'Invalid listing ID').max(24),
  moveInDate: z.string().or(z.date()).refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid move-in date format',
  }),
  message: z.string().max(500).optional().default(''),
});

const updateBookingStatusSchema = z.object({
  status: z.enum([
    BOOKING_STATUS.ACCEPTED,
    BOOKING_STATUS.REJECTED,
    BOOKING_STATUS.CANCELLED,
    BOOKING_STATUS.COMPLETED,
  ]),
  rejectionReason: z.string().max(300).optional().default(''),
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
};
