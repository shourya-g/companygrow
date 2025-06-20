const Project = require('../models/project');

// GET /api/projects - Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// GET /api/projects/:id - Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// POST /api/projects - Create new project
exports.createProject = async (req, res) => {
  try {
    // Check Content-Type header
    if (req.headers['content-type'] !== 'application/json') {
      return res.status(415).json({
        success: false,
        error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' },
      });
    }

    // Validate request body
    const { name, description, startDate, endDate } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Project name is required and must be a string' },
      });
    }
    if (description && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Description must be a string' },
      });
    }
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid start date format' },
      });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid end date format' },
      });
    }

    // Create project
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: err.message },
    });
  }
};

// PUT /api/projects/:id - Update project
exports.updateProject = async (req, res) => {
  try {
    const [updated] = await Project.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    const project = await Project.findByPk(req.params.id);
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
  }
};

// DELETE /api/projects/:id - Delete project
exports.deleteProject = async (req, res) => {
  try {
    const deleted = await Project.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
