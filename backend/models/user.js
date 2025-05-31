const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  password: { type: DataTypes.STRING(255), allowNull: false },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: false },
  role: { type: DataTypes.STRING(20), defaultValue: 'employee' },
  department: { type: DataTypes.STRING(100) },
  position: { type: DataTypes.STRING(100) },
  hire_date: { type: DataTypes.DATE },
  profile_image: { type: DataTypes.STRING(500) },
  bio: { type: DataTypes.TEXT },
  phone: { type: DataTypes.STRING(20) },
  address: { type: DataTypes.TEXT },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
