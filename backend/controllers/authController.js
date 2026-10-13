const User = require('../models/User');
const Company = require('../models/Company');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Register a new user (Job Seeker or Recruiter)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, website, description, location } = req.body;

    // Security check: Only allow job_seeker or recruiter via public registration
    const userRole = role === 'recruiter' ? 'recruiter' : 'job_seeker';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email address already exists.'));
    }

    // Create user record
    const user = new User({
      name,
      email,
      password,
      role: userRole,
    });

    let company = null;

    // If registering as recruiter, initialize company profile
    if (userRole === 'recruiter') {
      if (!companyName) {
        return next(ApiError.badRequest('Company name is required for recruiter registration.'));
      }

      company = new Company({
        user: user._id,
        companyName,
        website: website || '',
        description: description || `About ${companyName}`,
        location: location || '',
        status: 'pending', // Requires admin review
      });

      await company.save();
      user.company = company._id;
    }

    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    return ApiResponse.created(res, 'Registration successful. Welcome to CareerSphere!', {
      user: user.toSafeObject(),
      token,
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest('Please provide both email and password.'));
    }

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    // Verify account status
    if (user.status === 'suspended') {
      return next(ApiError.forbidden('Your account has been suspended by an administrator.'));
    }

    // Fetch company info if recruiter
    let company = null;
    if (user.role === 'recruiter') {
      company = await Company.findOne({ user: user._id });
    }

    // Generate token
    const token = user.generateAuthToken();

    return ApiResponse.success(res, 'Login successful', {
      user: user.toSafeObject(),
      token,
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Bearer Token required)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(ApiError.notFound('User profile not found.'));
    }

    let company = null;
    if (user.role === 'recruiter') {
      company = await Company.findOne({ user: user._id });
    }

    return ApiResponse.success(res, 'Profile retrieved successfully', {
      user: user.toSafeObject(),
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name',
      'headline',
      'bio',
      'phone',
      'location',
      'website',
      'skills',
      'avatar',
      'experience',
      'education',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    let company = null;
    if (updatedUser.role === 'recruiter') {
      company = await Company.findOne({ user: updatedUser._id });
    }

    return ApiResponse.success(res, 'Profile updated successfully', {
      user: updatedUser.toSafeObject(),
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change current user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(ApiError.badRequest('Please provide both current and new password.'));
    }

    if (newPassword.length < 6) {
      return next(ApiError.badRequest('New password must be at least 6 characters long.'));
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return next(ApiError.badRequest('Current password does not match.'));
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateAuthToken();

    return ApiResponse.success(res, 'Password updated successfully', {
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload user PDF resume
 * @route   POST /api/auth/resume
 * @access  Private
 */
const uploadResumeProfile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('Please upload a PDF resume document (max 5MB).'));
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const resumeOriginalName = req.file.originalname;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        resumeUrl,
        resumeOriginalName,
        resumeUploadedAt: new Date(),
      },
      { new: true }
    );

    return ApiResponse.success(res, 'Resume uploaded successfully', {
      user: user.toSafeObject(),
      resumeUrl,
      resumeOriginalName,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadResumeProfile,
};

