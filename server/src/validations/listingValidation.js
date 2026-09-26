const { z } = require('zod');
const { ROOM_TYPE, GENDER_PREFERENCE } = require('../constants/statuses');

const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  nearestUniversity: z.string().min(2, 'Nearest university is required'),
  distanceToCampus: z.string().optional(),
  rentAmount: z.coerce.number().min(1, 'Rent amount must be greater than 0'),
  keyMoney: z.coerce.number().min(0).optional().default(0),
  roomType: z.nativeEnum(ROOM_TYPE).default(ROOM_TYPE.SINGLE),
  totalBeds: z.coerce.number().min(1, 'Must have at least 1 bed').default(1),
  availableBeds: z.coerce.number().min(0).default(1),
  genderPreference: z.nativeEnum(GENDER_PREFERENCE).default(GENDER_PREFERENCE.ANY),
  facilities: z.array(z.string()).or(z.string().transform((val) => JSON.parse(val))).optional().default([]),
  houseRules: z.array(z.string()).or(z.string().transform((val) => JSON.parse(val))).optional().default([]),
  utilitiesIncluded: z.coerce.boolean().optional().default(false),
  images: z.array(z.string()).optional().default([]),
});

const updateListingSchema = createListingSchema.partial().extend({
  isAvailable: z.coerce.boolean().optional(),
});

module.exports = {
  createListingSchema,
  updateListingSchema,
};
