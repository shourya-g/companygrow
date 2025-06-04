const { Skill, UserSkill, User, Course, Project } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Get all skills with optional filtering and search
  async getAllSkills(req, res) {
    try {
      const { 
        category, 
        search, 
        sort = 'name', 
        order = 'ASC',
        page = 1,
        limit = 50,
        include_stats = false
      } = req.query;

      const where = {};
      const options = {
        attributes: ['id', 'name', 'category', 'description', 'created_at'],
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      // Apply filters
      if (category) {
        where.category = category;
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (Object.keys(where).length > 0) {
        options.where = where;
      }

      // Include usage statistics if requested
      if (include_stats === 'true') {
        options.include = [
          {
            model: UserSkill,
            attributes: [],
            required: false
          }
        ];
        options.attributes.push([
          require('sequelize').fn('COUNT', require('sequelize').col('UserSkills.id')),
          'user_count'
        ]);
        options.group = ['Skill.id'];
        options.raw = false;
        options.subQuery = false;
      }

      const skills = await Skill.findAll(options);
      const totalCount = await Skill.count({ where });

      res.json({
        success: true,
        data: skills,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('Get all skills error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch skills',
          code: 'FETCH_SKILLS_ERROR'
        }
      });
    }
  },

  // Get skill by ID with detailed information
  async getSkillById(req, res) {
    try {
      const { include_users = false, include_courses = false } = req.query;
      
      const options = {
        include: []
      };

      // Include users who have this skill
      if (include_users === 'true') {
        options.include.push({
          model: UserSkill,
          include: [
            {
              model: User,
              attributes: ['id', 'first_name', 'last_name', 'email', 'department']
            }
          ],
          attributes: ['proficiency_level', 'years_experience', 'is_verified']
        });
      }

      // Include courses that teach this skill
      if (include_courses === 'true') {
        options.include.push({
          model: Course,
          through: { attributes: ['skill_level'] },
          attributes: ['id', 'title', 'category', 'difficulty_level']
        });
      }

      const skill = await Skill.findByPk(req.params.id, options);

      if (!skill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Skill not found',
            code: 'SKILL_NOT_FOUND'
          }
        });
      }

      res.json({
        success: true,
        data: skill
      });
    } catch (err) {
      console.error('Get skill by ID error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch skill',
          code: 'FETCH_SKILL_ERROR'
        }
      });
    }
  },

  // Create new skill (admin only)
  async createSkill(req, res) {
    try {
      const { name, category, description } = req.body;

      // Only admins can create skills
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins can create skills',
            code: 'UNAUTHORIZED_SKILL_CREATION'
          }
        });
      }

      if (!name || !category) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Name and category are required',
            code: 'MISSING_REQUIRED_FIELDS'
          }
        });
      }

      // Validate category
      const validCategories = ['technical', 'soft', 'leadership', 'business', 'creative', 'other'];
      if (!validCategories.includes(category.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Category must be one of: ${validCategories.join(', ')}`,
            code: 'INVALID_CATEGORY'
          }
        });
      }

      // Check if skill already exists
      const existingSkill = await Skill.findOne({
        where: { 
          name: { [Op.iLike]: name.trim() }
        }
      });

      if (existingSkill) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'A skill with this name already exists',
            code: 'SKILL_ALREADY_EXISTS'
          }
        });
      }

      const skill = await Skill.create({
        name: name.trim(),
        category: category.toLowerCase(),
        description: description ? description.trim() : null
      });

      res.status(201).json({
        success: true,
        message: 'Skill created successfully',
        data: skill
      });
    } catch (err) {
      console.error('Create skill error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create skill',
          code: 'CREATE_SKILL_ERROR'
        }
      });
    }
  },

  // Update skill (admin only)
  async updateSkill(req, res) {
    try {
      const { name, category, description } = req.body;

      // Only admins can update skills
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins can update skills',
            code: 'UNAUTHORIZED_SKILL_UPDATE'
          }
        });
      }

      const skill = await Skill.findByPk(req.params.id);
      if (!skill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Skill not found',
            code: 'SKILL_NOT_FOUND'
          }
        });
      }

      const updateData = {};

      if (name && name.trim() !== skill.name) {
        // Check if new name already exists
        const existingSkill = await Skill.findOne({
          where: { 
            name: { [Op.iLike]: name.trim() },
            id: { [Op.ne]: skill.id }
          }
        });

        if (existingSkill) {
          return res.status(409).json({
            success: false,
            error: {
              message: 'A skill with this name already exists',
              code: 'SKILL_NAME_EXISTS'
            }
          });
        }
        updateData.name = name.trim();
      }

      if (category) {
        const validCategories = ['technical', 'soft', 'leadership', 'business', 'creative', 'other'];
        if (!validCategories.includes(category.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: {
              message: `Category must be one of: ${validCategories.join(', ')}`,
              code: 'INVALID_CATEGORY'
            }
          });
        }
        updateData.category = category.toLowerCase();
      }

      if (description !== undefined) {
        updateData.description = description ? description.trim() : null;
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

      await skill.update(updateData);

      res.json({
        success: true,
        message: 'Skill updated successfully',
        data: skill
      });
    } catch (err) {
      console.error('Update skill error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update skill',
          code: 'UPDATE_SKILL_ERROR'
        }
      });
    }
  },

  // Delete skill (admin only)
  async deleteSkill(req, res) {
    try {
      // Only admins can delete skills
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins can delete skills',
            code: 'UNAUTHORIZED_SKILL_DELETION'
          }
        });
      }

      const skill = await Skill.findByPk(req.params.id);
      if (!skill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Skill not found',
            code: 'SKILL_NOT_FOUND'
          }
        });
      }

      // Check if skill is being used
      const userSkillCount = await UserSkill.count({ where: { skill_id: skill.id } });
      
      if (userSkillCount > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot delete skill that is assigned to users',
            code: 'SKILL_IN_USE',
            details: `${userSkillCount} users have this skill`
          }
        });
      }

      await skill.destroy();

      res.json({
        success: true,
        message: 'Skill deleted successfully'
      });
    } catch (err) {
      console.error('Delete skill error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete skill',
          code: 'DELETE_SKILL_ERROR'
        }
      });
    }
  },

  // Get skill categories
  async getSkillCategories(req, res) {
    try {
      const categories = await Skill.findAll({
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['category'],
        order: [['category', 'ASC']],
        raw: true
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (err) {
      console.error('Get skill categories error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch skill categories',
          code: 'FETCH_CATEGORIES_ERROR'
        }
      });
    }
  },

  // Get skill statistics
  async getSkillStatistics(req, res) {
    try {
      // Only admins and managers can view statistics
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can view skill statistics',
            code: 'UNAUTHORIZED_STATISTICS_VIEW'
          }
        });
      }

      const totalSkills = await Skill.count();
      const totalUserSkills = await UserSkill.count();
      
      const topSkills = await Skill.findAll({
        attributes: [
          'id', 'name', 'category',
          [require('sequelize').fn('COUNT', require('sequelize').col('UserSkills.id')), 'user_count']
        ],
        include: [
          {
            model: UserSkill,
            attributes: [],
            required: false
          }
        ],
        group: ['Skill.id'],
        order: [[require('sequelize').literal('user_count'), 'DESC']],
        limit: 10,
        subQuery: false
      });

      const categoryStats = await Skill.findAll({
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', require('sequelize').col('Skill.id')), 'skill_count'],
          [require('sequelize').fn('COUNT', require('sequelize').col('UserSkills.id')), 'user_skill_count']
        ],
        include: [
          {
            model: UserSkill,
            attributes: [],
            required: false
          }
        ],
        group: ['category'],
        order: [['category', 'ASC']],
        subQuery: false
      });

      const proficiencyStats = await UserSkill.findAll({
        attributes: [
          'proficiency_level',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['proficiency_level'],
        order: [['proficiency_level', 'ASC']],
        raw: true
      });

      res.json({
        success: true,
        data: {
          overview: {
            total_skills: totalSkills,
            total_user_skills: totalUserSkills,
            average_skills_per_user: totalUserSkills > 0 ? 
              (totalUserSkills / await User.count({ where: { is_active: true } })).toFixed(2) : 0
          },
          top_skills: topSkills,
          category_distribution: categoryStats,
          proficiency_distribution: proficiencyStats
        }
      });
    } catch (err) {
      console.error('Get skill statistics error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch skill statistics',
          code: 'FETCH_STATISTICS_ERROR'
        }
      });
    }
  },

  // Search skills with suggestions
  async searchSkills(req, res) {
    try {
      const { q, category, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Search query must be at least 2 characters long',
            code: 'INVALID_SEARCH_QUERY'
          }
        });
      }

      const where = {
        [Op.or] : [
          { name: { [Op.iLike]: `%${q.trim()}%` } },
          { description: { [Op.iLike]: `%${q.trim()}%` } }
        ]
      };

      if (category) {
        where.category = category;
      }

      const skills = await Skill.findAll({
        where,
        attributes: ['id', 'name', 'category', 'description'],
        limit: parseInt(limit),
        order: [
          // Exact matches first
          [require('sequelize').literal(`CASE WHEN LOWER(name) = LOWER('${q.trim()}') THEN 0 ELSE 1 END`), 'ASC'],
          // Then by name similarity
          ['name', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: skills,
        query: q.trim()
      });
    } catch (err) {
      console.error('Search skills error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to search skills',
          code: 'SEARCH_SKILLS_ERROR'
        }
      });
    }
  },

  // Bulk import skills (admin only)
  async bulkImportSkills(req, res) {
    try {
      // Only admins can bulk import skills
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins can bulk import skills',
            code: 'UNAUTHORIZED_BULK_IMPORT'
          }
        });
      }

      const { skills } = req.body;

      if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Skills array is required and must not be empty',
            code: 'INVALID_SKILLS_ARRAY'
          }
        });
      }

      const validCategories = ['technical', 'soft', 'leadership', 'business', 'creative', 'other'];
      const results = {
        created: [],
        skipped: [],
        errors: []
      };

      for (let i = 0; i < skills.length; i++) {
        const skillData = skills[i];
        
        try {
          if (!skillData.name || !skillData.category) {
            results.errors.push({
              index: i,
              skill: skillData,
              error: 'Name and category are required'
            });
            continue;
          }

          if (!validCategories.includes(skillData.category.toLowerCase())) {
            results.errors.push({
              index: i,
              skill: skillData,
              error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
            continue;
          }

          // Check if skill already exists
          const existingSkill = await Skill.findOne({
            where: { 
              name: { [Op.iLike]: skillData.name.trim() }
            }
          });

          if (existingSkill) {
            results.skipped.push({
              index: i,
              skill: skillData,
              reason: 'Skill already exists'
            });
            continue;
          }

          // Create skill
          const newSkill = await Skill.create({
            name: skillData.name.trim(),
            category: skillData.category.toLowerCase(),
            description: skillData.description ? skillData.description.trim() : null
          });

          results.created.push(newSkill);
        } catch (error) {
          results.errors.push({
            index: i,
            skill: skillData,
            error: error.message
          });
        }
      }

      res.status(201).json({
        success: true,
        message: `Bulk import completed. Created: ${results.created.length}, Skipped: ${results.skipped.length}, Errors: ${results.errors.length}`,
        data: results
      });
    } catch (err) {
      console.error('Bulk import skills error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to bulk import skills',
          code: 'BULK_IMPORT_ERROR'
        }
      });
    }
  }
};