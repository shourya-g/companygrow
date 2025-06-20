const LeaderboardService = require('../services/leaderboardService');
const { 
  UserLeaderboardStats, 
  LeaderboardPoint, 
  LeaderboardAchievement, 
  UserAchievement,
  User 
} = require('../models');

module.exports = {
  // Get main leaderboard
  async getLeaderboard(req, res) {
    try {
      const { period = 'all', limit = 50 } = req.query;
      
      if (!['all', 'monthly', 'quarterly'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid period. Use: all, monthly, or quarterly',
            code: 'INVALID_PERIOD'
          }
        });
      }

      const leaderboard = await LeaderboardService.getLeaderboard(period, parseInt(limit));
      
      res.json({
        success: true,
        data: {
          period,
          leaderboard,
          total_participants: leaderboard.length
        }
      });
    } catch (err) {
      console.error('Get leaderboard error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch leaderboard',
          code: 'FETCH_LEADERBOARD_ERROR'
        }
      });
    }
  },

  // Get user's position on leaderboard
  async getUserPosition(req, res) {
    try {
      const { userId } = req.params;
      const { period = 'all' } = req.query;
      
      // Check if user can view this position
      if (req.user.id !== parseInt(userId) && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot view other user positions',
            code: 'UNAUTHORIZED_VIEW'
          }
        });
      }

      const position = await LeaderboardService.getUserPosition(userId, period);
      
      if (!position) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found on leaderboard',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      res.json({
        success: true,
        data: position
      });
    } catch (err) {
      console.error('Get user position error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch user position',
          code: 'FETCH_POSITION_ERROR'
        }
      });
    }
  },

  // Get leaderboard stats and insights
  async getLeaderboardStats(req, res) {
    try {
      const totalUsers = await UserLeaderboardStats.count();
      const activeUsers = await UserLeaderboardStats.count({
        where: {
          total_points: { [require('sequelize').Op.gt]: 0 }
        }
      });

      const topPerformer = await UserLeaderboardStats.findOne({
        include: [{ model: User, attributes: ['first_name', 'last_name', 'department'] }],
        order: [['total_points', 'DESC']],
        limit: 1
      });

      const averagePoints = await UserLeaderboardStats.findOne({
        attributes: [
          [require('sequelize').fn('AVG', require('sequelize').col('total_points')), 'avg_points']
        ]
      });

      const totalPointsAwarded = await LeaderboardPoint.sum('points_earned');
      
      const achievementStats = await UserAchievement.findAll({
        attributes: [
          'achievement_id',
          [require('sequelize').fn('COUNT', require('sequelize').col('user_id')), 'unlock_count']
        ],
        group: ['achievement_id'],
        include: [{ model: LeaderboardAchievement, attributes: ['name'] }],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('user_id')), 'DESC']],
        limit: 5
      });

      res.json({
        success: true,
        data: {
          overview: {
            total_users: totalUsers,
            active_users: activeUsers,
            participation_rate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
            total_points_awarded: totalPointsAwarded || 0,
            average_points: averagePoints ? Math.round(averagePoints.dataValues.avg_points) : 0
          },
          top_performer: topPerformer ? {
            name: `${topPerformer.User.first_name} ${topPerformer.User.last_name}`,
            department: topPerformer.User.department,
            points: topPerformer.total_points,
            streak: topPerformer.current_streak
          } : null,
          popular_achievements: achievementStats.map(stat => ({
            name: stat.LeaderboardAchievement.name,
            unlock_count: parseInt(stat.dataValues.unlock_count)
          }))
        }
      });
    } catch (err) {
        console.error('Get leaderboard stats error:', err);
        res.status(500).json({
          success: false,
          error: {
            message: 'Failed to fetch leaderboard statistics',
            code: 'FETCH_STATS_ERROR'
          }
        });
      }
    },
   
    // Get user's achievements
    async getUserAchievements(req, res) {
      try {
        const { userId } = req.params;
        
        // Check if user can view these achievements
        if (req.user.id !== parseInt(userId) && !['admin', 'manager'].includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'Cannot view other user achievements',
              code: 'UNAUTHORIZED_VIEW'
            }
          });
        }
   
        const userAchievements = await UserAchievement.findAll({
          where: { user_id: userId },
          include: [{ model: LeaderboardAchievement }],
          order: [['unlocked_at', 'DESC']]
        });
   
        const allAchievements = await LeaderboardAchievement.findAll({
          where: { is_active: true },
          order: [['criteria_value', 'ASC']]
        });
   
        const unlockedIds = userAchievements.map(ua => ua.achievement_id);
        const lockedAchievements = allAchievements.filter(a => !unlockedIds.includes(a.id));
   
        res.json({
          success: true,
          data: {
            unlocked: userAchievements.map(ua => ({
              ...ua.LeaderboardAchievement.toJSON(),
              unlocked_at: ua.unlocked_at
            })),
            locked: lockedAchievements,
            progress: {
              unlocked_count: userAchievements.length,
              total_count: allAchievements.length,
              completion_percentage: allAchievements.length > 0 ? 
                ((userAchievements.length / allAchievements.length) * 100).toFixed(1) : 0
            }
          }
        });
      } catch (err) {
        console.error('Get user achievements error:', err);
        res.status(500).json({
          success: false,
          error: {
            message: 'Failed to fetch user achievements',
            code: 'FETCH_ACHIEVEMENTS_ERROR'
          }
        });
      }
    },
   
    // Get recent activity (points earned)
    async getRecentActivity(req, res) {
      try {
        const { limit = 20 } = req.query;
        
        const recentActivity = await LeaderboardPoint.findAll({
          include: [
            { 
              model: User, 
              attributes: ['id', 'first_name', 'last_name', 'department', 'profile_image'] 
            }
          ],
          order: [['created_at', 'DESC']],
          limit: parseInt(limit)
        });
   
        res.json({
          success: true,
          data: recentActivity.map(activity => ({
            id: activity.id,
            user: activity.User,
            points_earned: activity.points_earned,
            points_type: activity.points_type,
            description: activity.description,
            created_at: activity.created_at
          }))
        });
      } catch (err) {
        console.error('Get recent activity error:', err);
        res.status(500).json({
          success: false,
          error: {
            message: 'Failed to fetch recent activity',
            code: 'FETCH_ACTIVITY_ERROR'
          }
        });
      }
    },
   
    // Award points manually (admin only)
    async awardPoints(req, res) {
      try {
        const { user_id, points_earned, points_type, description } = req.body;
        
        if (!['admin', 'manager'].includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'Only admins and managers can manually award points',
              code: 'UNAUTHORIZED_AWARD'
            }
          });
        }
   
        if (!user_id || !points_earned || !points_type) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'user_id, points_earned, and points_type are required',
              code: 'MISSING_REQUIRED_FIELDS'
            }
          });
        }
   
        if (points_earned <= 0 || points_earned > 10000) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Points must be between 1 and 10000',
              code: 'INVALID_POINTS_AMOUNT'
            }
          });
        }
   
        const result = await LeaderboardService.awardPoints(
          user_id,
          points_type,
          points_earned,
          null,
          'manual',
          description || `Manual points awarded by ${req.user.first_name} ${req.user.last_name}`
        );
   
        res.json({
          success: true,
          message: 'Points awarded successfully',
          data: result
        });
      } catch (err) {
        console.error('Award points error:', err);
        res.status(500).json({
          success: false,
          error: {
            message: 'Failed to award points',
            code: 'AWARD_POINTS_ERROR'
          }
        });
      }
    },
   
    // Get leaderboard for a specific department
    async getDepartmentLeaderboard(req, res) {
      try {
        const { department } = req.params;
        const { period = 'all', limit = 20 } = req.query;
        
        let orderField = 'total_points';
        if (period === 'monthly') orderField = 'monthly_points';
        if (period === 'quarterly') orderField = 'quarterly_points';
   
        const leaderboard = await UserLeaderboardStats.findAll({
          include: [
            {
              model: User,
              attributes: ['id', 'first_name', 'last_name', 'email', 'department', 'position', 'profile_image'],
              where: { department: department }
            }
          ],
          order: [[orderField, 'DESC']],
          limit: parseInt(limit),
          where: {
            [orderField]: { [require('sequelize').Op.gt]: 0 }
          }
        });
   
        const formattedLeaderboard = leaderboard.map((entry, index) => ({
          rank: index + 1,
          user: entry.User,
          points: entry[orderField],
          totalPoints: entry.total_points,
          coursesCompleted: entry.courses_completed,
          projectsCompleted: entry.projects_completed,
          badgesEarned: entry.badges_earned,
          currentStreak: entry.current_streak
        }));
   
        res.json({
          success: true,
          data: {
            department,
            period,
            leaderboard: formattedLeaderboard,
            total_participants: formattedLeaderboard.length
          }
        });
      } catch (err) {
        console.error('Get department leaderboard error:', err);
        res.status(500).json({
          success: false,
          error: {
            message: 'Failed to fetch department leaderboard',
            code: 'FETCH_DEPT_LEADERBOARD_ERROR'
          }
        });
      }
    }
   };