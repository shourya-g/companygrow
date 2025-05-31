const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-connection');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  stripe_payment_intent_id: { type: DataTypes.STRING(255), unique: true },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
  status: { type: DataTypes.STRING(20) },
  payment_type: { type: DataTypes.STRING(50) },
  item_id: { type: DataTypes.INTEGER },
  item_type: { type: DataTypes.STRING(50) },
  stripe_customer_id: { type: DataTypes.STRING(255) },
  payment_method: { type: DataTypes.STRING(50) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'payments',
  timestamps: false
});

module.exports = Payment;
