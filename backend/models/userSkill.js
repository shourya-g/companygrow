const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const UserSkill = sequelize.define('UserSkill', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  skill_id: { type: DataTypes.INTEGER, allowNull: false },
  proficiency_level: { type: DataTypes.INTEGER },
  years_experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'user_skills',
  timestamps: false
});

module.exports = UserSkill;
