const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validatePasswordReset 
} = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegistration, userController.registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, userController.loginUser);

// @route   POST /api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post('/reset-password', validatePasswordReset, userController.resetPassword);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, userController.getCurrentUser);

// @route   GET /api/auth/verify
// @desc    Verify token
// @access  Private
router.get('/verify', auth, userController.verifyToken);

module.exports = router;