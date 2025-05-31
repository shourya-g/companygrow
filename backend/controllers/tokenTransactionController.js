const { TokenTransaction } = require('../models');

module.exports = {
  async getAllTokenTransactions(req, res) {
    const transactions = await TokenTransaction.findAll();
    res.json({ success: true, data: transactions });
  },
  async getTokenTransactionById(req, res) {
    const transaction = await TokenTransaction.findByPk(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, error: { message: 'Token transaction not found' } });
    res.json({ success: true, data: transaction });
  },
  // ...other token transaction controller methods (create, filter by type, etc.)
};
