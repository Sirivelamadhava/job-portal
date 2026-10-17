const express = require('express');
const router = express.Router();

const {
  getPublicJobs,
  getAggregatorProviders,
  getFeaturedJobs,
  getJobById,
  getJobCategories,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  toggleJobStatus,
} = require('../controllers/jobController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public Job Search & Browsing Endpoints
router.get('/', getPublicJobs);
router.get('/providers', getAggregatorProviders);
router.get('/featured', getFeaturedJobs);
router.get('/categories', getJobCategories);
router.get('/:id', getJobById);

// Protected Recruiter Job Management Endpoints
router.post('/', protect, authorize('recruiter'), createJob);
router.get('/my/jobs', protect, authorize('recruiter'), getMyJobs);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.patch('/:id/toggle-status', protect, authorize('recruiter'), toggleJobStatus);

module.exports = router;
