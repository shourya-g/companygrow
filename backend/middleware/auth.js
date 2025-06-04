const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          message: 'No token, authorization denied',
          code: 'NO_TOKEN'
        } 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
      
      // Get user from database
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: { 
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          } 
        });
      }

      if (!user.is_active) {
        return res.status(401).json({ 
          success: false, 
          error: { 
            message: 'User account is deactivated',
            code: 'USER_DEACTIVATED'
          } 
        });
      }

      // Add user to request object
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      };
      
      next();
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: { 
            message: 'Token expired',
            code: 'TOKEN_EXPIRED'
          } 
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          error: { 
            message: 'Invalid token',
            code: 'INVALID_TOKEN'
          } 
        });
      } else {
        throw tokenError;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Server error in authentication',
        code: 'AUTH_SERVER_ERROR'
      } 
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    const user = await User.findByPk(decoded.id);
    
    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      };
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

// Role-based auth middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        } 
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        } 
      });
    }

    next();
  };
};

module.exports = { auth, optionalAuth, requireRole };