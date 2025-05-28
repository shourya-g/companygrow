const express = require('express');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - Coming soon!' });
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - Coming soon!' });
});

module.exports = router;
