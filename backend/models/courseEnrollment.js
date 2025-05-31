const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const CourseEnrollment = sequelize.define('CourseEnrollment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  enrollment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  start_date: { type: DataTypes.DATE },
  completion_date: { type: DataTypes.DATE },
  progress_percentage: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING(20), defaultValue: 'enrolled' },
  final_score: { type: DataTypes.INTEGER },
  certificate_url: { type: DataTypes.STRING(500) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'course_enrollments',
  timestamps: false
});

module.exports = CourseEnrollment;
