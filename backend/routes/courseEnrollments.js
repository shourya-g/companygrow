const express = require('express');
const router = express.Router();
const courseEnrollmentController = require('../controllers/courseEnrollmentController');
const { auth, requireRole } = require('../middleware/auth');

// @route   GET /api/courseEnrollments
// @desc    Get all course enrollments
// @access  Private (Admin/Manager)
router.get('/', auth, requireRole(['admin', 'manager']), courseEnrollmentController.getAllCourseEnrollments);

// @route   GET /api/courseEnrollments/:id
// @desc    Get course enrollment by ID
// @access  Private
router.get('/:id', auth, courseEnrollmentController.getCourseEnrollmentById);

// @route   POST /api/courseEnrollments
// @desc    Enroll user in course
// @access  Private
router.post('/', auth, courseEnrollmentController.enrollInCourse);

// @route   PUT /api/courseEnrollments/:id/progress
// @desc    Update course progress
// @access  Private
router.put('/:id/progress', auth, courseEnrollmentController.updateProgress);

// @route   GET /api/courseEnrollments/user/:userId
// @desc    Get enrollments for specific user
// @access  Private
router.get('/user/:userId', auth, courseEnrollmentController.getUserEnrollments);

// @route   DELETE /api/courseEnrollments/:id
// @desc    Unenroll from course
// @access  Private
router.delete('/:id', auth, courseEnrollmentController.unenrollFromCourse);

module.exports = router;