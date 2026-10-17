const mongoose = require('mongoose');

const externalJobSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    sourceJobId: {
      type: String,
      default: '',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: 'India',
      index: true,
    },
    workplaceType: {
      type: String,
      enum: ['remote', 'hybrid', 'on-site'],
      default: 'remote',
      index: true,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'internship', 'contract', 'part-time'],
      default: 'full-time',
      index: true,
    },
    fresherCategory: {
      type: String,
      enum: ['fulltime_fresher', 'internship', 'trainee', 'remote_entry'],
      default: 'fulltime_fresher',
      index: true,
    },
    fresherCategoryLabel: {
      type: String,
      default: 'Full-Time Fresher IT Role',
    },
    isFresherEligible: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFresherVerified: {
      type: Boolean,
      default: false,
    },
    experienceRequired: {
      type: String,
      default: '0 Years Required',
    },
    salary: {
      type: String,
      default: 'Best in Industry',
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    originalUrl: {
      type: String,
      required: [true, 'Original application URL is strictly required'],
      trim: true,
    },
    officialCareerSiteUrl: {
      type: String,
      default: '',
      trim: true,
    },
    hasPPO: {
      type: Boolean,
      default: false,
    },
    minQualification: {
      type: String,
      default: 'B.Tech / B.E. / MCA (Student / Graduate)',
    },

    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    firstDiscoveredAt: {
      type: Date,
      default: Date.now,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    recentlyUpdatedAt: {
      type: Date,
    },
    isRecentlyUpdated: {
      type: Boolean,
      default: false,
    },
    isNewToday: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'expired'],
      default: 'active',

      index: true,
    },
    duplicateFingerprint: {
      type: String,
      index: true,
    },
    alternativeSources: [
      {
        source: { type: String, required: true },
        originalUrl: { type: String, required: true },
        discoveredAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast search queries
externalJobSchema.index(
  {
    title: 'text',
    companyName: 'text',
    location: 'text',
    description: 'text',
    skills: 'text',
  },
  {
    weights: {
      title: 10,
      skills: 8,
      companyName: 5,
      location: 3,
      description: 1,
    },
  }
);

const ExternalJob = mongoose.model('ExternalJob', externalJobSchema);

module.exports = ExternalJob;
