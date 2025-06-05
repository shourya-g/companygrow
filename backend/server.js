const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database-connection');
const { auth, requireRole } = require('./middleware/auth');
require('dotenv').config();

// INITIALIZE EXPRESS APP FIRST
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Public Routes (no authentication required)
app.use('/api/auth', authLimiter, require('./routes/auth'));

// Public registration route (no auth required)
app.use('/api/users', require('./routes/users'));

// Debug routes (temporary - remove in production)
if (process.env.NODE_ENV !== 'production') {
  try {
    app.use('/api/debug', require('./routes/debug'));
  } catch (err) {
    console.log('Debug routes not found - skipping');
  }
}

// Protected Routes (authentication required)
app.use('/api/users', auth, require('./routes/users'));
app.use('/api/courses', auth, require('./routes/courses'));
app.use('/api/projects', auth, require('./routes/projects'));

// ENHANCED SKILLS ROUTES - This is the key addition for skill management
app.use('/api/skills', auth, require('./routes/skills'));

// Check if userSkills route exists before using it
try {
  app.use('/api/userSkills', auth, require('./routes/userSkills'));
} catch (err) {
  console.log('UserSkills routes not found - using user-based skill routes instead');
}

app.use('/api/badges', auth, require('./routes/badges'));
app.use('/api/notifications', auth, require('./routes/notifications'));
app.use('/api/payments', auth, require('./routes/payments'));
app.use('/api/userTokens', auth, require('./routes/userTokens'));
app.use('/api/tokenTransactions', auth, require('./routes/tokenTransactions'));

// Admin-only routes
app.use('/api/analytics', auth, require('./routes/analytics'));
app.use('/api/appSettings', auth, requireRole(['admin']), require('./routes/appSettings'));
app.use('/api/performanceReviews', auth, requireRole(['admin', 'manager']), require('./routes/performanceReviews'));

// Optional auth routes (can work with or without auth)
try {
  app.use('/api/courseEnrollments', require('./routes/courseEnrollments'));
  app.use('/api/projectAssignments', require('./routes/projectAssignments'));
  app.use('/api/projectSkills', require('./routes/projectSkills'));
  app.use('/api/courseSkills', require('./routes/courseSkills'));
} catch (err) {
  console.log('Some optional routes not found - continuing without them');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'CompanyGrow API is running with enhanced skill management!', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      skills: 'Enhanced skill management system active',
      userSkills: 'User skill management with proficiency tracking',
      authentication: 'JWT-based authentication',
      authorization: 'Role-based access control'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: {
      message: 'API route not found',
      code: 'ROUTE_NOT_FOUND',
      path: req.originalUrl
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.errors
      }
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: {
        message: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
        field: err.errors[0]?.path
      }
    });
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Referenced resource does not exist',
        code: 'FOREIGN_KEY_ERROR'
      }
    });
  }
  
  // Default error response
  res.status(500).json({ 
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});

// Sync Sequelize models with the database
sequelize.sync().then(() => {
  console.log('✅ Database synced successfully');
  console.log('🚀 Enhanced skill management system loaded');
}).catch(err => {
  console.error('❌ Database sync failed:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  sequelize.close().then(() => {
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Auth enabled on protected routes`);
  console.log(`⚡ Enhanced skill management system active`);
  console.log(`🎯 Available skill endpoints:`);
  console.log(`   - GET /api/skills (with search & filtering)`);
  console.log(`   - POST /api/skills (admin only)`);
  console.log(`   - GET /api/skills/statistics (admin/manager)`);
  console.log(`   - POST /api/skills/bulk-import (admin only)`);
  console.log(`   - GET /api/users/:id/skills (user skill management)`);
});