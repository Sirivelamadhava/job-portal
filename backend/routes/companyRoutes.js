const express = require('express');
const router = express.Router();

const {
  getPublicCompanies,
  getCompanyById,
  getRecruiterProfile,
  updateRecruiterProfile,
  uploadCompanyLogo,
} = require('../controllers/companyController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { uploadLogo } = require('../middleware/upload');

// Protected Recruiter Company Profile Endpoints (placed before /:id)
router.get('/my/profile', protect, authorize('recruiter'), getRecruiterProfile);
router.put('/my/profile', protect, authorize('recruiter'), updateRecruiterProfile);
router.post('/my/logo', protect, authorize('recruiter'), uploadLogo.single('logo'), uploadCompanyLogo);

// Public Company Directory Endpoints
router.get('/', getPublicCompanies);
router.get('/:id', getCompanyById);

module.exports = router;
