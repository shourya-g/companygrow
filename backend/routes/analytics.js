const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/users - User statistics
router.get('/users', analyticsController.getUserStats);

// GET /api/analytics/projects - Project statistics
router.get('/projects', analyticsController.getProjectStats);

// GET /api/analytics/skills - Skill distribution
router.get('/skills', analyticsController.getSkillDistribution);

// GET /api/analytics/courses - Course statistics
router.get('/courses', analyticsController.getCourseStats);

// GET /api/analytics/payments - Payment statistics
router.get('/payments', analyticsController.getPaymentStats);

// GET /api/analytics/tokens - Token transaction statistics
router.get('/tokens', analyticsController.getTokenStats);

// GET /api/analytics/badges - Badge statistics
router.get('/badges', analyticsController.getBadgeStats);

// GET /api/analytics/report - Comprehensive analytics report
router.get('/report', analyticsController.getComprehensiveReport);

module.exports = router;