const { Payment } = require('../models');

module.exports = {
  async getAllPayments(req, res) {
    const payments = await Payment.findAll();
    res.json({ success: true, data: payments });
  },
  async getPaymentById(req, res) {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
    res.json({ success: true, data: payment });
  },
  // ...other payment controller methods (create, update, refund, etc.)
};
