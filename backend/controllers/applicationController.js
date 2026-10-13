const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc    Submit an application for a job
 * @route   POST /api/applications/apply/:jobId
 * @access  Private (Job Seeker / Admin)
 */
const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(ApiError.notFound('Job posting not found.'));
    }

    if (job.status !== 'approved') {
      return next(ApiError.badRequest('This job listing is not currently open for applications.'));
    }

    if (new Date(job.deadline) < new Date()) {
      return next(ApiError.badRequest('The application deadline for this position has passed.'));
    }

    // Prevent duplicate application
    const existingApp = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApp) {
      return next(
        ApiError.badRequest('You have already submitted an application for this position.')
      );
    }

    // Determine resume: either uploaded with request or profile resume
    let resumeUrl = '';
    let resumeOriginalName = 'Resume.pdf';

    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
      resumeOriginalName = req.file.originalname;

      // Also update user's profile resume if not already set
      await User.findByIdAndUpdate(req.user._id, {
        resumeUrl,
        resumeOriginalName,
        resumeUploadedAt: new Date(),
      });
    } else if (req.body.resumeUrl) {
      resumeUrl = req.body.resumeUrl;
      resumeOriginalName = req.body.resumeOriginalName || 'Resume.pdf';
    } else {
      const user = await User.findById(req.user._id);
      if (user && user.resumeUrl) {
        resumeUrl = user.resumeUrl;
        resumeOriginalName = user.resumeOriginalName || 'Resume.pdf';
      } else {
        return next(
          ApiError.badRequest(
            'Please upload a resume in PDF format or save one to your profile before applying.'
          )
        );
      }
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      recruiter: job.recruiter,
      resumeUrl,
      resumeOriginalName,
      coverLetter: coverLetter ? coverLetter.trim() : '',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          note: 'Application submitted successfully',
          changedBy: req.user._id,
          changedAt: new Date(),
        },
      ],
    });

    // Increment applications count on Job
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 },
    });

    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title companyName location workplaceType employmentType')
      .populate('applicant', 'name email phone avatar');

    return ApiResponse.created(
      res,
      'Your application has been submitted successfully!',
      populatedApp
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(ApiError.badRequest('You have already applied for this job vacancy.'));
    }
    next(error);
  }
};

/**
 * @desc    Get all applications submitted by the current job seeker
 * @route   GET /api/applications/my
 * @access  Private (Job Seeker / Admin)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { applicant: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'job',
        select:
          'title companyName location workplaceType employmentType salaryMin salaryMax currency status deadline company',
        populate: {
          path: 'company',
          select: 'logo website industry',
        },
      })
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 'Applications retrieved successfully', applications);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw an application
 * @route   PATCH /api/applications/:id/withdraw
 * @access  Private (Job Seeker / Admin)
 */
const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({
      _id: id,
      applicant: req.user._id,
    });

    if (!application) {
      return next(ApiError.notFound('Application not found.'));
    }

    if (application.status === 'withdrawn') {
      return next(ApiError.badRequest('Application is already withdrawn.'));
    }

    if (['accepted', 'rejected'].includes(application.status)) {
      return next(
        ApiError.badRequest(
          `Cannot withdraw an application that has already reached '${application.status}' stage.`
        )
      );
    }

    application.status = 'withdrawn';
    application.withdrawnAt = new Date();
    application.statusHistory.push({
      status: 'withdrawn',
      note: 'Candidate withdrew the application',
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await application.save();

    // Decrement application count on job
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationsCount: -1 },
    });

    return ApiResponse.success(res, 'Application withdrawn successfully', application);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications received by the recruiter
 * @route   GET /api/applications/recruiter
 * @access  Private (Recruiter / Admin)
 */
const getRecruiterApplications = async (req, res, next) => {
  try {
    const { jobId, status, search } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.recruiter = req.user._id;
    }

    if (jobId && jobId !== 'all') {
      filter.job = jobId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    let applications = await Application.find(filter)
      .populate('job', 'title companyName location workplaceType employmentType openings deadline')
      .populate('applicant', 'name email phone avatar skills location headline resumeUrl bio experience education')
      .sort({ createdAt: -1 });

    // Client-side search filtering by applicant name or skills if search query provided
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      applications = applications.filter((app) => {
        const nameMatch = app.applicant?.name?.toLowerCase().includes(q);
        const emailMatch = app.applicant?.email?.toLowerCase().includes(q);
        const skillsMatch = app.applicant?.skills?.some((s) => s.toLowerCase().includes(q));
        const jobMatch = app.job?.title?.toLowerCase().includes(q);
        return nameMatch || emailMatch || skillsMatch || jobMatch;
      });
    }

    return ApiResponse.success(res, 'Recruiter applications loaded successfully', applications);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (Reviewed, Shortlisted, Accepted, Rejected)
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Recruiter / Admin)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, recruiterFeedback } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return next(ApiError.badRequest(`Invalid status value. Allowed: ${validStatuses.join(', ')}`));
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return next(ApiError.notFound('Application not found.'));
    }

    // Verify ownership
    if (
      application.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(ApiError.forbidden('Forbidden: You can only update candidates for your own postings.'));
    }

    application.status = status;
    if (recruiterFeedback !== undefined) {
      application.recruiterFeedback = recruiterFeedback;
    }

    application.statusHistory.push({
      status,
      note: note || `Candidate status updated to ${status}`,
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await application.save();

    const updatedApp = await Application.findById(id)
      .populate('job', 'title companyName')
      .populate('applicant', 'name email phone avatar skills headline');

    return ApiResponse.success(res, `Application status updated to ${status}`, updatedApp);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bookmark / save a job
 * @route   POST /api/applications/saved/:jobId
 * @access  Private (Job Seeker / Admin)
 */
const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(ApiError.notFound('Job posting not found.'));
    }

    const existing = await SavedJob.findOne({
      user: req.user._id,
      job: jobId,
    });

    if (existing) {
      return ApiResponse.success(res, 'Job is already saved in bookmarks', { isSaved: true });
    }

    await SavedJob.create({
      user: req.user._id,
      job: jobId,
    });

    return ApiResponse.created(res, 'Job bookmarked to saved jobs', { isSaved: true });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove job from bookmarks
 * @route   DELETE /api/applications/saved/:jobId
 * @access  Private (Job Seeker / Admin)
 */
const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    await SavedJob.findOneAndDelete({
      user: req.user._id,
      job: jobId,
    });

    return ApiResponse.success(res, 'Job removed from saved bookmarks', { isSaved: false });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all saved jobs for current user
 * @route   GET /api/applications/saved
 * @access  Private (Job Seeker / Admin)
 */
const getMySavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'logo website industry',
        },
      })
      .sort({ createdAt: -1 });

    const validSavedJobs = saved
      .filter((s) => s.job !== null)
      .map((s) => ({
        _id: s._id,
        savedAt: s.createdAt,
        job: s.job,
      }));

    return ApiResponse.success(res, 'Saved jobs retrieved successfully', validSavedJobs);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if current user has saved or applied to a specific job
 * @route   GET /api/applications/check/:jobId
 * @access  Private
 */
const checkJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const [saved, application] = await Promise.all([
      SavedJob.findOne({ user: req.user._id, job: jobId }),
      Application.findOne({ applicant: req.user._id, job: jobId }),
    ]);

    return ApiResponse.success(res, 'Job status checked', {
      isSaved: !!saved,
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  withdrawApplication,
  getRecruiterApplications,
  updateApplicationStatus,
  saveJob,
  unsaveJob,
  getMySavedJobs,
  checkJobStatus,
};
