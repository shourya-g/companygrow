const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/dashboard - Dashboard overview (available to all authenticated users)
router.get('/dashboard', analyticsController.getDashboardOverview);

// GET /api/analytics/users - User statistics (admin/manager only)
router.get('/users', (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.json({ 
      success: true, 
      data: { 
        totalUsers: 'N/A', 
        activeUsers: 'N/A',
        message: 'Access restricted to admins and managers'
      } 
    });
  }
  analyticsController.getUserStats(req, res);
});

// GET /api/analytics/projects - Project statistics (admin/manager only)
router.get('/projects', (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.json({ 
      success: true, 
      data: { 
        totalProjects: 'N/A', 
        activeProjects: 'N/A',
        completedProjects: 'N/A',
        message: 'Access restricted to admins and managers'
      } 
    });
  }
  analyticsController.getProjectStats(req, res);
});

// GET /api/analytics/skills - Skill distribution (available to all users)
router.get('/skills', analyticsController.getSkillDistribution);

// GET /api/analytics/courses - Course statistics (available to all users)
router.get('/courses', analyticsController.getCourseStats);

// GET /api/analytics/payments - Payment statistics (admin only)
router.get('/payments', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: { 
        message: 'Admin access required for payment statistics',
        code: 'ADMIN_REQUIRED'
      } 
    });
  }
  analyticsController.getPaymentStats(req, res);
});

// GET /api/analytics/tokens - Token transaction statistics (admin only)
router.get('/tokens', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: { 
        message: 'Admin access required for token statistics',
        code: 'ADMIN_REQUIRED'
      } 
    });
  }
  analyticsController.getTokenStats(req, res);
});

module.exports = router;