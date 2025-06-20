const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { auth, requireRole } = require('../middleware/auth');

// @route   GET /api/leaderboard
// @desc    Get main leaderboard (all periods)
// @access  Private
router.get('/', auth, leaderboardController.getLeaderboard);

// @route   GET /api/leaderboard/stats
// @desc    Get leaderboard statistics and insights
// @access  Private
router.get('/stats', auth, leaderboardController.getLeaderboardStats);

// @route   GET /api/leaderboard/activity
// @desc    Get recent leaderboard activity
// @access  Private
router.get('/activity', auth, leaderboardController.getRecentActivity);

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user's position on leaderboard
// @access  Private
router.get('/user/:userId', auth, leaderboardController.getUserPosition);

// @route   GET /api/leaderboard/user/:userId/achievements
// @desc    Get user's achievements
// @access  Private
router.get('/user/:userId/achievements', auth, leaderboardController.getUserAchievements);

// @route   GET /api/leaderboard/department/:department
// @desc    Get department-specific leaderboard
// @access  Private
router.get('/department/:department', auth, leaderboardController.getDepartmentLeaderboard);

// @route   POST /api/leaderboard/award
// @desc    Manually award points to a user
// @access  Private (Admin/Manager only)
router.post('/award', auth, requireRole(['admin', 'manager']), leaderboardController.awardPoints);

module.exports = router;