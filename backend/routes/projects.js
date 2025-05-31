const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// GET /api/projects - Get all projects
router.get('/', projectController.getAllProjects);
// GET /api/projects/:id - Get project by ID
router.get('/:id', projectController.getProjectById);
// POST /api/projects - Create new project
router.post('/', projectController.createProject);
// PUT /api/projects/:id - Update project
router.put('/:id', projectController.updateProject);
// DELETE /api/projects/:id - Delete project
router.delete('/:id', projectController.deleteProject);

module.exports = router;
