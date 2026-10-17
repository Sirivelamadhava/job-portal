const express = require('express');
const router = express.Router();
const {
  getAggregatedFresherJobs,
  getProvidersStatus,
  getFresherCategories,
  getFresherJobById,
  subscribeJobAlert,
  getJobAlert,
} = require('../controllers/aggregatedJobsController');

// Real-Time Fresher IT Job Aggregator Endpoints
router.get('/', getAggregatedFresherJobs);
router.get('/providers', getProvidersStatus);
router.get('/categories', getFresherCategories);

// Candidate Daily Fresher Alert Subscriptions
router.post('/alerts', subscribeJobAlert);
router.get('/alerts/check', getJobAlert);

// Single Job Details by ID
router.get('/:id', getFresherJobById);

module.exports = router;

