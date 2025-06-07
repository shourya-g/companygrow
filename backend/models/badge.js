const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const Badge = sequelize.define('Badge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  badge_type: { type: DataTypes.STRING(50) },
  criteria: { type: DataTypes.TEXT },
  badge_image: { type: DataTypes.STRING(500) },
  token_reward: { type: DataTypes.INTEGER, defaultValue: 0 },
  rarity: { type: DataTypes.STRING(20) },
  course_id: { type: DataTypes.INTEGER },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'badges',
  timestamps: false
});

module.exports = Badge;
