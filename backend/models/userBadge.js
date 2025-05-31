const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const UserBadge = sequelize.define('UserBadge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  badge_id: { type: DataTypes.INTEGER, allowNull: false },
  earned_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  awarded_by: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'user_badges',
  timestamps: false
});

module.exports = UserBadge;
