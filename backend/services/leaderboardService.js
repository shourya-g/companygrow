const { 
    LeaderboardPoint, 
    UserLeaderboardStats, 
    LeaderboardAchievement, 
    UserAchievement,
    User,
    sequelize 
  } = require('../models');
  
  class LeaderboardService {
    
    // Award points to a user
    static async awardPoints(userId, pointsType, pointsEarned, sourceId = null, sourceType = null, description = null) {
      const transaction = await sequelize.transaction();
      
      try {
        // Record the points
        await LeaderboardPoint.create({
          user_id: userId,
          points_type: pointsType,
          points_earned: pointsEarned,
          source_id: sourceId,
          source_type: sourceType,
          description: description
        }, { transaction });
  
        // Update user stats
        await this.updateUserStats(userId, transaction);
        
        // Check for achievements
        await this.checkAchievements(userId, transaction);
        
        // Update rankings
        await this.updateRankings(transaction);
        
        await transaction.commit();
        
        return { success: true, pointsAwarded: pointsEarned };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  
    // Update user leaderboard statistics
    static async updateUserStats(userId, transaction = null) {
      const t = transaction || await sequelize.transaction();
      
      try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentQuarter = Math.ceil(currentMonth / 3);
        const currentYear = currentDate.getFullYear();
        
        // Get or create user stats
        let [userStats] = await UserLeaderboardStats.findOrCreate({
          where: { user_id: userId },
          defaults: {
            user_id: userId,
            current_month: currentMonth,
            current_quarter: currentQuarter,
            current_year: currentYear
          },
          transaction: t
        });
  
        // Calculate total points
        const totalPoints = await LeaderboardPoint.sum('points_earned', {
          where: { user_id: userId },
          transaction: t
        }) || 0;
  
        // Calculate monthly points
        const monthlyPoints = await LeaderboardPoint.sum('points_earned', {
          where: {
            user_id: userId,
            created_at: {
              [sequelize.Op.gte]: new Date(currentYear, currentMonth - 1, 1),
              [sequelize.Op.lt]: new Date(currentYear, currentMonth, 1)
            }
          },
          transaction: t
        }) || 0;
  
        // Calculate quarterly points
        const quarterStartMonth = (currentQuarter - 1) * 3;
        const quarterlyPoints = await LeaderboardPoint.sum('points_earned', {
          where: {
            user_id: userId,
            created_at: {
              [sequelize.Op.gte]: new Date(currentYear, quarterStartMonth, 1),
              [sequelize.Op.lt]: new Date(currentYear, quarterStartMonth + 3, 1)
            }
          },
          transaction: t
        }) || 0;
  
        // Calculate completion counts
        const CourseEnrollment = require('../models/courseEnrollment');
        const ProjectAssignment = require('../models/projectAssignment');
        const UserBadge = require('../models/userBadge');
  
        const coursesCompleted = await CourseEnrollment.count({
          where: { user_id: userId, status: 'completed' },
          transaction: t
        });
  
        const projectsCompleted = await ProjectAssignment.count({
          where: { user_id: userId, status: 'completed' },
          transaction: t
        });
  
        const badgesEarned = await UserBadge.count({
          where: { user_id: userId },
          transaction: t
        });
  
        // Calculate streak
        const streak = await this.calculateStreak(userId, t);
  
        // Reset monthly/quarterly points if period changed
        const resetData = {};
        if (userStats.current_month !== currentMonth) {
          resetData.monthly_points = 0;
          resetData.current_month = currentMonth;
        }
        if (userStats.current_quarter !== currentQuarter) {
          resetData.quarterly_points = 0;
          resetData.current_quarter = currentQuarter;
        }
        if (userStats.current_year !== currentYear) {
          resetData.monthly_points = 0;
          resetData.quarterly_points = 0;
          resetData.current_month = currentMonth;
          resetData.current_quarter = currentQuarter;
          resetData.current_year = currentYear;
        }
  
        // Update user stats
        await userStats.update({
          total_points: totalPoints,
          monthly_points: Object.keys(resetData).length > 0 ? (resetData.monthly_points !== undefined ? resetData.monthly_points : monthlyPoints) : monthlyPoints,
          quarterly_points: Object.keys(resetData).length > 0 ? (resetData.quarterly_points !== undefined ? resetData.quarterly_points : quarterlyPoints) : quarterlyPoints,
          courses_completed: coursesCompleted,
          projects_completed: projectsCompleted,
          badges_earned: badgesEarned,
          current_streak: streak.current,
          longest_streak: Math.max(userStats.longest_streak || 0, streak.current),
          last_activity_date: currentDate.toISOString().split('T')[0],
          last_updated: currentDate,
          ...resetData
        }, { transaction: t });
  
        if (!transaction) {
          await t.commit();
        }
  
        return userStats;
      } catch (error) {
        if (!transaction) {
          await t.rollback();
        }
        throw error;
      }
    }
  
    // Calculate user activity streak
    static async calculateStreak(userId, transaction = null) {
      const points = await LeaderboardPoint.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 365, // Check last year
        transaction
      });
  
      if (points.length === 0) {
        return { current: 0, longest: 0 };
      }
  
      const today = new Date();
      const dates = [...new Set(points.map(p => p.created_at.toISOString().split('T')[0]))];
      
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
  
      for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        
        if (i === 0 && diffDays <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        } else if (i > 0) {
          const prevDate = new Date(dates[i - 1]);
          const daysDiff = Math.floor((prevDate - date) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            tempStreak++;
            if (i === 1 || currentStreak > 0) {
              currentStreak = tempStreak;
            }
          } else {
            if (currentStreak === 0) {
              currentStreak = 0;
            }
            tempStreak = 1;
          }
        }
        
        maxStreak = Math.max(maxStreak, tempStreak);
      }
  
      return { current: currentStreak, longest: maxStreak };
    }
  
    // Check and award achievements
    static async checkAchievements(userId, transaction = null) {
      const t = transaction || await sequelize.transaction();
      
      try {
        const userStats = await UserLeaderboardStats.findOne({
          where: { user_id: userId },
          transaction: t
        });
  
        if (!userStats) return;
  
        const achievements = await LeaderboardAchievement.findAll({
          where: { is_active: true },
          transaction: t
        });
  
        for (const achievement of achievements) {
          // Check if user already has this achievement
          const hasAchievement = await UserAchievement.findOne({
            where: { user_id: userId, achievement_id: achievement.id },
            transaction: t
          });
  
          if (hasAchievement) continue;
  
          let qualifies = false;
  
          switch (achievement.achievement_type) {
            // Add these cases to the switch statement in checkAchievements method
case 'skill_mastery':
  // Check if user has any Level 5 skills
  const { UserSkill } = require('../models');
  const masterySkills = await UserSkill.count({
    where: { 
      user_id: userId, 
      proficiency_level: 5 
    },
    transaction: t
  });
  qualifies = masterySkills >= achievement.criteria_value;
  break;

case 'skill_count':
  const totalSkills = await UserSkill.count({
    where: { user_id: userId },
    transaction: t
  });
  qualifies = totalSkills >= achievement.criteria_value;
  break;

case 'verified_skills':
  const verifiedSkills = await UserSkill.count({
    where: { 
      user_id: userId, 
      is_verified: true 
    },
    transaction: t
  });
  qualifies = verifiedSkills >= achievement.criteria_value;
  break;
            case 'completion':
              if (achievement.name.includes('course')) {
                qualifies = userStats.courses_completed >= achievement.criteria_value;
              } else if (achievement.name.includes('project')) {
                qualifies = userStats.projects_completed >= achievement.criteria_value;
              }
              break;
            case 'points_milestone':
              qualifies = userStats.total_points >= achievement.criteria_value;
              break;
            case 'streak':
              qualifies = userStats.current_streak >= achievement.criteria_value;
              break;
            case 'ranking':
              qualifies = userStats.ranking_position && userStats.ranking_position <= achievement.criteria_value;
              break;
          }
  
          if (qualifies) {
            // Award achievement
            await UserAchievement.create({
              user_id: userId,
              achievement_id: achievement.id
            }, { transaction: t });
  
            // Award bonus points
            if (achievement.points_reward > 0) {
              await LeaderboardPoint.create({
                user_id: userId,
                points_type: 'achievement_bonus',
                points_earned: achievement.points_reward,
                source_id: achievement.id,
                source_type: 'achievement',
                description: `Achievement unlocked: ${achievement.name}`
              }, { transaction: t });
            }
          }
        }
  
        if (!transaction) {
          await t.commit();
        }
      } catch (error) {
        if (!transaction) {
          await t.rollback();
        }
        throw error;
      }
    }
  
    // Update user rankings
    static async updateRankings(transaction = null) {
      const t = transaction || await sequelize.transaction();
      
      try {
        const users = await UserLeaderboardStats.findAll({
          order: [['total_points', 'DESC']],
          transaction: t
        });
  
        for (let i = 0; i < users.length; i++) {
          await users[i].update({
            ranking_position: i + 1
          }, { transaction: t });
        }
  
        if (!transaction) {
          await t.commit();
        }
      } catch (error) {
        if (!transaction) {
          await t.rollback();
        }
        throw error;
      }
    }
  
    // Get leaderboard data
    static async getLeaderboard(period = 'all', limit = 50) {
      let orderField = 'total_points';
      if (period === 'monthly') orderField = 'monthly_points';
      if (period === 'quarterly') orderField = 'quarterly_points';
  
      const leaderboard = await UserLeaderboardStats.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'first_name', 'last_name', 'email', 'department', 'position', 'profile_image']
          }
        ],
        order: [[orderField, 'DESC']],
        limit,
        where: {
          [orderField]: {
            [sequelize.Op.gt]: 0
          }
        }
      });
  
      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        user: entry.User,
        points: entry[orderField],
        totalPoints: entry.total_points,
        coursesCompleted: entry.courses_completed,
        projectsCompleted: entry.projects_completed,
        badgesEarned: entry.badges_earned,
        currentStreak: entry.current_streak,
        longestStreak: entry.longest_streak
      }));
    }
  
    // Get user's leaderboard position
    static async getUserPosition(userId, period = 'all') {
      let orderField = 'total_points';
      if (period === 'monthly') orderField = 'monthly_points';
      if (period === 'quarterly') orderField = 'quarterly_points';
  
      const userStats = await UserLeaderboardStats.findOne({
        where: { user_id: userId },
        include: [
          {
            model: User,
            attributes: ['id', 'first_name', 'last_name', 'department', 'position']
          }
        ]
      });
  
      if (!userStats) return null;
  
      const position = await UserLeaderboardStats.count({
        where: {
          [orderField]: {
            [sequelize.Op.gt]: userStats[orderField]
          }
        }
      });
  
      return {
        rank: position + 1,
        user: userStats.User,
        points: userStats[orderField],
        totalPoints: userStats.total_points,
        coursesCompleted: userStats.courses_completed,
        projectsCompleted: userStats.projects_completed,
        badgesEarned: userStats.badges_earned,
        currentStreak: userStats.current_streak,
        longestStreak: userStats.longest_streak
      };
    }
  }
  
  module.exports = LeaderboardService;