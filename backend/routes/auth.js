const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', userController.registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', userController.loginUser);

module.exports = router;
