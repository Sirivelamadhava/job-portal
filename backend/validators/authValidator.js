const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

// Middleware to extract validation errors and return structured response
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(new ApiError('Validation Error', 400, formattedErrors));
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['job_seeker', 'recruiter'])
    .withMessage('Role must be either job_seeker or recruiter. Public registration cannot grant admin privileges.'),

  // If registering as a recruiter, companyName is required
  body('companyName')
    .if(body('role').equals('recruiter'))
    .trim()
    .notEmpty()
    .withMessage('Company name is required for recruiter accounts')
    .isLength({ max: 120 })
    .withMessage('Company name cannot exceed 120 characters'),

  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('headline')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Headline cannot exceed 150 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array of strings'),

  body('role')
    .custom((value) => {
      if (value !== undefined) {
        throw new Error('User role cannot be changed via profile update');
      }
      return true;
    }),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  handleValidationErrors,
};
