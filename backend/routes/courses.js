const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth, requireRole, optionalAuth } = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses with filtering and search
// @access  Public (with optional auth for personalized results)
router.get('/', optionalAuth, courseController.getAllCourses);

// @route   GET /api/courses/categories
// @desc    Get all course categories
// @access  Public
router.get('/categories', courseController.getCourseCategories);

// @route   GET /api/courses/popular
// @desc    Get popular courses
// @access  Public
router.get('/popular', courseController.getPopularCourses);

// @route   GET /api/courses/recommended
// @desc    Get recommended courses for current user
// @access  Private
router.get('/recommended', auth, courseController.getRecommendedCourses);

// @route   GET /api/courses/:id
// @desc    Get course by ID with detailed information
// @access  Public (with optional auth for enrollment status)
router.get('/:id', optionalAuth, courseController.getCourseById);

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Admin/Manager)
router.post('/', auth, requireRole(['admin', 'manager']), courseController.createCourse);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Creator/Admin/Manager)
router.put('/:id', auth, courseController.updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course (only if no enrollments)
// @access  Private (Creator/Admin/Manager)
router.delete('/:id', auth, courseController.deleteCourse);

// @route   PATCH /api/courses/:id/status
// @desc    Toggle course active status
// @access  Private (Admin/Manager)
router.patch('/:id/status', auth, requireRole(['admin', 'manager']), courseController.toggleCourseStatus);

module.exports = router;