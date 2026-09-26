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

  // Issue Access and Refresh Tokens
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  // Save refresh token to user document
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set httpOnly cookies
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    status: 'success',
    message: 'Account registered successfully',
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
  const { name, phone, university, avatar } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(university !== undefined && { university }),
      ...(avatar && { avatar }),
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

module.exports = {
  register,
  login,
  refreshAuthToken,
  logout,
  getMe,
  updateProfile,
};
