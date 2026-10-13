const ApiError = require('../utils/apiError');

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles (e.g. 'admin', 'recruiter', 'job_seeker')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User is not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: Role '${req.user.role}' is not authorized to perform this action. Required roles: ${roles.join(', ')}.`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
