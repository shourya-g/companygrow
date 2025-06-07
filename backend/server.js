const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database-connection');
const { auth, optionalAuth, requireRole } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));


// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 5 requests per windowMs for auth
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
app.use('/api/projects', auth, require('./routes/projects'));
app.use('/api/userSkills', auth, require('./routes/userSkills'));
app.use('/api/notifications', auth, require('./routes/notifications'));
app.use('/api/payments', auth, require('./routes/payments'));
app.use('/api/userTokens', auth, require('./routes/userTokens'));
app.use('/api/tokenTransactions', auth, require('./routes/tokenTransactions'));
app.use('/api/projectAssignments', auth, require('./routes/projectAssignments'));

// Routes with optional authentication (can work with or without auth)
app.use('/api/courses', optionalAuth, require('./routes/courses'));
app.use('/api/skills', optionalAuth, require('./routes/skills'));
app.use('/api/badges', optionalAuth, require('./routes/badges'));

// Admin-only routes
app.use('/api/analytics', auth, requireRole(['admin', 'manager']), require('./routes/analytics'));
app.use('/api/appSettings', auth, requireRole(['admin']), require('./routes/appSettings'));
app.use('/api/performanceReviews', auth, requireRole(['admin', 'manager']), require('./routes/performanceReviews'));

// Optional auth routes (can work with or without auth)
try {
  app.use('/api/courseEnrollments', require('./routes/courseEnrollments'));
} catch (err) {
  console.log('Course enrollments routes not found - skipping');
}

try {
  app.use('/api/projectSkills', require('./routes/projectSkills'));
} catch (err) {
  console.log('Project skills routes not found - skipping');
}

try {
  app.use('/api/courseSkills', require('./routes/courseSkills'));
} catch (err) {
  console.log('Course skills routes not found - skipping');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'CompanyGrow API is running!', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
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
});