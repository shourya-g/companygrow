const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const AppSetting = sequelize.define('AppSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  setting_key: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  setting_value: { type: DataTypes.TEXT },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'app_settings',
  timestamps: false
});

module.exports = AppSetting;
