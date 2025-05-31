const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const ProjectSkill = sequelize.define('ProjectSkill', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  skill_id: { type: DataTypes.INTEGER, allowNull: false },
  required_level: { type: DataTypes.INTEGER },
  is_mandatory: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'project_skills',
  timestamps: false
});

module.exports = ProjectSkill;
