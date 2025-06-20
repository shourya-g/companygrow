const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const LeaderboardPoint = sequelize.define('LeaderboardPoint', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  points_type: { type: DataTypes.STRING(50), allowNull: false },
  points_earned: { type: DataTypes.INTEGER, allowNull: false },
  source_id: { type: DataTypes.INTEGER },
  source_type: { type: DataTypes.STRING(50) },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'leaderboard_points',
  timestamps: false
});

module.exports = LeaderboardPoint;