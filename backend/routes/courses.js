const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const courseEnrollmentController = require('../controllers/courseEnrollmentController');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');

// Public/Optional Auth Routes
// @route   GET /api/courses
// @desc    Get all courses with filtering and search
// @access  Public (but enhanced data if authenticated)
router.get('/', optionalAuth, courseController.getAllCourses);

// @route   GET /api/courses/categories
// @desc    Get all course categories
// @access  Public
router.get('/categories', courseController.getCourseCategories);

// @route   GET /api/courses/:id
// @desc    Get course by ID with detailed information
// @access  Public (but enhanced data if authenticated)
router.get('/:id', optionalAuth, courseController.getCourseById);

// Protected Routes
// @route   GET /api/courses/recommendations/me
// @desc    Get course recommendations for current user
// @access  Private
router.get('/recommendations/me', auth, courseController.getCourseRecommendations);

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    // Set course_id from URL parameter
    req.body.course_id = req.params.id;
    req.body.user_id = req.user.id;
    
    return courseEnrollmentController.enrollInCourse(req, res);
  } catch (err) {
    console.error('Course enrollment error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to enroll in course',
        code: 'ENROLLMENT_ERROR'
      }
    });
  }
});

// @route   DELETE /api/courses/:id/unenroll
// @desc    Unenroll from a course
// @access  Private
router.delete('/:id/unenroll', auth, async (req, res) => {
  try {
    const { CourseEnrollment } = require('../models');
    
    const enrollment = await CourseEnrollment.findOne({
      where: { 
        course_id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Enrollment not found',
          code: 'ENROLLMENT_NOT_FOUND'
        }
      });
    }

    // Update request params for the controller
    req.params.id = enrollment.id;
    
    return courseEnrollmentController.unenrollFromCourse(req, res);
  } catch (err) {
    console.error('Course unenrollment error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to unenroll from course',
        code: 'UNENROLLMENT_ERROR'
      }
    });
  }
});

// @route   PUT /api/courses/:id/progress
// @desc    Update course progress
// @access  Private
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { CourseEnrollment } = require('../models');
    
    const enrollment = await CourseEnrollment.findOne({
      where: { 
        course_id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Enrollment not found',
          code: 'ENROLLMENT_NOT_FOUND'
        }
      });
    }

    // Update request params for the controller
    req.params.id = enrollment.id;
    
    return courseEnrollmentController.updateProgress(req, res);
  } catch (err) {
    console.error('Course progress update error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update course progress',
        code: 'PROGRESS_UPDATE_ERROR'
      }
    });
  }
});

// Admin/Manager Routes
// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Admin/Manager)
router.post('/', auth, requireRole(['admin', 'manager']), courseController.createCourse);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Admin/Manager/Creator)
router.put('/:id', auth, courseController.updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Admin/Manager/Creator)
router.delete('/:id', auth, courseController.deleteCourse);

// @route   GET /api/courses/:id/enrollments
// @desc    Get enrollments for a specific course
// @access  Private (Admin/Manager)
router.get('/:id/enrollments', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { CourseEnrollment, User } = require('../models');
    
    const enrollments = await CourseEnrollment.findAll({
      where: { course_id: req.params.id },
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email', 'department']
        }
      ],
      order: [['enrollment_date', 'DESC']]
    });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (err) {
    console.error('Get course enrollments error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch course enrollments',
        code: 'FETCH_ENROLLMENTS_ERROR'
      }
    });
  }
});

// @route   GET /api/courses/:id/stats
// @desc    Get detailed course statistics
// @access  Private (Admin/Manager)
router.get('/:id/stats', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { Course, CourseEnrollment, User } = require('../models');
    const { Op } = require('sequelize');
    
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Course not found',
          code: 'COURSE_NOT_FOUND'
        }
      });
    }

    // Get enrollment statistics
    const totalEnrollments = await CourseEnrollment.count({
      where: { course_id: req.params.id }
    });

    const completedEnrollments = await CourseEnrollment.count({
      where: { 
        course_id: req.params.id,
        status: 'completed'
      }
    });

    const inProgressEnrollments = await CourseEnrollment.count({
      where: { 
        course_id: req.params.id,
        status: 'in_progress'
      }
    });

    const droppedEnrollments = await CourseEnrollment.count({
      where: { 
        course_id: req.params.id,
        status: 'dropped'
      }
    });

    // Get average progress
    const avgProgress = await CourseEnrollment.findOne({
      where: { course_id: req.params.id },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('progress_percentage')), 'avg_progress']
      ],
      raw: true
    });

    // Get enrollments by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentsByMonth = await CourseEnrollment.findAll({
      where: { 
        course_id: req.params.id,
        enrollment_date: { [Op.gte]: sixMonthsAgo }
      },
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('enrollment_date')), 'month'],
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('enrollment_date'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('enrollment_date')), 'ASC']],
      raw: true
    });

    const stats = {
      course_info: {
        id: course.id,
        title: course.title,
        category: course.category,
        difficulty_level: course.difficulty_level,
        duration_hours: course.duration_hours,
        price: course.price
      },
      enrollment_stats: {
        total_enrollments: totalEnrollments,
        completed: completedEnrollments,
        in_progress: inProgressEnrollments,
        dropped: droppedEnrollments,
        completion_rate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
        drop_rate: totalEnrollments > 0 ? Math.round((droppedEnrollments / totalEnrollments) * 100) : 0
      },
      progress_stats: {
        average_progress: avgProgress ? Math.round(avgProgress.avg_progress || 0) : 0
      },
      enrollment_trend: enrollmentsByMonth
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Get course stats error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch course statistics',
        code: 'FETCH_STATS_ERROR'
      }
    });
  }
});

module.exports = router;