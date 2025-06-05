const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// GET /api/courses - Get all courses
router.get('/', courseController.getAllCourses);

// GET /api/courses/popular - Get popular courses (must be before /:id route)
router.get('/popular', courseController.getPopularCourses);

// GET /api/courses/recommended - Get recommended courses
router.get('/recommended', courseController.getRecommendedCourses);

// GET /api/courses/recent - Get recent courses
router.get('/recent', courseController.getRecentCourses);

// GET /api/courses/:id - Get course by ID
router.get('/:id', courseController.getCourseById);

// POST /api/courses - Create new course (admin/manager only)
router.post('/', courseController.createCourse);

// PUT /api/courses/:id - Update course
router.put('/:id', courseController.updateCourse);

// DELETE /api/courses/:id - Delete course
router.delete('/:id', courseController.deleteCourse);

module.exports = router;