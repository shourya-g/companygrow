const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const UserLeaderboardStats = sequelize.define('UserLeaderboardStats', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  total_points: { type: DataTypes.INTEGER, defaultValue: 0 },
  monthly_points: { type: DataTypes.INTEGER, defaultValue: 0 },
  quarterly_points: { type: DataTypes.INTEGER, defaultValue: 0 },
  courses_completed: { type: DataTypes.INTEGER, defaultValue: 0 },
  projects_completed: { type: DataTypes.INTEGER, defaultValue: 0 },
  badges_earned: { type: DataTypes.INTEGER, defaultValue: 0 },
  current_streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  longest_streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_activity_date: { type: DataTypes.DATEONLY },
  current_month: { type: DataTypes.INTEGER },
  current_quarter: { type: DataTypes.INTEGER },
  current_year: { type: DataTypes.INTEGER },
  ranking_position: { type: DataTypes.INTEGER },
  last_updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'user_leaderboard_stats',
  timestamps: false
});

module.exports = UserLeaderboardStats;