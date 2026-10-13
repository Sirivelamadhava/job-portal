const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadResumeProfile,
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} = require('../validators/authValidator');

const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { uploadResume } = require('../middleware/upload');

// Public endpoints (rate limited & validated)
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Protected endpoints
router.get('/me', protect, getMe);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/password', protect, changePassword);
router.post('/resume', protect, uploadResume.single('resume'), uploadResumeProfile);


module.exports = router;
