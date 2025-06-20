const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const LeaderboardAchievement = sequelize.define('LeaderboardAchievement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  achievement_type: { type: DataTypes.STRING(50) },
  criteria_value: { type: DataTypes.INTEGER },
  badge_image: { type: DataTypes.STRING(500) },
  points_reward: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'leaderboard_achievements',
  timestamps: false
});

module.exports = LeaderboardAchievement;