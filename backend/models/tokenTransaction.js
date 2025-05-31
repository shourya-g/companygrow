const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const TokenTransaction = sequelize.define('TokenTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  transaction_type: { type: DataTypes.STRING(20) },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  source: { type: DataTypes.STRING(50) },
  source_id: { type: DataTypes.INTEGER },
  description: { type: DataTypes.TEXT },
  balance_after: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'token_transactions',
  timestamps: false
});

module.exports = TokenTransaction;
