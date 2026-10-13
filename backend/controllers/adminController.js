const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc    Get all jobs across the platform with moderation filter
 * @route   GET /api/admin/jobs
 * @access  Private (Admin)
 */
const getAllAdminJobs = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: new RegExp(search.trim(), 'i') },
        { companyName: new RegExp(search.trim(), 'i') },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .populate('recruiter', 'name email')
        .populate('company', 'companyName status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return ApiResponse.paginated(res, 'Admin jobs retrieved', jobs, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject a job posting
 * @route   PATCH /api/admin/jobs/:id/status
 * @access  Private (Admin)
 */
const updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback } = req.body;

    if (!['approved', 'rejected', 'pending_approval', 'closed'].includes(status)) {
      return next(ApiError.badRequest('Invalid status update value.'));
    }

    const job = await Job.findById(id);
    if (!job) {
      return next(ApiError.notFound('Job posting not found.'));
    }

    job.status = status;
    job.adminFeedback = adminFeedback || '';
    job.reviewedBy = req.user._id;
    job.reviewedAt = new Date();

    await job.save();

    return ApiResponse.success(res, `Job status updated to '${status}' successfully`, job);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove fake, expired, or inappropriate job listing
 * @route   DELETE /api/admin/jobs/:id
 * @access  Private (Admin)
 */
const deleteAdminJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return next(ApiError.notFound('Job posting not found.'));
    }

    return ApiResponse.success(res, 'Job listing removed by admin.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recruiters and their company approval statuses
 * @route   GET /api/admin/recruiters
 * @access  Private (Admin)
 */
const getAllRecruiters = async (req, res, next) => {
  try {
    const companies = await Company.find()
      .populate('user', 'name email status createdAt')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 'Recruiter companies retrieved', companies);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve, reject, or suspend a recruiter company account
 * @route   PATCH /api/admin/recruiters/:id/status
 * @access  Private (Admin)
 */
const updateRecruiterStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, approvalNote } = req.body;

    if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
      return next(ApiError.badRequest('Invalid company status.'));
    }

    const company = await Company.findById(id);
    if (!company) {
      return next(ApiError.notFound('Company profile not found.'));
    }

    company.status = status;
    if (approvalNote !== undefined) company.approvalNote = approvalNote;
    if (status === 'approved') {
      company.approvedAt = new Date();
      company.approvedBy = req.user._id;
    }

    await company.save();

    // If company is suspended, optionally suspend recruiter user
    if (status === 'suspended') {
      await User.findByIdAndUpdate(company.user, { status: 'suspended' });
    } else if (status === 'approved') {
      await User.findByIdAndUpdate(company.user, { status: 'active' });
    }

    return ApiResponse.success(res, `Company status updated to '${status}'`, company);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform metrics and statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalRecruiters,
      totalSeekers,
      totalJobs,
      pendingJobs,
      approvedJobs,
      totalApplications,
      pendingCompanies,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'job_seeker' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'pending_approval' }),
      Job.countDocuments({ status: 'approved' }),
      Application.countDocuments(),
      Company.countDocuments({ status: 'pending' }),
    ]);

    return ApiResponse.success(res, 'Platform statistics retrieved', {
      totalUsers,
      totalRecruiters,
      totalSeekers,
      totalJobs,
      pendingJobs,
      approvedJobs,
      totalApplications,
      pendingCompanies,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdminJobs,
  updateJobStatus,
  deleteAdminJob,
  getAllRecruiters,
  updateRecruiterStatus,
  getPlatformStats,
};
