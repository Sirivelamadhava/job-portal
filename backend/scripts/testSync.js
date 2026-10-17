const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const jobSyncService = require('../services/jobSyncService');
const ExternalJob = require('../models/ExternalJob');
const JobSyncLog = require('../models/JobSyncLog');

async function test() {
  console.log('[TestSync] Connecting to database...');
  await connectDB();

  console.log('[TestSync] Triggering manual test sync...');
  const result = await jobSyncService.runSync({ triggerType: 'manual_admin' });
  console.log('[TestSync] Sync finished with status:', result.status);
  console.log('[TestSync] Metrics:', JSON.stringify(result.metrics, null, 2));

  const totalStored = await ExternalJob.countDocuments();
  console.log(`[TestSync] Total External Jobs in DB: ${totalStored}`);

  const sample = await ExternalJob.findOne().sort({ createdAt: -1 });
  if (sample) {
    console.log('[TestSync] Sample Job:');
    console.log(' - Title:', sample.title);
    console.log(' - Company:', sample.companyName);
    console.log(' - Source:', sample.source);
    console.log(' - Original URL:', sample.originalUrl);
    console.log(' - Experience Required:', sample.experienceRequired);
    console.log(' - Is New Today:', sample.isNewToday);
    console.log(' - Last Verified At:', sample.lastVerifiedAt);
  }

  process.exit(0);
}

test().catch((err) => {
  console.error('[TestSync] Error:', err);
  process.exit(1);
});
