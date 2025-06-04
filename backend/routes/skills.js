const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { auth, requireRole } = require('../middleware/auth');

// @route   GET /api/skills
// @desc    Get all skills with filtering and search
// @access  Private
router.get('/', auth, skillController.getAllSkills);

// @route   GET /api/skills/search
// @desc    Search skills with suggestions
// @access  Private
router.get('/search', auth, skillController.searchSkills);

// @route   GET /api/skills/categories
// @desc    Get skill categories with counts
// @access  Private
router.get('/categories', auth, skillController.getSkillCategories);

// @route   GET /api/skills/statistics
// @desc    Get skill usage statistics
// @access  Private (Admin/Manager only)
router.get('/statistics', auth, requireRole(['admin', 'manager']), skillController.getSkillStatistics);

// @route   POST /api/skills/bulk-import
// @desc    Bulk import skills
// @access  Private (Admin only)
router.post('/bulk-import', auth, requireRole(['admin']), skillController.bulkImportSkills);

// @route   GET /api/skills/:id
// @desc    Get skill by ID with optional related data
// @access  Private
router.get('/:id', auth, skillController.getSkillById);

// @route   POST /api/skills
// @desc    Create new skill
// @access  Private (Admin only)
router.post('/', auth, requireRole(['admin']), skillController.createSkill);

// @route   PUT /api/skills/:id
// @desc    Update skill
// @access  Private (Admin only)
router.put('/:id', auth, requireRole(['admin']), skillController.updateSkill);

// @route   DELETE /api/skills/:id
// @desc    Delete skill
// @access  Private (Admin only)
router.delete('/:id', auth, requireRole(['admin']), skillController.deleteSkill);

module.exports = router;