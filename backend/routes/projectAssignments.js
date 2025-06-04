const express = require('express');
const router = express.Router();
const projectAssignmentController = require('../controllers/projectAssignmentController');
const { auth, requireRole } = require('../middleware/auth');

// @route   GET /api/projectAssignments
// @desc    Get all project assignments
// @access  Private (Admin/Manager)
router.get('/', auth, requireRole(['admin', 'manager']), projectAssignmentController.getAllProjectAssignments);

// @route   GET /api/projectAssignments/:id
// @desc    Get project assignment by ID
// @access  Private
router.get('/:id', auth, projectAssignmentController.getProjectAssignmentById);

// @route   POST /api/projectAssignments
// @desc    Assign user to project
// @access  Private (Admin/Manager)
router.post('/', auth, requireRole(['admin', 'manager']), projectAssignmentController.assignUserToProject);

// @route   PUT /api/projectAssignments/:id
// @desc    Update project assignment
// @access  Private
router.put('/:id', auth, projectAssignmentController.updateProjectAssignment);

// @route   DELETE /api/projectAssignments/:id
// @desc    Remove user from project
// @access  Private (Admin/Manager)
router.delete('/:id', auth, requireRole(['admin', 'manager']), projectAssignmentController.removeUserFromProject);

// @route   GET /api/projectAssignments/user/:userId
// @desc    Get assignments for specific user
// @access  Private
router.get('/user/:userId', auth, projectAssignmentController.getUserAssignments);

// @route   GET /api/projectAssignments/project/:projectId
// @desc    Get assignments for specific project
// @access  Private
router.get('/project/:projectId', auth, projectAssignmentController.getProjectAssignments);

module.exports = router;