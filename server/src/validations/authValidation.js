const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum([ROLES.STUDENT, ROLES.LANDLORD]).default(ROLES.STUDENT),
  phone: z.string().min(9, 'Phone number must have at least 9 digits'),
  university: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(9).optional(),
  university: z.string().optional(),
  avatar: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
