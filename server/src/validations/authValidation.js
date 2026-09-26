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
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().min(9, 'Phone number must have at least 9 digits').optional(),
  university: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().nullable(),
  address: z.string().max(250).optional().nullable(),
  emergencyContact: z.string().max(100).optional().nullable(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
};
