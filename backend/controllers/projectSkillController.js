const { ProjectSkill, Project, Skill } = require('../models');

module.exports = {
  // Get all project skills
  async getAllProjectSkills(req, res) {
    try {
      const projectSkills = await ProjectSkill.findAll({
        include: [
          { model: Project, attributes: ['id', 'name'] },
          { model: Skill, attributes: ['id', 'name', 'category'] }
        ],
        order: [['project_id', 'ASC']]
      });
      
      res.json({ 
        success: true, 
        data: projectSkills 
      });
    } catch (err) {
      console.error('Get all project skills error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch project skills',
          code: 'FETCH_PROJECT_SKILLS_ERROR'
        } 
      });
    }
  },

  // Get project skill by ID
  async getProjectSkillById(req, res) {
    try {
      const projectSkill = await ProjectSkill.findByPk(req.params.id, {
        include: [
          { model: Project },
          { model: Skill }
        ]
      });
      
      if (!projectSkill) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'Project skill not found',
            code: 'PROJECT_SKILL_NOT_FOUND'
          } 
        });
      }
      
      res.json({ 
        success: true, 
        data: projectSkill 
      });
    } catch (err) {
      console.error('Get project skill by ID error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch project skill',
          code: 'FETCH_PROJECT_SKILL_ERROR'
        } 
      });
    }
  },

  // Add skill requirement to project
  async addSkillToProject(req, res) {
    try {
      const { project_id, skill_id, required_level, is_mandatory } = req.body;
      
      // Only admins and managers can manage project skills
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can manage project skills',
            code: 'UNAUTHORIZED_PROJECT_SKILL_MANAGEMENT'
          }
        });
      }
      
      if (!project_id || !skill_id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Project ID and Skill ID are required',
            code: 'MISSING_REQUIRED_FIELDS'
          }
        });
      }
      
      // Validate required level
      if (required_level && (required_level < 1 || required_level > 5)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Required level must be between 1 and 5',
            code: 'INVALID_REQUIRED_LEVEL'
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
      
      // Check if skill exists
      const skill = await Skill.findByPk(skill_id);
      if (!skill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Skill not found',
            code: 'SKILL_NOT_FOUND'
          }
        });
      }
      
      // Check if project already requires this skill
      const existingProjectSkill = await ProjectSkill.findOne({
        where: { project_id, skill_id }
      });
      
      if (existingProjectSkill) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Project already requires this skill',
            code: 'SKILL_ALREADY_REQUIRED'
          }
        });
      }
      
      // Create project skill requirement
      const projectSkill = await ProjectSkill.create({
        project_id,
        skill_id,
        required_level: required_level || 1,
        is_mandatory: is_mandatory !== undefined ? is_mandatory : true
      });
      
      // Fetch the created project skill with related data
      const createdProjectSkill = await ProjectSkill.findByPk(projectSkill.id, {
        include: [
          { model: Project },
          { model: Skill }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Skill requirement successfully added to project',
        data: createdProjectSkill
      });
    } catch (err) {
      console.error('Add skill to project error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to add skill requirement to project',
          code: 'ADD_PROJECT_SKILL_ERROR'
        }
      });
    }
  },

  // Update project skill requirement
  async updateProjectSkill(req, res) {
    try {
      const { id } = req.params;
      const { required_level, is_mandatory } = req.body;
      
      // Only admins and managers can manage project skills
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can manage project skills',
            code: 'UNAUTHORIZED_PROJECT_SKILL_MANAGEMENT'
          }
        });
      }
      
      const projectSkill = await ProjectSkill.findByPk(id);
      if (!projectSkill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project skill not found',
            code: 'PROJECT_SKILL_NOT_FOUND'
          }
        });
      }
      
      // Validate required level
      if (required_level && (required_level < 1 || required_level > 5)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Required level must be between 1 and 5',
            code: 'INVALID_REQUIRED_LEVEL'
          }
        });
      }
      
      const updateData = {};
      if (required_level) updateData.required_level = required_level;
      if (is_mandatory !== undefined) updateData.is_mandatory = is_mandatory;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No valid fields to update',
            code: 'NO_UPDATE_FIELDS'
          }
        });
      }
      
      await projectSkill.update(updateData);
      
      // Fetch updated project skill with related data
      const updatedProjectSkill = await ProjectSkill.findByPk(id, {
        include: [
          { model: Project },
          { model: Skill }
        ]
      });
      
      res.json({
        success: true,
        message: 'Project skill requirement updated successfully',
        data: updatedProjectSkill
      });
    } catch (err) {
      console.error('Update project skill error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update project skill requirement',
          code: 'UPDATE_PROJECT_SKILL_ERROR'
        }
      });
    }
  },

  // Remove skill requirement from project
  async removeSkillFromProject(req, res) {
    try {
      const { id } = req.params;
      
      // Only admins and managers can manage project skills
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can manage project skills',
            code: 'UNAUTHORIZED_PROJECT_SKILL_MANAGEMENT'
          }
        });
      }
      
      const projectSkill = await ProjectSkill.findByPk(id);
      if (!projectSkill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project skill not found',
            code: 'PROJECT_SKILL_NOT_FOUND'
          }
        });
      }
      
      await projectSkill.destroy();
      
      res.json({
        success: true,
        message: 'Skill requirement successfully removed from project'
      });
    } catch (err) {
      console.error('Remove skill from project error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to remove skill requirement from project',
          code: 'REMOVE_PROJECT_SKILL_ERROR'
        }
      });
    }
  },

  // Get skill requirements for a specific project
  async getProjectSkills(req, res) {
    try {
      const { projectId } = req.params;
      
      const projectSkills = await ProjectSkill.findAll({
        where: { project_id: projectId },
        include: [
          { model: Skill }
        ],
        order: [['is_mandatory', 'DESC'], ['required_level', 'DESC']]
      });
      
      res.json({
        success: true,
        data: projectSkills
      });
    } catch (err) {
      console.error('Get project skills error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch project skill requirements',
          code: 'FETCH_PROJECT_SKILLS_ERROR'
        }
      });
    }
  },

  // Get projects that require a specific skill
  async getSkillProjects(req, res) {
    try {
      const { skillId } = req.params;
      
      const projectSkills = await ProjectSkill.findAll({
        where: { skill_id: skillId },
        include: [
          { model: Project }
        ],
        order: [['required_level', 'DESC']]
      });
      
      res.json({
        success: true,
        data: projectSkills
      });
    } catch (err) {
      console.error('Get skill projects error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch projects requiring this skill',
          code: 'FETCH_SKILL_PROJECTS_ERROR'
        }
      });
    }
  },

  // Get skill match analysis for a project
  async getProjectSkillAnalysis(req, res) {
    try {
      const { projectId } = req.params;
      
      // Only admins and managers can view skill analysis
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can view skill analysis',
            code: 'UNAUTHORIZED_SKILL_ANALYSIS'
          }
        });
      }
      
      const { User, UserSkill } = require('../models');
      
      // Get project skill requirements
      const projectSkills = await ProjectSkill.findAll({
        where: { project_id: projectId },
        include: [{ model: Skill }]
      });
      
      if (projectSkills.length === 0) {
        return res.json({
          success: true,
          data: {
            message: 'No skill requirements defined for this project',
            qualified_users: [],
            skill_gaps: []
          }
        });
      }
      
      // Get all users with their skills
      const users = await User.findAll({
        where: { is_active: true },
        include: [{
          model: UserSkill,
          include: [{ model: Skill }]
        }]
      });
      
      // Analyze each user's match to project requirements
      const userAnalysis = users.map(user => {
        let totalMatch = 0;
        let mandatoryMatch = 0;
        let mandatoryCount = 0;
        const skillGaps = [];
        
        projectSkills.forEach(projSkill => {
          const userSkill = user.UserSkills.find(us => 
            us.skill_id === projSkill.skill_id
          );
          
          if (projSkill.is_mandatory) {
            mandatoryCount++;
            if (userSkill && userSkill.proficiency_level >= projSkill.required_level) {
              mandatoryMatch++;
              totalMatch++;
            } else {
              skillGaps.push({
                skill: projSkill.Skill.name,
                required_level: projSkill.required_level,
                current_level: userSkill ? userSkill.proficiency_level : 0,
                is_mandatory: true
              });
            }
          } else {
            if (userSkill && userSkill.proficiency_level >= projSkill.required_level) {
              totalMatch++;
            } else {
              skillGaps.push({
                skill: projSkill.Skill.name,
                required_level: projSkill.required_level,
                current_level: userSkill ? userSkill.proficiency_level : 0,
                is_mandatory: false
              });
            }
          }
        });
        
        const matchPercentage = projectSkills.length > 0 ? 
          (totalMatch / projectSkills.length) * 100 : 0;
        const mandatoryMatchPercentage = mandatoryCount > 0 ? 
          (mandatoryMatch / mandatoryCount) * 100 : 100;
        
        return {
          user: {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            department: user.department
          },
          match_percentage: Math.round(matchPercentage),
          mandatory_match_percentage: Math.round(mandatoryMatchPercentage),
          skill_gaps: skillGaps,
          is_qualified: mandatoryMatchPercentage === 100
        };
      });
      
      // Sort by match percentage (qualified users first)
      const sortedAnalysis = userAnalysis.sort((a, b) => {
        if (a.is_qualified && !b.is_qualified) return -1;
        if (!a.is_qualified && b.is_qualified) return 1;
        return b.match_percentage - a.match_percentage;
      });
      
      res.json({
        success: true,
        data: {
          project_requirements: projectSkills,
          user_analysis: sortedAnalysis,
          summary: {
            total_users: users.length,
            qualified_users: sortedAnalysis.filter(u => u.is_qualified).length,
            avg_match_percentage: Math.round(
              sortedAnalysis.reduce((sum, u) => sum + u.match_percentage, 0) / users.length
            )
          }
        }
      });
    } catch (err) {
      console.error('Get project skill analysis error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to analyze project skill requirements',
          code: 'SKILL_ANALYSIS_ERROR'
        }
      });
    }
  }
};