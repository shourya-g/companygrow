const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const UserToken = sequelize.define('UserToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  balance: { type: DataTypes.INTEGER, defaultValue: 0 },
  lifetime_earned: { type: DataTypes.INTEGER, defaultValue: 0 },
  lifetime_spent: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'user_tokens',
  timestamps: false
});

module.exports = UserToken;
