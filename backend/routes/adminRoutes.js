const express = require('express');
const router = express.Router();

const {
  getAllAdminJobs,
  updateJobStatus,
  deleteAdminJob,
  getAllRecruiters,
  updateRecruiterStatus,
  getPlatformStats,
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All admin routes strictly require admin role
router.use(protect, authorize('admin'));

// Job Moderation
router.get('/jobs', getAllAdminJobs);
router.patch('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteAdminJob);

// Recruiter Approvals & Accounts
router.get('/recruiters', getAllRecruiters);
router.patch('/recruiters/:id/status', updateRecruiterStatus);

// Platform Overview Telemetry
router.get('/stats', getPlatformStats);

module.exports = router;
