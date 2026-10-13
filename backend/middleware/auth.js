const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is missing. Please log in.'));
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'job_portal_super_secret_jwt_key_2025_change_in_production'
    );

    // Find user in database
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists.'));
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      return next(ApiError.forbidden('Your account has been suspended by an administrator.'));
    }

    // Attach sanitized user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Authentication token has expired. Please log in again.'));
    }
    return next(error);
  }
};

module.exports = { protect };
