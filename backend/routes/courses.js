const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Real course routes using the new controller
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
// ...other course routes (create, update, delete, search, etc.)

module.exports = router;
