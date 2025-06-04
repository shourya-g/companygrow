const express = require('express');
const router = express.Router();
const courseSkillController = require('../controllers/courseSkillController');
const { auth, requireRole } = require('../middleware/auth');

// @route   GET /api/courseSkills
// @desc    Get all course skills
// @access  Private
router.get('/', auth, courseSkillController.getAllCourseSkills);

// @route   GET /api/courseSkills/:id
// @desc    Get course skill by ID
// @access  Private
router.get('/:id', auth, courseSkillController.getCourseSkillById);

// @route   POST /api/courseSkills
// @desc    Add skill to course
// @access  Private (Admin/Manager)
router.post('/', auth, requireRole(['admin', 'manager']), courseSkillController.addSkillToCourse);

// @route   PUT /api/courseSkills/:id
// @desc    Update course skill
// @access  Private (Admin/Manager)
router.put('/:id', auth, requireRole(['admin', 'manager']), courseSkillController.updateCourseSkill);

// @route   DELETE /api/courseSkills/:id
// @desc    Remove skill from course
// @access  Private (Admin/Manager)
router.delete('/:id', auth, requireRole(['admin', 'manager']), courseSkillController.removeSkillFromCourse);

// @route   GET /api/courseSkills/course/:courseId
// @desc    Get skills for specific course
// @access  Private
router.get('/course/:courseId', auth, courseSkillController.getCourseSkills);

// @route   GET /api/courseSkills/skill/:skillId
// @desc    Get courses that teach specific skill
// @access  Private
router.get('/skill/:skillId', auth, courseSkillController.getSkillCourses);

module.exports = router;