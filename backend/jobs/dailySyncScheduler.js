const cron = require('node-cron');
const jobSyncService = require('../services/jobSyncService');
const ExternalJob = require('../models/ExternalJob');

class DailySyncScheduler {
  constructor() {
    this.cronTask = null;
    this.cronExpression = '0 6 * * *'; // Every day at 6:00 AM IST
    this.timezone = 'Asia/Kolkata';
  }

  /**
   * Initializes the scheduled daily fresher IT job discovery task
   */
  init() {
    console.log(`[DailySyncScheduler] Initializing 6:00 AM IST scheduler (${this.cronExpression}, TZ: ${this.timezone})...`);

    this.cronTask = cron.schedule(
      this.cronExpression,
      async () => {
        console.log('[DailySyncScheduler] 6:00 AM IST Triggered: Starting Daily Automatic Fresher Job Discovery...');
        try {
          await jobSyncService.runSync({ triggerType: 'scheduled_cron' });
        } catch (err) {
          console.error('[DailySyncScheduler] Scheduled sync error:', err.message);
        }
      },
      {
        scheduled: true,
        timezone: this.timezone,
      }
    );

    // Initial check: If no external jobs exist yet, run an initial background discovery sync
    this.checkInitialSync();
  }

  async checkInitialSync() {
    try {
      const count = await ExternalJob.countDocuments();
      if (count === 0) {
        console.log('[DailySyncScheduler] Database has 0 external fresher listings. Initiating startup discovery sync...');
        setTimeout(() => {
          jobSyncService
            .runSync({ triggerType: 'scheduled_cron' })
            .catch((err) => console.warn('[DailySyncScheduler] Startup sync warning:', err.message));
        }, 3000); // Wait 3s for server and mongo connection to settle
      }
    } catch (err) {
      console.warn('[DailySyncScheduler] Initial sync check failed:', err.message);
    }
  }

  stop() {
    if (this.cronTask) {
      this.cronTask.stop();
      console.log('[DailySyncScheduler] Scheduler stopped.');
    }
  }
}

module.exports = new DailySyncScheduler();
