const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING(50), allowNull: false },
  difficulty_level: { type: DataTypes.STRING(20) },
  duration_hours: { type: DataTypes.INTEGER },
  instructor_name: { type: DataTypes.STRING(100) },
  instructor_bio: { type: DataTypes.TEXT },
  course_image: { type: DataTypes.STRING(500) },
  video_url: { type: DataTypes.STRING(500) },
  course_materials: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  prerequisites: { type: DataTypes.TEXT },
  learning_objectives: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  price: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  created_by: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'courses',
  timestamps: false
});

module.exports = Course;
