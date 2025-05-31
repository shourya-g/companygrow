const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const CourseSkill = sequelize.define('CourseSkill', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  skill_id: { type: DataTypes.INTEGER, allowNull: false },
  skill_level: { type: DataTypes.INTEGER },
}, {
  tableName: 'course_skills',
  timestamps: false
});

module.exports = CourseSkill;
