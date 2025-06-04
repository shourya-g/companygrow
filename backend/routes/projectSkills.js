const express = require('express');
const router = express.Router();
const projectSkillController = require('../controllers/projectSkillController');
const { auth, requireRole } = require('../middleware/auth');

// @route   GET /api/projectSkills
// @desc    Get all project skills
// @access  Private (Admin/Manager)
router.get('/', auth, requireRole(['admin', 'manager']), projectSkillController.getAllProjectSkills);

// @route   GET /api/projectSkills/:id
// @desc    Get project skill by ID
// @access  Private
router.get('/:id', auth, projectSkillController.getProjectSkillById);

// @route   POST /api/projectSkills
// @desc    Add skill requirement to project
// @access  Private (Admin/Manager)
router.post('/', auth, requireRole(['admin', 'manager']), projectSkillController.addSkillToProject);

// @route   PUT /api/projectSkills/:id
// @desc    Update project skill requirement
// @access  Private (Admin/Manager)
router.put('/:id', auth, requireRole(['admin', 'manager']), projectSkillController.updateProjectSkill);

// @route   DELETE /api/projectSkills/:id
// @desc    Remove skill requirement from project
// @access  Private (Admin/Manager)
router.delete('/:id', auth, requireRole(['admin', 'manager']), projectSkillController.removeSkillFromProject);

// @route   GET /api/projectSkills/project/:projectId
// @desc    Get skill requirements for specific project
// @access  Private
router.get('/project/:projectId', auth, projectSkillController.getProjectSkills);

// @route   GET /api/projectSkills/skill/:skillId
// @desc    Get projects that require specific skill
// @access  Private
router.get('/skill/:skillId', auth, projectSkillController.getSkillProjects);

// @route   GET /api/projectSkills/analysis/:projectId
// @desc    Get skill match analysis for project
// @access  Private (Admin/Manager)
router.get('/analysis/:projectId', auth, requireRole(['admin', 'manager']), projectSkillController.getProjectSkillAnalysis);

module.exports = router;