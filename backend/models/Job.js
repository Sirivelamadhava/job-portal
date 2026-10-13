const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    companyName: {
      type: String,
      required: [true, 'Please provide the company name'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Please specify the job location (e.g. San Francisco, CA or Remote)'],
      trim: true,
    },
    workplaceType: {
      type: String,
      enum: {
        values: ['remote', 'hybrid', 'on-site'],
        message: '{VALUE} is not a valid workplace type',
      },
      default: 'remote',
      required: true,
    },
    employmentType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship'],
        message: '{VALUE} is not a valid employment type',
      },
      default: 'full-time',
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['entry', 'mid', 'senior', 'lead', 'executive'],
        message: '{VALUE} is not a valid experience level',
      },
      default: 'mid',
      required: true,
    },
    salaryMin: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative'],
      default: 0,
    },
    salaryMax: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    salaryPeriod: {
      type: String,
      enum: ['yearly', 'monthly', 'hourly'],
      default: 'yearly',
    },
    skills: {
      type: [String],
      required: [true, 'Please specify at least one skill'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A job must have at least one required skill',
      },
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Number of openings must be at least 1'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed job description'],
      trim: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify an application deadline'],
    },
    applicationMethod: {
      type: String,
      enum: ['platform', 'external'],
      default: 'platform',
    },
    externalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'closed'],
      default: 'pending_approval',
      index: true,
    },
    adminFeedback: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
jobSchema.index(
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

// Additional compound index for common search/filter combinations
jobSchema.index({ status: 1, workplaceType: 1, employmentType: 1, experienceLevel: 1, createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
