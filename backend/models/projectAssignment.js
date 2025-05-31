const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const ProjectAssignment = sequelize.define('ProjectAssignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.STRING(50) },
  assignment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  hours_allocated: { type: DataTypes.INTEGER },
  hours_worked: { type: DataTypes.INTEGER, defaultValue: 0 },
  hourly_rate: { type: DataTypes.DECIMAL(8,2) },
  status: { type: DataTypes.STRING(20), defaultValue: 'active' },
  performance_rating: { type: DataTypes.INTEGER },
  feedback: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'project_assignments',
  timestamps: false
});

module.exports = ProjectAssignment;
