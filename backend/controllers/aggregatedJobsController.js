const jobAggregationService = require('../services/jobAggregationService');
const providerRegistry = require('../providers/providerRegistry');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc    Get aggregated Real-Time Fresher IT Jobs with strict 0-exp filtering & categorization
 * @route   GET /api/jobs/aggregated
 * @access  Public
 */
const getAggregatedFresherJobs = async (req, res, next) => {
  try {
    const {
      search,
      keyword,
      location,
      category,
      workMode,
      employmentType,
      skills,
      source,
      fresherOnly = 'true',
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const result = await jobAggregationService.getAggregatedJobs({
      search: search || keyword || '',
      location,
      category,
      workMode,
      employmentType,
      skills,
      source,
      fresherOnly,
      sortBy,
      page,
      limit,
    });

    return ApiResponse.paginated(
      res,
      'Fresher IT jobs retrieved successfully',
      result.jobs,
      {
        ...result.pagination,
        stats: result.stats,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get provider status and partnership requirements transparency
 * @route   GET /api/jobs/aggregated/providers
 * @access  Public
 */
const getProvidersStatus = async (req, res, next) => {
  try {
    const providers = providerRegistry.getAllProvidersInfo();
    return ApiResponse.success(
      res,
      'Provider integration statuses retrieved',
      providers
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get target fresher categories with descriptions
 * @route   GET /api/jobs/aggregated/categories
 * @access  Public
 */
const getFresherCategories = async (req, res, next) => {
  try {
    const categories = [
      {
        id: 'all',
        label: 'All Fresher IT Roles',
        description: 'Complete feed of verified entry-level and 0-experience software jobs.',
      },
      {
        id: 'fulltime_fresher',
        label: 'Full-Time Fresher IT Jobs',
        description: 'Permanent full-time software developer, QA, and cloud engineer roles for recent graduates.',
      },
      {
        id: 'internship',
        label: 'Tech Internships',
        description: 'Paid technical internships for engineering students and 2025/2026 batches.',
      },
      {
        id: 'trainee',
        label: 'Graduate Trainee Jobs (GET)',
        description: 'Structured corporate training and Graduate Engineer Trainee programs.',
      },
      {
        id: 'remote_entry',
        label: 'Remote Entry-Level IT Jobs',
        description: '100% remote software developer and IT roles for freshers worldwide.',
      },
    ];

    return ApiResponse.success(res, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single fresher job details by ID
 * @route   GET /api/jobs/aggregated/:id
 * @access  Public
 */
const getFresherJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await jobAggregationService.getJobById(id);

    if (!job) {
      return next(ApiError.notFound('Fresher job listing not found or expired.'));
    }

    return ApiResponse.success(res, 'Job details retrieved successfully', {
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Subscribe to Daily Fresher IT Job Alerts
 * @route   POST /api/jobs/aggregated/alerts
 * @access  Public
 */
const subscribeJobAlert = async (req, res, next) => {
  try {
    const { email, name, roles, preferredLocations, workModes, categories } = req.body;

    if (!email || !email.includes('@')) {
      return next(ApiError.badRequest('Please provide a valid email address.'));
    }

    const JobAlert = require('../models/JobAlert');

    const alert = await JobAlert.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        email: email.toLowerCase().trim(),
        name: name || 'Fresher Candidate',
        roles: Array.isArray(roles) && roles.length > 0 ? roles : ['Software Developer', 'Frontend Developer', 'Python Developer'],
        preferredLocations: Array.isArray(preferredLocations) && preferredLocations.length > 0 ? preferredLocations : ['Bengaluru', 'Hyderabad', 'Pune', 'Remote'],
        workModes: Array.isArray(workModes) && workModes.length > 0 ? workModes : ['remote', 'hybrid', 'on-site'],
        categories: Array.isArray(categories) && categories.length > 0 ? categories : ['fulltime_fresher', 'internship', 'trainee', 'remote_entry'],
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return ApiResponse.success(
      res,
      'You are now subscribed to daily Fresher IT Job updates at 6:00 AM IST!',
      alert
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check alert subscription status for email
 * @route   GET /api/jobs/aggregated/alerts/check
 * @access  Public
 */
const getJobAlert = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return ApiResponse.success(res, 'No email query provided', { subscribed: false });
    }

    const JobAlert = require('../models/JobAlert');
    const alert = await JobAlert.findOne({ email: email.toLowerCase().trim() });

    return ApiResponse.success(res, 'Subscription status retrieved', {
      subscribed: Boolean(alert && alert.isActive),
      alert: alert || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAggregatedFresherJobs,
  getProvidersStatus,
  getFresherCategories,
  getFresherJobById,
  subscribeJobAlert,
  getJobAlert,
};

