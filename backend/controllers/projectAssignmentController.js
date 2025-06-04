const { ProjectAssignment, Project, User } = require('../models');

module.exports = {
  // Get all project assignments
  async getAllProjectAssignments(req, res) {
    try {
      const assignments = await ProjectAssignment.findAll({
        include: [
          { model: Project, attributes: ['id', 'name', 'status', 'priority'] },
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({ 
        success: true, 
        data: assignments 
      });
    } catch (err) {
      console.error('Get all project assignments error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch project assignments',
          code: 'FETCH_ASSIGNMENTS_ERROR'
        } 
      });
    }
  },

  // Get project assignment by ID
  async getProjectAssignmentById(req, res) {
    try {
      const assignment = await ProjectAssignment.findByPk(req.params.id, {
        include: [
          { model: Project },
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });
      
      if (!assignment) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'Project assignment not found',
            code: 'ASSIGNMENT_NOT_FOUND'
          } 
        });
      }
      
      res.json({ 
        success: true, 
        data: assignment 
      });
    } catch (err) {
      console.error('Get project assignment by ID error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch project assignment',
          code: 'FETCH_ASSIGNMENT_ERROR'
        } 
      });
    }
  },

  // Assign user to project
  async assignUserToProject(req, res) {
    try {
      const { project_id, user_id, role, hours_allocated, hourly_rate } = req.body;
      
      // Only admins and managers can assign users to projects
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can assign users to projects',
            code: 'UNAUTHORIZED_ASSIGNMENT'
          }
        });
      }
      
      if (!project_id || !user_id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Project ID and User ID are required',
            code: 'MISSING_REQUIRED_FIELDS'
          }
        });
      }
      
      // Check if project exists
      const project = await Project.findByPk(project_id);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found',
            code: 'PROJECT_NOT_FOUND'
          }
        });
      }
      
      // Check if user exists
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
      }
      
      // Check if user is already assigned to this project
      const existingAssignment = await ProjectAssignment.findOne({
        where: { user_id, project_id }
      });
      
      if (existingAssignment) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'User is already assigned to this project',
            code: 'ALREADY_ASSIGNED'
          }
        });
      }
      
      // Validate hourly rate if provided
      if (hourly_rate && (hourly_rate < 0 || hourly_rate > 1000)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Hourly rate must be between 0 and 1000',
            code: 'INVALID_HOURLY_RATE'
          }
        });
      }
      
      // Validate hours allocated if provided
      if (hours_allocated && (hours_allocated < 0 || hours_allocated > 1000)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Hours allocated must be between 0 and 1000',
            code: 'INVALID_HOURS_ALLOCATED'
          }
        });
      }
      
      // Create assignment
      const assignment = await ProjectAssignment.create({
        user_id,
        project_id,
        role: role || 'Team Member',
        hours_allocated: hours_allocated || 0,
        hourly_rate: hourly_rate || 0,
        status: 'active',
        assignment_date: new Date()
      });
      
      // Fetch the created assignment with related data
      const createdAssignment = await ProjectAssignment.findByPk(assignment.id, {
        include: [
          { model: Project },
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'User successfully assigned to project',
        data: createdAssignment
      });
    } catch (err) {
      console.error('Assign user to project error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to assign user to project',
          code: 'ASSIGNMENT_ERROR'
        }
      });
    }
  },

  // Update project assignment
  async updateProjectAssignment(req, res) {
    try {
      const { id } = req.params;
      const { role, hours_allocated, hours_worked, hourly_rate, status, performance_rating, feedback } = req.body;
      
      const assignment = await ProjectAssignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project assignment not found',
            code: 'ASSIGNMENT_NOT_FOUND'
          }
        });
      }
      
      // Check permissions
      const isOwnAssignment = req.user.id === assignment.user_id;
      const isAuthorized = ['admin', 'manager'].includes(req.user.role) || isOwnAssignment;
      
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot update other user assignments',
            code: 'UNAUTHORIZED_UPDATE'
          }
        });
      }
      
      const updateData = {};
      
      // Only managers/admins can update these fields
      if (['admin', 'manager'].includes(req.user.role)) {
        if (role) updateData.role = role;
        if (hours_allocated !== undefined) {
          if (hours_allocated < 0 || hours_allocated > 1000) {
            return res.status(400).json({
              success: false,
              error: {
                message: 'Hours allocated must be between 0 and 1000',
                code: 'INVALID_HOURS_ALLOCATED'
              }
            });
          }
          updateData.hours_allocated = hours_allocated;
        }
        if (hourly_rate !== undefined) {
          if (hourly_rate < 0 || hourly_rate > 1000) {
            return res.status(400).json({
              success: false,
              error: {
                message: 'Hourly rate must be between 0 and 1000',
                code: 'INVALID_HOURLY_RATE'
              }
            });
          }
          updateData.hourly_rate = hourly_rate;
        }
        if (status) {
          const validStatuses = ['active', 'completed', 'removed'];
          if (!validStatuses.includes(status)) {
            return res.status(400).json({
              success: false,
              error: {
                message: `Status must be one of: ${validStatuses.join(', ')}`,
                code: 'INVALID_STATUS'
              }
            });
          }
          updateData.status = status;
        }
        if (performance_rating !== undefined) {
          if (performance_rating < 1 || performance_rating > 5) {
            return res.status(400).json({
              success: false,
              error: {
                message: 'Performance rating must be between 1 and 5',
                code: 'INVALID_PERFORMANCE_RATING'
              }
            });
          }
          updateData.performance_rating = performance_rating;
        }
        if (feedback) updateData.feedback = feedback;
      }
      
      // Users can update their own hours worked
      if (hours_worked !== undefined && isOwnAssignment) {
        if (hours_worked < 0 || hours_worked > 1000) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Hours worked must be between 0 and 1000',
              code: 'INVALID_HOURS_WORKED'
            }
          });
        }
        updateData.hours_worked = hours_worked;
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No valid fields to update',
            code: 'NO_UPDATE_FIELDS'
          }
        });
      }
      
      await assignment.update(updateData);
      
      // Fetch updated assignment with related data
      const updatedAssignment = await ProjectAssignment.findByPk(id, {
        include: [
          { model: Project },
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });
      
      res.json({
        success: true,
        message: 'Project assignment updated successfully',
        data: updatedAssignment
      });
    } catch (err) {
      console.error('Update project assignment error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update project assignment',
          code: 'UPDATE_ASSIGNMENT_ERROR'
        }
      });
    }
  },

  // Remove user from project
  async removeUserFromProject(req, res) {
    try {
      const { id } = req.params;
      
      // Only admins and managers can remove users from projects
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can remove users from projects',
            code: 'UNAUTHORIZED_REMOVAL'
          }
        });
      }
      
      const assignment = await ProjectAssignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project assignment not found',
            code: 'ASSIGNMENT_NOT_FOUND'
          }
        });
      }
      
      await assignment.destroy();
      
      res.json({
        success: true,
        message: 'User successfully removed from project'
      });
    } catch (err) {
      console.error('Remove user from project error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to remove user from project',
          code: 'REMOVAL_ERROR'
        }
      });
    }
  },

  // Get assignments for a specific user
  async getUserAssignments(req, res) {
    try {
      const { userId } = req.params;
      
      // Check if user can view these assignments
      if (req.user.id !== parseInt(userId) && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot view other user assignments',
            code: 'UNAUTHORIZED_VIEW'
          }
        });
      }
      
      const assignments = await ProjectAssignment.findAll({
        where: { user_id: userId },
        include: [
          { model: Project }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: assignments
      });
    } catch (err) {
      console.error('Get user assignments error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch user assignments',
          code: 'FETCH_USER_ASSIGNMENTS_ERROR'
        }
      });
    }
  },

  // Get assignments for a specific project
  async getProjectAssignments(req, res) {
    try {
      const { projectId } = req.params;
      
      const assignments = await ProjectAssignment.findAll({
        where: { project_id: projectId },
        include: [
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: assignments
      });
    } catch (err) {
      console.error('Get project assignments error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch project assignments',
          code: 'FETCH_PROJECT_ASSIGNMENTS_ERROR'
        }
      });
    }
  }
};