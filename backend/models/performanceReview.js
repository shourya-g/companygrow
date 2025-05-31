const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const PerformanceReview = sequelize.define('PerformanceReview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  reviewer_id: { type: DataTypes.INTEGER },
  review_period_start: { type: DataTypes.DATE },
  review_period_end: { type: DataTypes.DATE },
  overall_rating: { type: DataTypes.INTEGER },
  technical_skills_rating: { type: DataTypes.INTEGER },
  communication_rating: { type: DataTypes.INTEGER },
  teamwork_rating: { type: DataTypes.INTEGER },
  leadership_rating: { type: DataTypes.INTEGER },
  achievements: { type: DataTypes.TEXT },
  areas_for_improvement: { type: DataTypes.TEXT },
  goals_next_period: { type: DataTypes.TEXT },
  reviewer_comments: { type: DataTypes.TEXT },
  employee_comments: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(20), defaultValue: 'draft' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'performance_reviews',
  timestamps: false
});

module.exports = PerformanceReview;
