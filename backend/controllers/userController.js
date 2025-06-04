const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRE }
  );
};

// Format user data for response (remove sensitive fields)
const formatUser = (user) => {
  const userObj = user.toJSON ? user.toJSON() : user;
  delete userObj.password;
  return userObj;
};

module.exports = {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        order: [['created_at', 'DESC']]
      });
      res.json({ 
        success: true, 
        data: users.map(formatUser),
        count: users.length 
      });
    } catch (err) {
      console.error('Get all users error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch users',
          code: 'FETCH_USERS_ERROR'
        } 
      });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await User.scope(null).findByPk(req.params.id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          } 
        });
      }

      res.json({ 
        success: true, 
        data: formatUser(user) 
      });
    } catch (err) {
      console.error('Get user by ID error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch user',
          code: 'FETCH_USER_ERROR'
        } 
      });
    }
  },

  // Register new user
  async registerUser(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.array()
          }
        });
      }

      const { email, password, first_name, last_name, department, position } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          error: { 
            message: 'Email already registered',
            code: 'EMAIL_EXISTS'
          } 
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        email: email.toLowerCase(),
        password: hashedPassword,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: 'employee', // Default role
        is_active: true
      };

      // Add optional fields
      if (department) userData.department = department.trim();
      if (position) userData.position = position.trim();

      const user = await User.create(userData);

      // Generate token
      const token = generateToken(user);

      // Update last login
      await user.update({ last_login: new Date() });

      res.status(201).json({ 
        success: true,
        message: 'User registered successfully',
        data: {
          user: formatUser(user),
          token
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Registration failed',
          code: 'REGISTRATION_ERROR'
        } 
      });
    }
  },

  // Login user
  async loginUser(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.array()
          }
        });
      }

      const { email, password } = req.body;

      // Find user with password field
      const user = await User.scope(null).findOne({ 
        where: { email: email.toLowerCase() } 
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: { 
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
          } 
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({ 
          success: false, 
          error: { 
            message: 'Account is deactivated',
            code: 'ACCOUNT_DEACTIVATED'
          } 
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          error: { 
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
          } 
        });
      }

      // Generate token
      const token = generateToken(user);

      // Update last login
      await user.update({ last_login: new Date() });

      res.json({ 
        success: true,
        message: 'Login successful',
        data: {
          user: formatUser(user),
          token
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Login failed',
          code: 'LOGIN_ERROR'
        } 
      });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      
      // Check if user can update this profile
      if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({ 
          success: false, 
          error: { 
            message: 'Cannot update other user profiles',
            code: 'UNAUTHORIZED_UPDATE'
          } 
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          } 
        });
      }

      const { password, email, role, ...updateData } = req.body;

      // Handle password update
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ 
            success: false, 
            error: { 
              message: 'Password must be at least 6 characters',
              code: 'WEAK_PASSWORD'
            } 
          });
        }
        updateData.password = await bcrypt.hash(password, 12);
      }

      // Handle email update (check for duplicates)
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ 
          where: { 
            email: email.toLowerCase(),
            id: { [require('sequelize').Op.ne]: userId }
          } 
        });
        if (existingUser) {
          return res.status(409).json({ 
            success: false, 
            error: { 
              message: 'Email already in use',
              code: 'EMAIL_EXISTS'
            } 
          });
        }
        updateData.email = email.toLowerCase();
      }

      // Only admins can update roles
      if (role && req.user.role === 'admin') {
        updateData.role = role;
      }

      // Trim string fields
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'string') {
          updateData[key] = updateData[key].trim();
        }
      });

      await user.update(updateData);
      
      res.json({ 
        success: true,
        message: 'User updated successfully',
        data: formatUser(user) 
      });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to update user',
          code: 'UPDATE_USER_ERROR'
        } 
      });
    }
  },

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          } 
        });
      }

      // Prevent self-deletion
      if (req.user.id === parseInt(req.params.id)) {
        return res.status(400).json({ 
          success: false, 
          error: { 
            message: 'Cannot delete your own account',
            code: 'SELF_DELETE_FORBIDDEN'
          } 
        });
      }

      await user.destroy();
      
      res.json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to delete user',
          code: 'DELETE_USER_ERROR'
        } 
      });
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          error: { 
            message: 'Email and new password are required',
            code: 'MISSING_FIELDS'
          } 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          error: { 
            message: 'Password must be at least 6 characters',
            code: 'WEAK_PASSWORD'
          } 
        });
      }

      const user = await User.scope(null).findOne({ 
        where: { email: email.toLowerCase() } 
      });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          } 
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await user.update({ password: hashedPassword });

      res.json({ 
        success: true, 
        message: 'Password reset successful' 
      });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Password reset failed',
          code: 'RESET_PASSWORD_ERROR'
        } 
      });
    }
  },

  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          } 
        });
      }

      res.json({ 
        success: true, 
        data: formatUser(user) 
      });
    } catch (err) {
      console.error('Get current user error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch current user',
          code: 'FETCH_CURRENT_USER_ERROR'
        } 
      });
    }
  },

  // Verify token
  async verifyToken(req, res) {
    try {
      res.json({ 
        success: true, 
        message: 'Token is valid',
        data: {
          user: req.user
        }
      });
    } catch (err) {
      console.error('Verify token error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Token verification failed',
          code: 'TOKEN_VERIFICATION_ERROR'
        } 
      });
    }
  }
};