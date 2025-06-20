const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const LeaderboardSeason = sequelize.define('LeaderboardSeason', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
  prize_description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'leaderboard_seasons',
  timestamps: false
});

module.exports = LeaderboardSeason;