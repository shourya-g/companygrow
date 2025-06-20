const { UserSkill } = require('../models');
const PointsIntegration = require('../services/pointsIntegration');

module.exports = {
  async getAllUserSkills(req, res) {
    try {
      const userSkills = await UserSkill.findAll({
        include: [
          {
            model: require('../models').User,
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: require('../models').Skill,
            attributes: ['id', 'name', 'category', 'description']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({ 
        success: true, 
        data: userSkills,
        count: userSkills.length 
      });
    } catch (err) {
      console.error('Get all user skills error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch user skills',
          code: 'FETCH_USER_SKILLS_ERROR'
        } 
      });
    }
  },

  async getUserSkillById(req, res) {
    try {
      const userSkill = await UserSkill.findByPk(req.params.id, {
        include: [
          {
            model: require('../models').User,
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: require('../models').Skill,
            attributes: ['id', 'name', 'category', 'description']
          }
        ]
      });
      
      if (!userSkill) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'UserSkill not found',
            code: 'USER_SKILL_NOT_FOUND'
          } 
        });
      }
      
      res.json({ 
        success: true, 
        data: userSkill 
      });
    } catch (err) {
      console.error('Get user skill by ID error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch user skill',
          code: 'FETCH_USER_SKILL_ERROR'
        } 
      });
    }
  },

  async addUserSkill(req, res) {
    try {
      const { user_id, skill_id, proficiency_level, years_experience } = req.body;
      
      if (!user_id || !skill_id) {
        return res.status(400).json({ 
          success: false, 
          error: { 
            message: 'user_id and skill_id are required',
            code: 'MISSING_REQUIRED_FIELDS'
          } 
        });
      }

      // Validate proficiency level
      if (proficiency_level && (proficiency_level < 1 || proficiency_level > 5)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Proficiency level must be between 1 and 5',
            code: 'INVALID_PROFICIENCY_LEVEL'
          }
        });
      }

      // Validate years of experience
      if (years_experience && (years_experience < 0 || years_experience > 50)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Years of experience must be between 0 and 50',
            code: 'INVALID_YEARS_EXPERIENCE'
          }
        });
      }

      // Check if user exists
      const { User } = require('../models');
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

      // Check if skill exists
      const { Skill } = require('../models');
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
      
      // Prevent duplicate user-skill at the DB level
      const existing = await UserSkill.findOne({ where: { user_id, skill_id } });
      if (existing) {
        return res.status(409).json({ 
          success: false, 
          error: { 
            message: 'User already has this skill',
            code: 'SKILL_ALREADY_EXISTS'
          } 
        });
      }
      
      const userSkill = await UserSkill.create({ 
        user_id, 
        skill_id, 
        proficiency_level: proficiency_level || 1, 
        years_experience: years_experience || 0,
        is_verified: false
      });

      // Award points for adding a new skill
      try {
        await PointsIntegration.onSkillAdded(user_id, skill_id, proficiency_level || 1);
      } catch (pointsError) {
        console.warn('Failed to award skill addition points:', pointsError);
        // Don't fail the skill addition if points fail
      }

      // Fetch the created user skill with related data
      const createdUserSkill = await UserSkill.findByPk(userSkill.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Skill,
            attributes: ['id', 'name', 'category', 'description']
          }
        ]
      });
      
      res.status(201).json({ 
        success: true, 
        message: 'Skill successfully added to user',
        data: createdUserSkill 
      });
    } catch (err) {
      console.error('Add user skill error:', err);
      
      // Handle unique constraint error gracefully
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          success: false, 
          error: { 
            message: 'User already has this skill',
            code: 'SKILL_ALREADY_EXISTS'
          } 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to add skill to user',
          code: 'ADD_USER_SKILL_ERROR'
        } 
      });
    }
  },

  async updateUserSkill(req, res) {
    try {
      const { id } = req.params;
      const { proficiency_level, years_experience, is_verified } = req.body;
      
      const userSkill = await UserSkill.findByPk(id);
      if (!userSkill) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'UserSkill not found',
            code: 'USER_SKILL_NOT_FOUND'
          } 
        });
      }

      // Store original values for comparison
      const originalProficiency = userSkill.proficiency_level;
      const originalVerification = userSkill.is_verified;

      // Validate proficiency level
      if (proficiency_level !== undefined && (proficiency_level < 1 || proficiency_level > 5)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Proficiency level must be between 1 and 5',
            code: 'INVALID_PROFICIENCY_LEVEL'
          }
        });
      }

      // Validate years of experience
      if (years_experience !== undefined && (years_experience < 0 || years_experience > 50)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Years of experience must be between 0 and 50',
            code: 'INVALID_YEARS_EXPERIENCE'
          }
        });
      }

      // Prepare update data
      const updateData = {};
      if (proficiency_level !== undefined) updateData.proficiency_level = proficiency_level;
      if (years_experience !== undefined) updateData.years_experience = years_experience;
      if (is_verified !== undefined) updateData.is_verified = is_verified;

      // Only allow managers/admins to verify skills
      if (is_verified !== undefined && req.user && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only managers and admins can verify skills',
            code: 'UNAUTHORIZED_SKILL_VERIFICATION'
          }
        });
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
      
      await userSkill.update(updateData);

      // Award points for skill improvements and verification
      try {
        // Award points for skill verification (only if just verified by someone else)
        if (is_verified && !originalVerification && req.user && req.user.id !== userSkill.user_id) {
          await PointsIntegration.onSkillVerified(userSkill.user_id, userSkill.skill_id);
        }

        // Award points for significant skill level improvement
        if (proficiency_level && originalProficiency && proficiency_level > originalProficiency) {
          const improvement = proficiency_level - originalProficiency;
          await PointsIntegration.onSkillImproved(userSkill.user_id, userSkill.skill_id, improvement);
        }
      } catch (pointsError) {
        console.warn('Failed to award skill update points:', pointsError);
        // Don't fail the update if points fail
      }

      // Fetch updated user skill with related data
      const updatedUserSkill = await UserSkill.findByPk(id, {
        include: [
          {
            model: require('../models').User,
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: require('../models').Skill,
            attributes: ['id', 'name', 'category', 'description']
          }
        ]
      });
      
      res.json({ 
        success: true, 
        message: 'User skill updated successfully',
        data: updatedUserSkill 
      });
    } catch (err) {
      console.error('Update user skill error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to update user skill',
          code: 'UPDATE_USER_SKILL_ERROR'
        } 
      });
    }
  },

  async deleteUserSkill(req, res) {
    try {
      const { id } = req.params;
      const userSkill = await UserSkill.findByPk(id);
      
      if (!userSkill) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'UserSkill not found',
            code: 'USER_SKILL_NOT_FOUND'
          } 
        });
      }

      // Store skill info before deletion for potential point deduction
      const skillInfo = {
        user_id: userSkill.user_id,
        skill_id: userSkill.skill_id,
        proficiency_level: userSkill.proficiency_level
      };
      
      await userSkill.destroy();

      // Optional: Deduct points for skill removal (uncomment if desired)
      // try {
      //   await PointsIntegration.onSkillRemoved(skillInfo.user_id, skillInfo.skill_id);
      // } catch (pointsError) {
      //   console.warn('Failed to deduct skill removal points:', pointsError);
      // }
      
      res.json({ 
        success: true, 
        message: 'User skill deleted successfully' 
      });
    } catch (err) {
      console.error('Delete user skill error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to delete user skill',
          code: 'DELETE_USER_SKILL_ERROR'
        } 
      });
    }
  },

  // Get user skills with statistics
  async getUserSkillStats(req, res) {
    try {
      const { userId } = req.params;

      // Check if user can view these stats
      if (req.user && req.user.id !== parseInt(userId) && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot view other user skill statistics',
            code: 'UNAUTHORIZED_VIEW'
          }
        });
      }

      const userSkills = await UserSkill.findAll({
        where: { user_id: userId },
        include: [
          {
            model: require('../models').Skill,
            attributes: ['id', 'name', 'category', 'description']
          }
        ]
      });

      // Calculate statistics
      const stats = {
        total_skills: userSkills.length,
        verified_skills: userSkills.filter(us => us.is_verified).length,
        avg_proficiency: userSkills.length > 0 ? 
          Math.round((userSkills.reduce((sum, us) => sum + us.proficiency_level, 0) / userSkills.length) * 10) / 10 : 0,
        total_experience: userSkills.reduce((sum, us) => sum + us.years_experience, 0),
        skill_categories: {}
      };

      // Group skills by category
      userSkills.forEach(us => {
        const category = us.Skill.category;
        if (!stats.skill_categories[category]) {
          stats.skill_categories[category] = {
            count: 0,
            avg_proficiency: 0,
            skills: []
          };
        }
        stats.skill_categories[category].count++;
        stats.skill_categories[category].skills.push({
          name: us.Skill.name,
          proficiency_level: us.proficiency_level,
          is_verified: us.is_verified
        });
      });

      // Calculate average proficiency per category
      Object.keys(stats.skill_categories).forEach(category => {
        const categorySkills = stats.skill_categories[category].skills;
        stats.skill_categories[category].avg_proficiency = 
          Math.round((categorySkills.reduce((sum, s) => sum + s.proficiency_level, 0) / categorySkills.length) * 10) / 10;
      });

      res.json({
        success: true,
        data: {
          skills: userSkills,
          statistics: stats
        }
      });
    } catch (err) {
      console.error('Get user skill stats error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch user skill statistics',
          code: 'FETCH_SKILL_STATS_ERROR'
        }
      });
    }
  },

  // Bulk update user skills (for admin use)
  async bulkUpdateUserSkills(req, res) {
    try {
      const { updates } = req.body; // Array of {id, proficiency_level, years_experience, is_verified}

      // Only admins can do bulk updates
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins can perform bulk skill updates',
            code: 'UNAUTHORIZED_BULK_UPDATE'
          }
        });
      }

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Updates array is required and must not be empty',
            code: 'INVALID_UPDATES_ARRAY'
          }
        });
      }

      const results = [];
      const errors = [];

      for (const update of updates) {
        try {
          const { id, proficiency_level, years_experience, is_verified } = update;
          
          const userSkill = await UserSkill.findByPk(id);
          if (!userSkill) {
            errors.push({ id, error: 'UserSkill not found' });
            continue;
          }

          const updateData = {};
          if (proficiency_level !== undefined) updateData.proficiency_level = proficiency_level;
          if (years_experience !== undefined) updateData.years_experience = years_experience;
          if (is_verified !== undefined) updateData.is_verified = is_verified;

          await userSkill.update(updateData);
          results.push({ id, status: 'updated' });

          // Award points for verification
          if (is_verified && !userSkill.is_verified) {
            try {
              await PointsIntegration.onSkillVerified(userSkill.user_id, userSkill.skill_id);
            } catch (pointsError) {
              console.warn(`Failed to award verification points for skill ${id}:`, pointsError);
            }
          }

        } catch (updateError) {
          errors.push({ id: update.id, error: updateError.message });
        }
      }

      res.json({
        success: true,
        message: `Bulk update completed. ${results.length} successful, ${errors.length} failed.`,
        data: {
          successful: results,
          failed: errors
        }
      });
    } catch (err) {
      console.error('Bulk update user skills error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to perform bulk skill updates',
          code: 'BULK_UPDATE_ERROR'
        }
      });
    }
  }
};