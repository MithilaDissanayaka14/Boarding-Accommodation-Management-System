const { verifyAccessToken } = require('../utils/tokens');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Protect routes: verify JWT access token from cookie or Authorization header
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check httpOnly cookie first (recommended secure method)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Or fallback to Bearer header for API clients/testing
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to gain access.', 401)
    );
  }

  // 3. Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
  }

  // 4. Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 5. Grant access: attach user to req
  req.user = currentUser;
  next();
});

/**
 * Restrict to specific roles (RBAC)
 * @param  {...string} roles - e.g. 'landlord', 'student', 'admin'
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: Your role (${req.user?.role || 'anonymous'}) is not permitted to perform this action.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
