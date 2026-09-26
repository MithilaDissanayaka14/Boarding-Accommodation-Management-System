const { z } = require('zod');
const { MAINTENANCE_STATUS, MAINTENANCE_PRIORITY } = require('../constants/statuses');

const createMaintenanceSchema = z.object({
  listingId: z.string().min(24).max(24),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.nativeEnum(MAINTENANCE_PRIORITY).default(MAINTENANCE_PRIORITY.MEDIUM),
});

const updateMaintenanceSchema = z.object({
  status: z.nativeEnum(MAINTENANCE_STATUS).optional(),
  landlordNote: z.string().max(500).optional(),
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
};
