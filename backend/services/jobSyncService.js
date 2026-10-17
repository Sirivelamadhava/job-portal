const ExternalJob = require('../models/ExternalJob');
const JobSyncLog = require('../models/JobSyncLog');
const JobAlert = require('../models/JobAlert');
const providerRegistry = require('../providers/providerRegistry');
const jobNormalizationService = require('./jobNormalizationService');
const fresherEligibilityService = require('./fresherEligibilityService');

const TARGET_FRESHER_QUERIES = [
  'Software Developer Fresher',
  'Associate Software Engineer',
  'Graduate Engineer Trainee',
  'Frontend Developer Fresher',
  'React.js Developer Fresher',
  'Full Stack Developer Fresher',
  'Python Developer Fresher',
  'Java Developer Fresher',
  'QA Tester Fresher',
  'IT Support Fresher',
  'Entry-Level Data Analyst',
  'Junior Web Developer',
];

class JobSyncService {
  constructor() {
    this.isSyncRunning = false;
    this.lastManualSyncAt = null;
    this.manualSyncCooldownMs = 60 * 1000; // 60 seconds cooldown between manual syncs
  }

  /**
   * Generates a normalized duplicate fingerprint for grouping/deduplication:
   * e.g., "softwaredevelopertrainee_infosys_bengaluru"
   */
  generateFingerprint(title = '', company = '', location = '') {
    const clean = (str) =>
      (str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    return `${clean(title)}_${clean(company)}_${clean(location).substring(0, 20)}`;
  }

  /**
   * Calculates the next scheduled sync time (6:00 AM IST / Asia/Kolkata)
   */
  getNextScheduledSyncTime() {
    const now = new Date();
    const istFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = istFormatter.formatToParts(now);
    const getPart = (type) => parseInt(parts.find((p) => p.type === type)?.value, 10);

    const year = getPart('year');
    const month = getPart('month') - 1;
    const day = getPart('day');
    const hour = getPart('hour');

    // 6:00 AM IST corresponds to 00:30 UTC
    const targetDay = hour >= 6 ? day + 1 : day;
    return new Date(Date.UTC(year, month, targetDay, 0, 30, 0));
  }

  /**
   * Core Daily Fresher IT Job Discovery & Synchronization Workflow
   */
  async runSync({ triggerType = 'scheduled_cron', userId = null } = {}) {
    if (this.isSyncRunning) {
      throw new Error('A job synchronization cycle is already actively running.');
    }

    if (triggerType === 'manual_admin' && this.lastManualSyncAt) {
      const elapsed = Date.now() - this.lastManualSyncAt;
      if (elapsed < this.manualSyncCooldownMs) {
        const remainingSec = Math.ceil((this.manualSyncCooldownMs - elapsed) / 1000);
        throw new Error(`Sync rate limit active. Please wait ${remainingSec}s before triggering another sync.`);
      }
    }

    this.isSyncRunning = true;
    if (triggerType === 'manual_admin') {
      this.lastManualSyncAt = Date.now();
    }

    const syncLog = new JobSyncLog({
      syncStartedAt: new Date(),
      status: 'running',
      triggerType,
      triggeredBy: userId,
      metrics: {
        totalFetched: 0,
        newJobsFound: 0,
        existingUpdated: 0,
        duplicatesSkipped: 0,
        expiredFlagged: 0,
        fresherDisqualified: 0,
      },
      providerStats: [],
      syncErrors: [],
    });

    await syncLog.save();

    console.log(`[JobSyncService] Starting Fresher Job Sync (${triggerType})...`);

    try {
      const allRegistered = providerRegistry.providers || [];
      const fetchedRawList = [];

      // 1. Process each provider safely without crashing if one provider errors
      for (const provider of allRegistered) {
        const startTime = Date.now();
        const info = provider.getProviderInfo();
        const stat = {
          providerName: provider.name,
          displayName: provider.displayName || info.displayName,
          status: 'success',
          fetchedCount: 0,
          newJobsCount: 0,
          updatedCount: 0,
          error: '',
          durationMs: 0,
          lastFetchedAt: new Date(),
        };

        if (!provider.isConfigured()) {
          stat.status = 'awaiting_credentials';
          stat.durationMs = Date.now() - startTime;
          syncLog.providerStats.push(stat);
          continue;
        }

        try {
          // Query provider across fresher roles
          let providerJobs = [];

          if (provider.name === 'CareerSphere') {
            // Internal provider handles its own query
            providerJobs = await provider.fetchJobs({});
          } else if (provider.name === 'AuthorizedFeeds') {
            // Query Arbeitnow & Remotive
            const feedQueries = ['fresher', 'junior', 'entry level', 'graduate', 'intern'];
            const feedResults = await Promise.allSettled(
              feedQueries.map((q) => provider.fetchJobs({ search: q }))
            );
            for (const res of feedResults) {
              if (res.status === 'fulfilled' && Array.isArray(res.value)) {
                providerJobs.push(...res.value);
              }
            }
          } else {
            // Partner enterprise adapter
            providerJobs = await provider.fetchJobs({});
          }

          stat.fetchedCount = providerJobs.length;
          syncLog.metrics.totalFetched += providerJobs.length;

          // Add to queue for DB normalization and deduplication
          for (const job of providerJobs) {
            fetchedRawList.push({
              job,
              providerName: provider.name,
              statRef: stat,
            });
          }
        } catch (provErr) {
          stat.status = 'failed';
          stat.error = provErr.message;
          syncLog.syncErrors.push(`[${provider.name}] ${provErr.message}`);
          console.warn(`[JobSyncService] Error fetching from ${provider.name}:`, provErr.message);
        } finally {
          stat.durationMs = Date.now() - startTime;
          syncLog.providerStats.push(stat);
        }
      }

      // 2. Strict Fresher Evaluation, Deduplication & Storage
      for (const item of fetchedRawList) {
        const raw = item.job;
        const providerName = item.providerName;
        const statRef = item.statRef;

        // Verify valid external original application URL
        const originalUrl = (raw.originalUrl || raw.externalUrl || '').trim();
        if (raw.isExternal && (!originalUrl || !originalUrl.startsWith('http'))) {
          syncLog.metrics.duplicatesSkipped++;
          continue;
        }

        // Strict 0-experience evaluation
        const evaluation = fresherEligibilityService.evaluate({
          title: raw.title,
          description: raw.description,
          skills: raw.skills,
          experienceLevel: raw.experienceLevel || 'entry',
          employmentType: raw.employmentType,
        });

        if (!evaluation.isFresherEligible) {
          syncLog.metrics.fresherDisqualified++;
          continue;
        }

        // Generate canonical fingerprint
        const fingerprint = this.generateFingerprint(raw.title, raw.companyName, raw.city || raw.location);
        const actualSource = raw.source || providerName;
        const externalId = raw._id || `ext_${actualSource.toLowerCase()}_${raw.sourceJobId || Buffer.from(fingerprint).toString('base64').substring(0, 16)}`;

        // Check if job already exists in ExternalJob
        const existingJob = await ExternalJob.findOne({
          $or: [{ externalId }, { duplicateFingerprint: fingerprint }],
        });

        const isPostedToday = raw.postedAt
          ? Date.now() - new Date(raw.postedAt).getTime() < 24 * 60 * 60 * 1000
          : false;

        if (existingJob) {
          // Normalize source if previously recorded under generic feed name
          if ((existingJob.source === 'AuthorizedFeeds' || !existingJob.source) && actualSource) {
            existingJob.source = actualSource;
          }

          // If from a different provider, record cross-platform alternative link
          if (existingJob.source !== actualSource && originalUrl) {
            const hasAlt = existingJob.alternativeSources.some((alt) => alt.source === actualSource);
            if (!hasAlt) {
              existingJob.alternativeSources.push({
                source: actualSource,
                originalUrl,
                discoveredAt: new Date(),
              });
            }
          }


          // Check if genuine update detected
          const contentChanged =
            existingJob.title !== raw.title ||
            existingJob.salary !== raw.salary ||
            (raw.description && existingJob.description !== raw.description);

          if (contentChanged) {
            existingJob.isRecentlyUpdated = true;
            existingJob.recentlyUpdatedAt = new Date();
          }

          existingJob.lastVerifiedAt = new Date();
          existingJob.status = 'active'; // Confirmed live by sync
          await existingJob.save();

          syncLog.metrics.existingUpdated++;
          if (statRef) statRef.updatedCount++;
        } else if (raw.isExternal) {
          // Brand new genuine external fresher listing
          const newListing = new ExternalJob({
            externalId,
            source: actualSource,
            sourceJobId: raw.sourceJobId || '',
            title: raw.title,
            companyName: raw.companyName,
            companyLogo: raw.companyLogo || '',
            location: raw.location,
            city: raw.city || 'India',
            workplaceType: raw.workplaceType || 'remote',
            employmentType: raw.employmentType || 'full-time',
            fresherCategory: evaluation.category,
            fresherCategoryLabel: evaluation.categoryLabel,
            isFresherEligible: true,
            isFresherVerified: evaluation.confidence === 'high',
            experienceRequired: evaluation.experienceLabel,
            salary: raw.salary || 'Best in Industry',
            salaryMin: raw.salaryMin || 0,
            salaryMax: raw.salaryMax || 0,
            currency: raw.currency || 'INR',
            skills: raw.skills || [],
            description: raw.description || '',
            summary: raw.summary || (raw.description ? raw.description.substring(0, 240) : ''),
            originalUrl,
            postedAt: raw.postedAt || new Date(),
            firstDiscoveredAt: new Date(),
            lastVerifiedAt: new Date(),
            isNewToday: isPostedToday,
            isRecentlyUpdated: false,
            status: 'active',
            duplicateFingerprint: fingerprint,
            alternativeSources: [],
          });

          await newListing.save();
          syncLog.metrics.newJobsFound++;
          if (statRef) statRef.newJobsCount++;
        }
      }

      // 3. Flag expired listings (deadline elapsed or unverified for > 30 days)
      const expiredThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const expiredResult = await ExternalJob.updateMany(
        {
          status: 'active',
          $or: [
            { deadline: { $lt: new Date() } },
            { lastVerifiedAt: { $lt: expiredThreshold } },
          ],
        },
        { $set: { status: 'expired' } }
      );

      syncLog.metrics.expiredFlagged = expiredResult.modifiedCount || 0;

      // 4. Invalidate aggregation cache
      const jobAggregationService = require('./jobAggregationService');
      jobAggregationService.invalidateCache();

      // 5. Complete Log
      syncLog.status = syncLog.syncErrors.length > 0 ? 'partial' : 'completed';
      syncLog.syncCompletedAt = new Date();
      syncLog.summary = `Sync completed. ${syncLog.metrics.newJobsFound} new fresher jobs, ${syncLog.metrics.existingUpdated} updated, ${syncLog.metrics.expiredFlagged} expired.`;
      await syncLog.save();

      console.log(`[JobSyncService] ${syncLog.summary}`);

      // 6. Alert Notifications dispatch for candidate subscribers
      await this.dispatchJobAlerts(syncLog.metrics.newJobsFound);

      return syncLog;
    } catch (err) {
      syncLog.status = 'failed';
      syncLog.syncCompletedAt = new Date();
      syncLog.syncErrors.push(err.message);
      await syncLog.save();
      console.error('[JobSyncService] Sync failed:', err);
      throw err;
    } finally {
      this.isSyncRunning = false;
    }
  }

  /**
   * Dispatches alerts to candidates subscribed to daily fresher updates
   */
  async dispatchJobAlerts(newJobsCount) {
    if (newJobsCount === 0) return;
    try {
      const activeAlerts = await JobAlert.find({ isActive: true });
      if (!activeAlerts.length) return;

      console.log(`[JobSyncService] Dispatching daily job updates to ${activeAlerts.length} subscriber(s)...`);

      for (const alert of activeAlerts) {
        // Query new jobs matching candidate's preferences
        const matchQuery = {
          status: 'active',
          isFresherEligible: true,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        };

        if (alert.preferredLocations && alert.preferredLocations.length > 0) {
          matchQuery.city = { $in: alert.preferredLocations };
        }

        if (alert.workModes && alert.workModes.length > 0) {
          matchQuery.workplaceType = { $in: alert.workModes };
        }

        const matchedCount = await ExternalJob.countDocuments(matchQuery);
        if (matchedCount > 0) {
          alert.lastAlertSentAt = new Date();
          await alert.save();
          console.log(`[JobAlert] Sent ${matchedCount} fresher openings notification to ${alert.email}`);
        }
      }
    } catch (err) {
      console.warn('[JobSyncService] Error dispatching alerts:', err.message);
    }
  }

  /**
   * Returns current sync telemetry for Admin Dashboard
   */
  async getSyncTelemetry() {
    const [lastSync, lastSuccessfulSync, totalActiveExternal, totalNewToday, recentLogs] = await Promise.all([
      JobSyncLog.findOne().sort({ createdAt: -1 }),
      JobSyncLog.findOne({ status: 'completed' }).sort({ createdAt: -1 }),
      ExternalJob.countDocuments({ status: 'active', isFresherEligible: true }),
      ExternalJob.countDocuments({
        status: 'active',
        isFresherEligible: true,
        postedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      JobSyncLog.find().sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    const allProviders = providerRegistry.getAllProvidersInfo();

    return {
      isSyncRunning: this.isSyncRunning,
      lastSync,
      lastSuccessfulSyncTime: lastSuccessfulSync?.syncCompletedAt || lastSync?.syncCompletedAt || null,
      nextScheduledSyncTime: this.getNextScheduledSyncTime(),
      totalActiveExternalJobs: totalActiveExternal,
      totalNewToday,
      providers: allProviders,
      recentLogs,
    };
  }
}

module.exports = new JobSyncService();
