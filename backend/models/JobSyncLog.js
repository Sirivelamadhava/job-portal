const mongoose = require('mongoose');

const providerStatSchema = new mongoose.Schema(
  {
    providerName: { type: String, required: true },
    displayName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['success', 'failed', 'awaiting_credentials', 'skipped'],
      default: 'success',
    },
    fetchedCount: { type: Number, default: 0 },
    newJobsCount: { type: Number, default: 0 },
    updatedCount: { type: Number, default: 0 },
    error: { type: String, default: '' },
    durationMs: { type: Number, default: 0 },
    lastFetchedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const jobSyncLogSchema = new mongoose.Schema(
  {
    syncStartedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    syncCompletedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed', 'partial'],
      default: 'running',
      index: true,
    },
    triggerType: {
      type: String,
      enum: ['scheduled_cron', 'manual_admin'],
      default: 'scheduled_cron',
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metrics: {
      totalFetched: { type: Number, default: 0 },
      newJobsFound: { type: Number, default: 0 },
      existingUpdated: { type: Number, default: 0 },
      duplicatesSkipped: { type: Number, default: 0 },
      expiredFlagged: { type: Number, default: 0 },
      fresherDisqualified: { type: Number, default: 0 },
    },
    providerStats: [providerStatSchema],
    syncErrors: [{ type: String }],
    summary: { type: String, default: '' },
  },

  {
    timestamps: true,
  }
);

jobSyncLogSchema.index({ createdAt: -1 });

const JobSyncLog = mongoose.model('JobSyncLog', jobSyncLogSchema);

module.exports = JobSyncLog;
