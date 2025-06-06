const { ProjectAssignment, Project, User, Skill, UserSkill, ProjectSkill } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Get all project assignments
  async getAllProjectAssignments(req, res) {
    try {
      const assignments = await ProjectAssignment.findAll({
        include: [
          { 
            model: Project, 
            attributes: ['id', 'name', 'status', 'priority', 'start_date', 'end_date'],
            include: [
              {
                model: User,
                as: 'manager',
                attributes: ['id', 'first_name', 'last_name']
              }
            ]
          },
          { 
            model: User, 
            attributes: ['id', 'first_name', 'last_name', 'email', 'department', 'position'] 
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({ 
        success: true, 
        data: assignments,
        count: assignments.length
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
          { 
            model: Project,
            include: [
              {
                model: Skill,
                through: { 
                  attributes: ['required_level', 'is_mandatory'] 
                }
              }
            ]
          },
          { 
            model: User, 
            attributes: ['id', 'first_name', 'last_name', 'email', 'department', 'position'],
            include: [
              {
                model: Skill,
                through: { 
                  attributes: ['proficiency_level', 'years_experience', 'is_verified'] 
                }
              }
            ]
          }
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

  // Get skill-based assignment recommendations
  async getAssignmentRecommendations(req, res) {
    try {
      const { projectId } = req.params;
      
      // Only admins and managers can view recommendations
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can view assignment recommendations',
            code: 'UNAUTHORIZED_RECOMMENDATIONS'
          }
        });
      }

      // Get project with required skills
      const project = await Project.findByPk(projectId, {
        include: [
          {
            model: Skill,
            through: { 
              attributes: ['required_level', 'is_mandatory'] 
            }
          }
        ]
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found',
            code: 'PROJECT_NOT_FOUND'
          }
        });
      }

      // Get all active users with their skills
      const users = await User.findAll({
        where: { is_active: true },
        include: [
          {
            model: Skill,
            through: { 
              attributes: ['proficiency_level', 'years_experience', 'is_verified'] 
            }
          },
          {
            model: ProjectAssignment,
            where: { status: 'active' },
            required: false,
            include: [
              {
                model: Project,
                attributes: ['id', 'name', 'priority']
              }
            ]
          }
        ]
      });

      // Get users already assigned to this project
      const existingAssignments = await ProjectAssignment.findAll({
        where: { project_id: projectId, status: 'active' },
        attributes: ['user_id']
      });
      const assignedUserIds = existingAssignments.map(a => a.user_id);

      // Calculate skill match for each unassigned user
      const recommendations = users
        .filter(user => !assignedUserIds.includes(user.id))
        .map(user => {
          const userSkills = user.Skills || [];
          const projectSkills = project.Skills || [];
          
          let totalMatch = 0;
          let mandatoryMatch = 0;
          let mandatoryCount = 0;
          let optionalMatch = 0;
          let optionalCount = 0;
          const skillGaps = [];
          const skillStrengths = [];

          projectSkills.forEach(projectSkill => {
            const userSkill = userSkills.find(us => us.id === projectSkill.id);
            const requiredLevel = projectSkill.ProjectSkill.required_level;
            const isMandatory = projectSkill.ProjectSkill.is_mandatory;
            const userLevel = userSkill ? userSkill.UserSkill.proficiency_level : 0;

            if (isMandatory) {
              mandatoryCount++;
              if (userLevel >= requiredLevel) {
                mandatoryMatch++;
                totalMatch++;
                if (userLevel > requiredLevel) {
                  skillStrengths.push({
                    skill: projectSkill.name,
                    required_level: requiredLevel,
                    user_level: userLevel,
                    surplus: userLevel - requiredLevel
                  });
                }
              } else {
                skillGaps.push({
                  skill: projectSkill.name,
                  required_level: requiredLevel,
                  user_level: userLevel,
                  gap: requiredLevel - userLevel,
                  is_mandatory: true
                });
              }
            } else {
              optionalCount++;
              if (userLevel >= requiredLevel) {
                optionalMatch++;
                totalMatch++;
                skillStrengths.push({
                  skill: projectSkill.name,
                  required_level: requiredLevel,
                  user_level: userLevel,
                  surplus: userLevel - requiredLevel
                });
              } else {
                skillGaps.push({
                  skill: projectSkill.name,
                  required_level: requiredLevel,
                  user_level: userLevel,
                  gap: requiredLevel - userLevel,
                  is_mandatory: false
                });
              }
            }
          });

          // Calculate match percentages
          const totalSkills = projectSkills.length;
          const overallMatch = totalSkills > 0 ? (totalMatch / totalSkills) * 100 : 100;
          const mandatoryMatchPercent = mandatoryCount > 0 ? (mandatoryMatch / mandatoryCount) * 100 : 100;
          const optionalMatchPercent = optionalCount > 0 ? (optionalMatch / optionalCount) * 100 : 100;

          // Calculate workload (current active projects)
          const currentWorkload = user.ProjectAssignments ? 
            user.ProjectAssignments.filter(pa => pa.status === 'active').length : 0;

          // Calculate availability score (lower workload = higher availability)
          const availabilityScore = Math.max(0, 100 - (currentWorkload * 20));

          // Calculate overall recommendation score
          const mandatoryWeight = 0.6;
          const optionalWeight = 0.2;
          const availabilityWeight = 0.2;
          
          const recommendationScore = 
            (mandatoryMatchPercent * mandatoryWeight) +
            (optionalMatchPercent * optionalWeight) +
            (availabilityScore * availabilityWeight);

          return {
            user: {
              id: user.id,
              name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              department: user.department,
              position: user.position
            },
            match_analysis: {
              overall_match: Math.round(overallMatch),
              mandatory_match: Math.round(mandatoryMatchPercent),
              optional_match: Math.round(optionalMatchPercent),
              recommendation_score: Math.round(recommendationScore),
              is_qualified: mandatoryMatchPercent === 100
            },
            workload: {
              current_projects: currentWorkload,
              availability_score: Math.round(availabilityScore),
              active_assignments: user.ProjectAssignments || []
            },
            skill_details: {
              gaps: skillGaps.sort((a, b) => b.gap - a.gap),
              strengths: skillStrengths.sort((a, b) => b.surplus - a.surplus)
            }
          };
        })
        .sort((a, b) => {
          // Sort by qualification first, then by recommendation score
          if (a.match_analysis.is_qualified && !b.match_analysis.is_qualified) return -1;
          if (!a.match_analysis.is_qualified && b.match_analysis.is_qualified) return 1;
          return b.match_analysis.recommendation_score - a.match_analysis.recommendation_score;
        });

      res.json({
        success: true,
        data: {
          project: {
            id: project.id,
            name: project.name,
            required_skills: project.Skills || []
          },
          recommendations,
          summary: {
            total_candidates: recommendations.length,
            qualified_candidates: recommendations.filter(r => r.match_analysis.is_qualified).length,
            avg_match_score: recommendations.length > 0 ? 
              Math.round(recommendations.reduce((sum, r) => sum + r.match_analysis.overall_match, 0) / recommendations.length) : 0
          }
        }
      });
    } catch (err) {
      console.error('Get assignment recommendations error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate assignment recommendations',
          code: 'RECOMMENDATIONS_ERROR'
        }
      });
    }
  },

  // Assign user to project with skill validation
  async assignUserToProject(req, res) {
    try {
      const { project_id, user_id, role, hours_allocated, hourly_rate, validate_skills = true } = req.body;
      
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
      const project = await Project.findByPk(project_id, {
        include: validate_skills ? [
          {
            model: Skill,
            through: { 
              attributes: ['required_level', 'is_mandatory'] 
            }
          }
        ] : []
      });
      
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
      const user = await User.findByPk(user_id, {
        include: validate_skills ? [
          {
            model: Skill,
            through: { 
              attributes: ['proficiency_level', 'years_experience', 'is_verified'] 
            }
          }
        ] : []
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      if (!user.is_active) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot assign inactive user to project',
            code: 'USER_INACTIVE'
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

      // Skill validation if requested
      let skillValidation = null;
      if (validate_skills && project.Skills && project.Skills.length > 0) {
        const userSkills = user.Skills || [];
        const projectSkills = project.Skills || [];
        
        const mandatorySkills = projectSkills.filter(ps => ps.ProjectSkill.is_mandatory);
        const missingMandatorySkills = mandatorySkills.filter(ps => {
          const userSkill = userSkills.find(us => us.id === ps.id);
          return !userSkill || userSkill.UserSkill.proficiency_level < ps.ProjectSkill.required_level;
        });

        skillValidation = {
          has_mandatory_skills: missingMandatorySkills.length === 0,
          missing_mandatory_skills: missingMandatorySkills.map(s => ({
            skill: s.name,
            required_level: s.ProjectSkill.required_level,
            user_level: userSkills.find(us => us.id === s.id)?.UserSkill.proficiency_level || 0
          }))
        };

        // Warning for missing mandatory skills (but don't block assignment)
        if (!skillValidation.has_mandatory_skills) {
          console.warn(`User ${user.email} assigned to project ${project.name} without all mandatory skills`);
        }
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
        data: createdAssignment,
        skill_validation: skillValidation
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
        if (feedback !== undefined) updateData.feedback = feedback;
      }
      
      // Users can update their own hours worked
      if (hours_worked !== undefined && (isOwnAssignment || ['admin', 'manager'].includes(req.user.role))) {
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
          { 
            model: Project,
            include: [
              {
                model: User,
                as: 'manager',
                attributes: ['id', 'first_name', 'last_name']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: assignments,
        count: assignments.length
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
          { 
            model: User, 
            attributes: ['id', 'first_name', 'last_name', 'email', 'department', 'position'],
            include: [
              {
                model: Skill,
                through: { 
                  attributes: ['proficiency_level', 'years_experience', 'is_verified'] 
                }
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: assignments,
        count: assignments.length
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
  },

  // Get assignment statistics
  async getAssignmentStatistics(req, res) {
    try {
      // Only admins and managers can view statistics
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can view assignment statistics',
            code: 'UNAUTHORIZED_STATISTICS'
          }
        });
      }

      const stats = {
        total_assignments: await ProjectAssignment.count(),
        active_assignments: await ProjectAssignment.count({ where: { status: 'active' } }),
        completed_assignments: await ProjectAssignment.count({ where: { status: 'completed' } }),
        
        // Project statistics
        projects_with_assignments: await Project.count({
          include: [
            {
              model: ProjectAssignment,
              where: { status: 'active' },
              required: true
            }
          ]
        }),
        
        // User statistics
        users_with_assignments: await User.count({
          include: [
            {
              model: ProjectAssignment,
              where: { status: 'active' },
              required: true
            }
          ]
        }),
        
        // Average assignments per user
        avg_assignments_per_user: 0,
        
        // Workload distribution
        workload_distribution: []
      };

      // Calculate average assignments per active user
      const activeUsers = await User.findAll({
        where: { is_active: true },
        include: [
          {
            model: ProjectAssignment,
            where: { status: 'active' },
            required: false
          }
        ]
      });

      if (activeUsers.length > 0) {
        const totalAssignments = activeUsers.reduce((sum, user) => 
          sum + (user.ProjectAssignments ? user.ProjectAssignments.length : 0), 0
        );
        stats.avg_assignments_per_user = Math.round((totalAssignments / activeUsers.length) * 100) / 100;
        
        // Workload distribution
        const workloadCounts = { 0: 0, 1: 0, 2: 0, 3: 0, '4+': 0 };
        activeUsers.forEach(user => {
          const assignmentCount = user.ProjectAssignments ? user.ProjectAssignments.length : 0;
          if (assignmentCount === 0) workloadCounts[0]++;
          else if (assignmentCount === 1) workloadCounts[1]++;
          else if (assignmentCount === 2) workloadCounts[2]++;
          else if (assignmentCount === 3) workloadCounts[3]++;
          else workloadCounts['4+']++;
        });
        
        stats.workload_distribution = Object.entries(workloadCounts).map(([projects, users]) => ({
          project_count: projects,
          user_count: users
        }));
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error('Get assignment statistics error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch assignment statistics',
          code: 'STATISTICS_ERROR'
        }
      });
    }
  }
};