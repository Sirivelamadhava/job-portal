const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { uploadResume } = require('../middleware/upload');
const {
  applyForJob,
  getMyApplications,
  withdrawApplication,
  getRecruiterApplications,
  updateApplicationStatus,
  saveJob,
  unsaveJob,
  getMySavedJobs,
  checkJobStatus,
} = require('../controllers/applicationController');

// Job Seeker endpoints
router.post(
  '/apply/:jobId',
  protect,
  authorize('job_seeker', 'admin'),
  uploadResume.single('resume'),
  applyForJob
);

router.get('/my', protect, authorize('job_seeker', 'admin'), getMyApplications);

router.patch(
  '/:id/withdraw',
  protect,
  authorize('job_seeker', 'admin'),
  withdrawApplication
);

// Bookmarks / Saved jobs endpoints
router.get('/saved', protect, getMySavedJobs);
router.post('/saved/:jobId', protect, saveJob);
router.delete('/saved/:jobId', protect, unsaveJob);
router.get('/check/:jobId', protect, checkJobStatus);

// Recruiter endpoints
router.get(
  '/recruiter',
  protect,
  authorize('recruiter', 'admin'),
  getRecruiterApplications
);

router.patch(
  '/:id/status',
  protect,
  authorize('recruiter', 'admin'),
  updateApplicationStatus
);

module.exports = router;
