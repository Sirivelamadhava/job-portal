const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address for daily alerts'],
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'Fresher Candidate',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    roles: {
      type: [String],
      default: ['Software Developer', 'Frontend Developer', 'Backend Developer'],
    },
    preferredLocations: {
      type: [String],
      default: ['Bengaluru', 'Hyderabad', 'Pune', 'Remote'],
    },
    workModes: {
      type: [String],
      default: ['remote', 'hybrid', 'on-site'],
    },
    categories: {
      type: [String],
      default: ['fulltime_fresher', 'internship', 'trainee', 'remote_entry'],
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastAlertSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

jobAlertSchema.index({ email: 1, isActive: 1 });

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);

module.exports = JobAlert;
