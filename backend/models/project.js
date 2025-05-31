const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  project_type: { type: DataTypes.STRING(50) },
  status: { type: DataTypes.STRING(20), defaultValue: 'planning' },
  priority: { type: DataTypes.STRING(10) },
  start_date: { type: DataTypes.DATE },
  end_date: { type: DataTypes.DATE },
  estimated_hours: { type: DataTypes.INTEGER },
  actual_hours: { type: DataTypes.INTEGER, defaultValue: 0 },
  budget: { type: DataTypes.DECIMAL(12,2) },
  client_name: { type: DataTypes.STRING(100) },
  project_manager_id: { type: DataTypes.INTEGER },
  created_by: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'projects',
  timestamps: false
});

module.exports = Project;
