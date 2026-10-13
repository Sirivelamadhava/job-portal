const Company = require('../models/Company');
const Job = require('../models/Job');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc    Get verified companies with active jobs count
 * @route   GET /api/companies
 * @access  Public
 */
const getPublicCompanies = async (req, res, next) => {
  try {
    const { search, industry, page = 1, limit = 12 } = req.query;

    const query = { status: 'approved' };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { companyName: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    if (industry && industry.trim()) {
      query.industry = new RegExp(industry.trim(), 'i');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [total, companies] = await Promise.all([
      Company.countDocuments(query),
      Company.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    // Attach active jobs count to each company
    const companiesWithJobCount = await Promise.all(
      companies.map(async (company) => {
        const activeJobsCount = await Job.countDocuments({
          company: company._id,
          status: 'approved',
          deadline: { $gte: new Date() },
        });
        return {
          ...company,
          activeJobsCount,
        };
      })
    );

    return ApiResponse.paginated(
      res,
      'Companies retrieved successfully',
      companiesWithJobCount,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single company profile and its active job openings
 * @route   GET /api/companies/:id
 * @access  Public
 */
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id).populate('user', 'name');
    if (!company) {
      return next(ApiError.notFound('Company profile not found.'));
    }

    const openJobs = await Job.find({
      company: company._id,
      status: 'approved',
      deadline: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    return ApiResponse.success(res, 'Company details retrieved', {
      company,
      openJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the current authenticated recruiter's company profile
 * @route   GET /api/companies/my/profile
 * @access  Private (Recruiter)
 */
const getRecruiterProfile = async (req, res, next) => {
  try {
    let company = await Company.findOne({ user: req.user._id });

    if (!company) {
      // Auto-initialize if not existing
      company = new Company({
        user: req.user._id,
        companyName: `${req.user.name}'s Company`,
        description: 'Please update your company description.',
        status: 'pending',
      });
      await company.save();
    }

    return ApiResponse.success(res, 'Recruiter company profile retrieved', company);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update recruiter's company profile
 * @route   PUT /api/companies/my/profile
 * @access  Private (Recruiter)
 */
const updateRecruiterProfile = async (req, res, next) => {
  try {
    const {
      companyName,
      website,
      description,
      location,
      industry,
      companySize,
      logo,
    } = req.body;

    let company = await Company.findOne({ user: req.user._id });
    if (!company) {
      company = new Company({ user: req.user._id });
    }

    if (companyName) company.companyName = companyName;
    if (website !== undefined) company.website = website;
    if (description) company.description = description;
    if (location !== undefined) company.location = location;
    if (industry) company.industry = industry;
    if (companySize) company.companySize = companySize;
    if (logo) company.logo = logo;

    await company.save();

    // Sync companyName across their existing job listings
    if (companyName || logo) {
      await Job.updateMany(
        { recruiter: req.user._id },
        {
          $set: {
            ...(companyName && { companyName }),
            ...(logo && { companyLogo: logo }),
          },
        }
      );
    }

    return ApiResponse.success(res, 'Company profile updated successfully', company);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload company logo image
 * @route   POST /api/companies/my/logo
 * @access  Private (Recruiter)
 */
const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('Please upload an image file for company logo.'));
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    const company = await Company.findOne({ user: req.user._id });
    if (company) {
      company.logo = logoUrl;
      await company.save();

      // Update in active jobs
      await Job.updateMany(
        { recruiter: req.user._id },
        { $set: { companyLogo: logoUrl } }
      );
    }

    return ApiResponse.success(res, 'Company logo uploaded successfully', {
      logoUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicCompanies,
  getCompanyById,
  getRecruiterProfile,
  updateRecruiterProfile,
  uploadCompanyLogo,
};

