const { Badge, UserBadge, User, Course, UserToken, TokenTransaction } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Get all badges with filtering options
  async getAllBadges(req, res) {
    try {
      const {
        badge_type,
        rarity,
        course_id,
        is_active = true,
        include_course = false
      } = req.query;

      const whereClause = {};
      
      if (is_active === 'true') {
        whereClause.is_active = true;
      }
      
      if (badge_type) {
        whereClause.badge_type = badge_type;
      }
      
      if (rarity) {
        whereClause.rarity = rarity;
      }
      
      if (course_id) {
        whereClause.course_id = course_id;
      }

      const include = [];
      if (include_course === 'true') {
        include.push({
          model: Course,
          attributes: ['id', 'title', 'category']
        });
      }

      const badges = await Badge.findAll({
        where: whereClause,
        include,
        order: [['created_at', 'DESC']]
      });

    res.json({ success: true, data: badges });
    } catch (err) {
      console.error('Get all badges error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch badges',
          code: 'FETCH_BADGES_ERROR'
        }
      });
    }
  },

  // Get badge by ID
  async getBadgeById(req, res) {
    try {
      const badge = await Badge.findByPk(req.params.id, {
        include: [
          {
            model: Course,
            attributes: ['id', 'title', 'category']
          }
        ]
      });
      
      if (!badge) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Badge not found',
            code: 'BADGE_NOT_FOUND'
          }
        });
      }
      
      res.json({ success: true, data: badge });
    } catch (err) {
      console.error('Get badge by ID error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch badge',
          code: 'FETCH_BADGE_ERROR'
        }
      });
    }
  },

  // Create badge (admin only)
  async createBadge(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins can create badges',
            code: 'UNAUTHORIZED_BADGE_CREATION'
          }
        });
      }

      const {
        name,
        description,
        badge_type,
        criteria,
        badge_image,
        token_reward,
        rarity,
        course_id
      } = req.body;

      if (!name || !description) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Name and description are required',
            code: 'MISSING_REQUIRED_FIELDS'
          }
        });
      }

      // If course_id is provided, verify the course exists
      if (course_id) {
        const course = await Course.findByPk(course_id);
        if (!course) {
          return res.status(404).json({
            success: false,
            error: {
              message: 'Course not found',
              code: 'COURSE_NOT_FOUND'
            }
          });
        }
      }

      const badge = await Badge.create({
        name: name.trim(),
        description: description.trim(),
        badge_type: badge_type || 'course',
        criteria,
        badge_image,
        token_reward: token_reward || 0,
        rarity: rarity || 'common',
        course_id: course_id || null,
        is_active: true
      });

      // Fetch the created badge with course info
      const createdBadge = await Badge.findByPk(badge.id, {
        include: [
          {
            model: Course,
            attributes: ['id', 'title', 'category']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Badge created successfully',
        data: createdBadge
      });
    } catch (err) {
      console.error('Create badge error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create badge',
          code: 'CREATE_BADGE_ERROR'
        }
      });
    }
  },

  // Update badge (admin only)
  async updateBadge(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins can update badges',
            code: 'UNAUTHORIZED_BADGE_UPDATE'
          }
        });
      }

      const badge = await Badge.findByPk(req.params.id);
      if (!badge) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Badge not found',
            code: 'BADGE_NOT_FOUND'
          }
        });
      }

      // If course_id is being updated, verify the course exists
      if (req.body.course_id) {
        const course = await Course.findByPk(req.body.course_id);
        if (!course) {
          return res.status(404).json({
            success: false,
            error: {
              message: 'Course not found',
              code: 'COURSE_NOT_FOUND'
            }
          });
        }
      }

      await badge.update(req.body);

      const updatedBadge = await Badge.findByPk(badge.id, {
        include: [
          {
            model: Course,
            attributes: ['id', 'title', 'category']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Badge updated successfully',
        data: updatedBadge
      });
    } catch (err) {
      console.error('Update badge error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update badge',
          code: 'UPDATE_BADGE_ERROR'
        }
      });
    }
  },

  // Delete badge (admin only)
  async deleteBadge(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins can delete badges',
            code: 'UNAUTHORIZED_BADGE_DELETE'
          }
        });
      }

    const badge = await Badge.findByPk(req.params.id);
      if (!badge) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Badge not found',
            code: 'BADGE_NOT_FOUND'
          }
        });
      }

      // Check if badge has been awarded to users
      const userBadgeCount = await UserBadge.count({
        where: { badge_id: badge.id }
      });

      if (userBadgeCount > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot delete badge that has been awarded to users',
            code: 'BADGE_ALREADY_AWARDED'
          }
        });
      }

      await badge.destroy();

      res.json({
        success: true,
        message: 'Badge deleted successfully'
      });
    } catch (err) {
      console.error('Delete badge error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete badge',
          code: 'DELETE_BADGE_ERROR'
        }
      });
    }
  },

  // Get user badges
  async getUserBadges(req, res) {
    try {
      const { userId } = req.params;
      
      // Check if user can view these badges (allow optional auth for public profiles)
      if (req.user && req.user.id !== parseInt(userId) && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot view other user badges',
            code: 'UNAUTHORIZED_VIEW'
          }
        });
      }

      // Get all badges and mark which ones the user has earned
      const allBadges = await Badge.findAll({
        where: { is_active: true },
        include: [
          {
            model: Course,
            attributes: ['id', 'title', 'category']
          },
          {
            model: UserBadge,
            where: { user_id: userId },
            required: false,
            include: [
              {
                model: User,
                as: 'awarder',
                attributes: ['id', 'first_name', 'last_name']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: allBadges
      });
    } catch (err) {
      console.error('Get user badges error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch user badges',
          code: 'FETCH_USER_BADGES_ERROR'
        }
      });
    }
  },

  // Award badge to user
  async awardBadge(req, res) {
    try {
      const { user_id, badge_id, notes } = req.body;

      if (!user_id || !badge_id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'User ID and Badge ID are required',
            code: 'MISSING_REQUIRED_FIELDS'
          }
        });
      }

      // Check if badge exists
      const badge = await Badge.findByPk(badge_id);
      if (!badge) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Badge not found',
            code: 'BADGE_NOT_FOUND'
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

      // Check if user already has this badge
      const existingUserBadge = await UserBadge.findOne({
        where: { user_id, badge_id }
      });

      if (existingUserBadge) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'User already has this badge',
            code: 'BADGE_ALREADY_AWARDED'
          }
        });
      }

      // Award the badge
      const userBadge = await UserBadge.create({
        user_id,
        badge_id,
        earned_date: new Date(),
        awarded_by: req.user.id,
        notes
      });

      // Award tokens if badge has token reward
      if (badge.token_reward > 0) {
        await this.awardTokens(user_id, badge.token_reward, 'badge_earned', badge.id, `Badge earned: ${badge.name}`);
      }

      // Fetch the created user badge with related data
      const createdUserBadge = await UserBadge.findByPk(userBadge.id, {
        include: [
          {
            model: Badge,
            include: [
              {
                model: Course,
                attributes: ['id', 'title', 'category']
              }
            ]
          },
          {
            model: User,
            as: 'awarder',
            attributes: ['id', 'first_name', 'last_name']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Badge awarded successfully',
        data: createdUserBadge
      });
    } catch (err) {
      console.error('Award badge error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to award badge',
          code: 'AWARD_BADGE_ERROR'
        }
      });
    }
  },

  // Award course completion badge (internal method)
  async awardCourseCompletionBadge(userId, courseId, finalScore = null) {
    try {
      // Find badges linked to this course
      const courseBadges = await Badge.findAll({
        where: {
          course_id: courseId,
          is_active: true
        }
      });

      const awardedBadges = [];

      for (const badge of courseBadges) {
        // Check if user already has this badge
        const existingUserBadge = await UserBadge.findOne({
          where: { user_id: userId, badge_id: badge.id }
        });

        if (!existingUserBadge) {
          // Award the badge
          const userBadge = await UserBadge.create({
            user_id: userId,
            badge_id: badge.id,
            earned_date: new Date(),
            awarded_by: null, // System awarded
            notes: `Automatically awarded for completing course. ${finalScore ? `Final score: ${finalScore}%` : ''}`
          });

          // Award tokens if badge has token reward
          if (badge.token_reward > 0) {
            await this.awardTokens(userId, badge.token_reward, 'badge_earned', badge.id, `Badge earned: ${badge.name}`);
          }

          awardedBadges.push(badge);
        }
      }

      return awardedBadges;
    } catch (err) {
      console.error('Award course completion badge error:', err);
      throw err;
    }
  },

  // Helper method to award tokens
  async awardTokens(userId, amount, source, sourceId, description) {
    try {
      // Get or create user tokens record
      let userTokens = await UserToken.findOne({ where: { user_id: userId } });
      if (!userTokens) {
        userTokens = await UserToken.create({
          user_id: userId,
          balance: 0,
          lifetime_earned: 0,
          lifetime_spent: 0
        });
      }

      // Update user tokens
      const newBalance = userTokens.balance + amount;
      const newLifetimeEarned = userTokens.lifetime_earned + amount;

      await userTokens.update({
        balance: newBalance,
        lifetime_earned: newLifetimeEarned,
        last_updated: new Date()
      });

      // Create token transaction
      await TokenTransaction.create({
        user_id: userId,
        transaction_type: 'earned',
        amount,
        source,
        source_id: sourceId,
        description,
        balance_after: newBalance
      });

      return { success: true, newBalance };
    } catch (err) {
      console.error('Award tokens error:', err);
      throw err;
    }
  }
};
