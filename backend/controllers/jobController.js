const Job = require('../models/Job');
const Company = require('../models/Company');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc    Get public jobs with search, multi-attribute filtering & pagination
 * @route   GET /api/jobs
 * @access  Public
 */
const getPublicJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      workplaceType,
      employmentType,
      experienceLevel,
      minSalary,
      skills,
      sort = 'newest',
      page = 1,
      limit = 9,
    } = req.query;

    const query = {
      status: 'approved',
      deadline: { $gte: new Date() }, // Only open, unexpired jobs
    };

    // Keyword search (title, companyName, skills, description)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { skills: { $in: [searchRegex] } },
        { location: searchRegex },
        { description: searchRegex },
      ];
    }

    // Location filter
    if (location && location.trim()) {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Workplace type filter (remote, hybrid, on-site)
    if (workplaceType) {
      const types = Array.isArray(workplaceType)
        ? workplaceType
        : workplaceType.split(',').map((t) => t.trim());
      query.workplaceType = { $in: types };
    }

    // Employment type filter (full-time, part-time, contract, internship)
    if (employmentType) {
      const types = Array.isArray(employmentType)
        ? employmentType
        : employmentType.split(',').map((t) => t.trim());
      query.employmentType = { $in: types };
    }

    // Experience level filter (entry, mid, senior, lead, executive)
    if (experienceLevel) {
      const levels = Array.isArray(experienceLevel)
        ? experienceLevel
        : experienceLevel.split(',').map((l) => l.trim());
      query.experienceLevel = { $in: levels };
    }

    // Minimum Salary filter (matches jobs where maximum or minimum salary meets or exceeds)
    if (minSalary && !isNaN(Number(minSalary))) {
      const salaryNum = Number(minSalary);
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { salaryMax: { $gte: salaryNum } },
          { salaryMin: { $gte: salaryNum } },
        ],
      });
    }

    // Specific Skills filter
    if (skills) {
      const skillList = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => new RegExp(s.trim(), 'i'));
      query.skills = { $in: skillList };
    }

    // Sorting options
    let sortOption = { createdAt: -1 };
    if (sort === 'salary_high') {
      sortOption = { salaryMax: -1, salaryMin: -1 };
    } else if (sort === 'salary_low') {
      sortOption = { salaryMin: 1 };
    } else if (sort === 'popular') {
      sortOption = { viewsCount: -1, createdAt: -1 };
    } else if (sort === 'deadline') {
      sortOption = { deadline: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .populate('company', 'companyName logo website location industry companySize')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return ApiResponse.paginated(
      res,
      'Jobs retrieved successfully',
      jobs,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured jobs for homepage
 * @route   GET /api/jobs/featured
 * @access  Public
 */
const getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({
      status: 'approved',
      deadline: { $gte: new Date() },
    })
      .populate('company', 'companyName logo website industry')
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(6)
      .lean();

    return ApiResponse.success(res, 'Featured jobs retrieved', jobs);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID with related jobs
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('company', 'companyName logo website description location industry companySize')
      .populate('recruiter', 'name email avatar');

    if (!job) {
      return next(ApiError.notFound('Job posting not found.'));
    }

    // Increment view count asynchronously
    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save({ validateBeforeSave: false });

    // Fetch up to 3 similar jobs with matching skills or workplaceType
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      status: 'approved',
      deadline: { $gte: new Date() },
      $or: [
        { skills: { $in: job.skills } },
        { workplaceType: job.workplaceType },
        { employmentType: job.employmentType },
      ],
    })
      .populate('company', 'companyName logo')
      .limit(3)
      .lean();

    return ApiResponse.success(res, 'Job details retrieved successfully', {
      job,
      similarJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get popular job categories with live active job counts
 * @route   GET /api/jobs/categories
 * @access  Public
 */
const getJobCategories = async (req, res, next) => {
  try {
    // Curated primary categories with aggregations
    const categoriesConfig = [
      { id: 'software', name: 'Software Development', icon: 'Code', keywords: ['react', 'node', 'full stack', 'frontend', 'backend', 'engineer', 'developer', 'software'] },
      { id: 'ai-ml', name: 'AI & Machine Learning', icon: 'Cpu', keywords: ['ai', 'machine learning', 'data science', 'llm', 'deep learning', 'nlp', 'python'] },
      { id: 'devops-cloud', name: 'DevOps & Cloud', icon: 'Cloud', keywords: ['devops', 'cloud', 'aws', 'docker', 'kubernetes', 'infrastructure', 'sre'] },
      { id: 'design', name: 'UI / UX & Product Design', icon: 'Palette', keywords: ['design', 'ui', 'ux', 'product designer', 'figma'] },
      { id: 'product', name: 'Product Management', icon: 'Compass', keywords: ['product manager', 'scrum', 'agile', 'roadmap', 'product lead'] },
      { id: 'data', name: 'Data Engineering & Analytics', icon: 'Database', keywords: ['data engineer', 'sql', 'analytics', 'bigquery', 'etl', 'bi'] },
    ];

    const activeJobs = await Job.find({
      status: 'approved',
      deadline: { $gte: new Date() },
    }).select('title skills description');

    const result = categoriesConfig.map((cat) => {
      const count = activeJobs.filter((j) => {
        const text = `${j.title} ${j.skills.join(' ')} ${j.description}`.toLowerCase();
        return cat.keywords.some((k) => text.includes(k));
      }).length;

      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        openingsCount: Math.max(count, 1), // At least 1 for display fidelity
      };
    });

    return ApiResponse.success(res, 'Job categories retrieved', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job vacancy (Recruiter)
 * @route   POST /api/jobs
 * @access  Private (Recruiter)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      location,
      workplaceType,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      currency = 'USD',
      salaryPeriod = 'yearly',
      skills,
      openings = 1,
      description,
      responsibilities,
      qualifications,
      deadline,
      applicationMethod = 'platform',
      externalUrl,
      status = 'pending_approval',
    } = req.body;

    // Check recruiter's company profile
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return next(
        ApiError.badRequest(
          'Please complete and submit your company profile before posting jobs.'
        )
      );
    }

    // Validate required fields
    if (!title || !location || !description || !deadline) {
      return next(
        ApiError.badRequest(
          'Job title, location, description, and application deadline are required.'
        )
      );
    }

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim())
      : [];

    if (parsedSkills.length === 0) {
      return next(ApiError.badRequest('Please specify at least one required skill.'));
    }

    const job = new Job({
      recruiter: req.user._id,
      company: company._id,
      companyName: company.companyName,
      companyLogo: company.logo || '',
      title,
      location,
      workplaceType: workplaceType || 'remote',
      employmentType: employmentType || 'full-time',
      experienceLevel: experienceLevel || 'mid',
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      currency,
      salaryPeriod,
      skills: parsedSkills,
      openings: Number(openings) || 1,
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      deadline: new Date(deadline),
      applicationMethod,
      externalUrl: externalUrl || '',
      status: status === 'draft' ? 'draft' : 'pending_approval',
    });

    await job.save();

    return ApiResponse.created(
      res,
      status === 'draft'
        ? 'Job draft saved successfully.'
        : 'Job submitted for admin approval.',
      job
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs authored by the current recruiter
 * @route   GET /api/jobs/my/jobs
 * @access  Private (Recruiter)
 */
const getMyJobs = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { recruiter: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      query.title = new RegExp(search.trim(), 'i');
    }

    const jobs = await Job.find(query)
      .populate('company', 'companyName logo')
      .sort({ createdAt: -1 });

    // Aggregate recruiter dashboard stats
    const allRecruiterJobs = await Job.find({ recruiter: req.user._id });
    const stats = {
      total: allRecruiterJobs.length,
      active: allRecruiterJobs.filter((j) => j.status === 'approved').length,
      pending: allRecruiterJobs.filter((j) => j.status === 'pending_approval').length,
      drafts: allRecruiterJobs.filter((j) => j.status === 'draft').length,
      closed: allRecruiterJobs.filter((j) => j.status === 'closed').length,
      totalViews: allRecruiterJobs.reduce((acc, j) => acc + (j.viewsCount || 0), 0),
      totalApplications: allRecruiterJobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 0),
    };

    return ApiResponse.success(res, 'Recruiter jobs retrieved', {
      jobs,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job vacancy (Author ownership verified)
 * @route   PUT /api/jobs/:id
 * @access  Private (Recruiter / Admin)
 */
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return next(ApiError.notFound('Job posting not found.'));
    }

    // Ownership check: must be the creator or admin
    if (
      job.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        ApiError.forbidden('Forbidden: You can only edit your own job postings.')
      );
    }

    const allowedFields = [
      'title',
      'location',
      'workplaceType',
      'employmentType',
      'experienceLevel',
      'salaryMin',
      'salaryMax',
      'currency',
      'salaryPeriod',
      'skills',
      'openings',
      'description',
      'responsibilities',
      'qualifications',
      'deadline',
      'applicationMethod',
      'externalUrl',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'skills' && typeof req.body[field] === 'string') {
          job.skills = req.body[field].split(',').map((s) => s.trim());
        } else {
          job[field] = req.body[field];
        }
      }
    });

    await job.save();

    return ApiResponse.success(res, 'Job posting updated successfully', job);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job posting (Author ownership verified)
 * @route   DELETE /api/jobs/:id
 * @access  Private (Recruiter / Admin)
 */
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return next(ApiError.notFound('Job posting not found.'));
    }

    // Ownership verification
    if (
      job.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        ApiError.forbidden('Forbidden: You can only delete your own job postings.')
      );
    }

    await Job.findByIdAndDelete(id);

    return ApiResponse.success(res, 'Job posting removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle job status between open (approved) and closed
 * @route   PATCH /api/jobs/:id/toggle-status
 * @access  Private (Recruiter)
 */
const toggleJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return next(ApiError.notFound('Job posting not found.'));
    }

    if (
      job.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        ApiError.forbidden('Forbidden: You can only modify your own job postings.')
      );
    }

    if (job.status === 'closed') {
      job.status = 'approved';
    } else {
      job.status = 'closed';
    }

    await job.save();

    return ApiResponse.success(
      res,
      `Job vacancy is now ${job.status}`,
      job
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicJobs,
  getFeaturedJobs,
  getJobById,
  getJobCategories,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  toggleJobStatus,
};

