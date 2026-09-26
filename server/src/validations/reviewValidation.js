const { z } = require('zod');

const createReviewSchema = z.object({
  listingId: z.string().min(24).max(24),
  rating: z.coerce.number().min(1, 'Rating must be between 1 and 5').max(5),
  cleanliness: z.coerce.number().min(1).max(5).default(5),
  landlordCommunication: z.coerce.number().min(1).max(5).default(5),
  safety: z.coerce.number().min(1).max(5).default(5),
  comment: z.string().min(10, 'Review comment must be at least 10 characters').max(1000),
});

module.exports = {
  createReviewSchema,
};
