const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../utils/tokens');
const { processUploadedFile } = require('../middlewares/uploadMiddleware');
const {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail,
} = require('../utils/emailService');

/**
 * Register a new student or landlord
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, university } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists', 409));
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    university: university || '',
  });

  // Generate initial Email Verification OTP
  const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(verificationOtp).digest('hex');
  user.emailVerificationOTP = hashedOtp;
  user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000;

  // Issue Access and Refresh Tokens
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  // Save refresh token to user document
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Send verification OTP asynchronously
  sendVerificationOtpEmail({ to: user.email, name: user.name, otp: verificationOtp }).catch(() => {});

  // Set httpOnly cookies
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    status: 'success',
    message: 'Account registered successfully. A verification code has been sent to your email.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        university: user.university,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      accessToken,
      ...(process.env.NODE_ENV === 'development' ? { devOtp: verificationOtp } : {}),
    },
  });
});

/**
 * Log in an existing user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists & select password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password credentials', 401));
  }

  // Issue Access and Refresh Tokens
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  // Update refresh token in database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set httpOnly cookies
  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        university: user.university,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      accessToken,
    },
  });
});

/**
 * Silent Refresh Token Rotation
 * POST /api/v1/auth/refresh
 */
const refreshAuthToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken =
    (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new AppError('No refresh token provided. Please log in again.', 401));
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    clearAuthCookies(res);
    return next(new AppError('Refresh token expired or invalid. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    clearAuthCookies(res);
    return next(new AppError('Invalid token reuse detected. Please log in again.', 403));
  }

  // Rotate tokens: create new access and new refresh token
  const newAccessToken = signAccessToken(user._id, user.role);
  const newRefreshToken = signRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, newAccessToken, newRefreshToken);

  res.status(200).json({
    status: 'success',
    data: {
      accessToken: newAccessToken,
    },
  });
});

/**
 * Log out user & invalidate cookies
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  clearAuthCookies(res);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        university: req.user.university,
        avatar: req.user.avatar,
        bio: req.user.bio || '',
        address: req.user.address || '',
        emergencyContact: req.user.emergencyContact || '',
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
      },
    },
  });
});

/**
 * Update user profile
 * PATCH /api/v1/auth/profile
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, university, avatar, bio, address, emergencyContact } = req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (phone !== undefined) updateFields.phone = phone;
  if (university !== undefined) updateFields.university = university;
  if (avatar !== undefined) updateFields.avatar = avatar;
  if (bio !== undefined) updateFields.bio = bio;
  if (address !== undefined) updateFields.address = address;
  if (emergencyContact !== undefined) updateFields.emergencyContact = emergencyContact;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updateFields,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        university: updatedUser.university,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio || '',
        address: updatedUser.address || '',
        emergencyContact: updatedUser.emergencyContact || '',
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
      },
    },
  });
});

/**
 * Update user password
 * PATCH /api/v1/auth/update-password
 */
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

/**
 * Upload profile avatar image file
 * PATCH /api/v1/auth/avatar
 */
const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select a photo to upload', 400));
  }

  const avatarUrl = await processUploadedFile(req.file, 'avatars');

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile photo uploaded successfully',
    data: {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        university: updatedUser.university,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio || '',
        address: updatedUser.address || '',
        emergencyContact: updatedUser.emergencyContact || '',
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
      },
    },
  });
});

/**
 * Send / Resend Email Verification OTP
 * POST /api/v1/auth/send-verification-otp
 */
const sendVerificationOtp = asyncHandler(async (req, res, next) => {
  const email = (req.body && req.body.email) || (req.user && req.user.email);
  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User with this email not found', 404));
  }

  if (user.isVerified) {
    return res.status(200).json({
      status: 'success',
      message: 'Account email is already verified',
      data: { isVerified: true },
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  user.emailVerificationOTP = hashedOtp;
  user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  await sendVerificationOtpEmail({ to: user.email, name: user.name, otp });

  res.status(200).json({
    status: 'success',
    message: `Verification code sent to ${user.email}`,
    ...(process.env.NODE_ENV === 'development' ? { devOtp: otp } : {}),
  });
});

/**
 * Verify Email with OTP
 * POST /api/v1/auth/verify-email-otp
 */
const verifyEmailOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  const email = (req.body && req.body.email) || (req.user && req.user.email);

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }
  if (!otp) {
    return next(new AppError('Please provide the 6-digit OTP code', 400));
  }

  const user = await User.findOne({ email }).select(
    '+emailVerificationOTP +emailVerificationOTPExpires'
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isVerified) {
    return res.status(200).json({
      status: 'success',
      message: 'Email is already verified',
      data: { isVerified: true },
    });
  }

  if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
    return next(
      new AppError('No verification code pending. Please request a new code.', 400)
    );
  }

  if (user.emailVerificationOTPExpires < Date.now()) {
    return next(
      new AppError('Verification code has expired. Please request a new code.', 400)
    );
  }

  const candidateHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
  if (candidateHash !== user.emailVerificationOTP) {
    return next(new AppError('Invalid verification code. Please check and try again.', 400));
  }

  user.isVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email address verified successfully!',
    data: {
      isVerified: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    },
  });
});

/**
 * Send Password Reset OTP
 * POST /api/v1/auth/forgot-password-otp
 */
const forgotPasswordOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide your email address', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Return friendly generic message for security
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists with this email, a 6-digit reset code has been sent.',
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  user.passwordResetOTP = hashedOtp;
  user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetOtpEmail({ to: user.email, name: user.name, otp });

  res.status(200).json({
    status: 'success',
    message: 'If an account exists with this email, a 6-digit reset code has been sent.',
    ...(process.env.NODE_ENV === 'development' ? { devOtp: otp } : {}),
  });
});

/**
 * Verify Password Reset OTP
 * POST /api/v1/auth/verify-reset-otp
 */
const verifyResetOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError('Email and OTP code are required', 400));
  }

  const user = await User.findOne({ email }).select(
    '+passwordResetOTP +passwordResetOTPExpires'
  );

  if (!user) {
    return next(new AppError('User not found with this email', 404));
  }

  if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
    return next(new AppError('No reset code requested or it has already been used.', 400));
  }

  if (user.passwordResetOTPExpires < Date.now()) {
    return next(new AppError('Reset code has expired. Please request a new code.', 400));
  }

  const candidateHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
  if (candidateHash !== user.passwordResetOTP) {
    return next(new AppError('Invalid reset code. Please check and try again.', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset code verified successfully. You may now enter your new password.',
  });
});

/**
 * Reset Password with OTP
 * POST /api/v1/auth/reset-password-otp
 */
const resetPasswordOtp = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return next(new AppError('Email, OTP code, and new password are required', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters long', 400));
  }

  const user = await User.findOne({ email }).select(
    '+password +passwordResetOTP +passwordResetOTPExpires'
  );

  if (!user) {
    return next(new AppError('User not found with this email', 404));
  }

  if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
    return next(new AppError('No reset code requested or it has already been used.', 400));
  }

  if (user.passwordResetOTPExpires < Date.now()) {
    return next(new AppError('Reset code has expired. Please request a new code.', 400));
  }

  const candidateHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
  if (candidateHash !== user.passwordResetOTP) {
    return next(new AppError('Invalid reset code. Please check and try again.', 400));
  }

  // Update password and invalidate reset OTP & refresh tokens
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully! You can now sign in with your new password.',
  });
});

module.exports = {
  register,
  login,
  refreshAuthToken,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  uploadAvatar,
  sendVerificationOtp,
  verifyEmailOtp,
  forgotPasswordOtp,
  verifyResetOtp,
  resetPasswordOtp,
};
