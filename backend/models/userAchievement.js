const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const UserAchievement = sequelize.define('UserAchievement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  achievement_id: { type: DataTypes.INTEGER, allowNull: false },
  unlocked_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'user_achievements',
  timestamps: false
});

module.exports = UserAchievement;