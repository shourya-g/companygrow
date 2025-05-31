const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const Skill = sequelize.define('Skill', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  category: { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'skills',
  timestamps: false
});

module.exports = Skill;
