const express = require('express');
const router = express.Router();

// Test endpoint to check if API is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    const { User } = require('../models');
    const userCount = await User.count();
    res.json({
      success: true,
      message: 'Database connection working!',
      userCount
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Test registration with minimal data
router.post('/test-register', async (req, res) => {
  try {
    console.log('Test registration request body:', req.body);
    
    const { User } = require('../models');
    const bcrypt = require('bcryptjs');
    
    const { email, password, first_name, last_name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      first_name,
      last_name,
      role: 'employee',
      is_active: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Test registration successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error('Test registration error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;