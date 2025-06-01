const { Payment } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
  // POST /api/payments/payout - Create a Stripe payout for the user
  async createPayout(req, res) {
    try {
      const { user_id, amount, currency, stripe_account_id } = req.body;
      if (!user_id || !amount || !stripe_account_id) {
        return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
      }
      // Create a payout to the user's Stripe connected account
      const payout = await stripe.payouts.create({
        amount: Math.round(Number(amount) * 100), // Stripe expects cents
        currency: currency || 'usd',
        destination: stripe_account_id,
        description: `CompanyGrow bonus payout for user ${user_id}`
      });
      // Optionally, record the payout in the Payment table
      await Payment.create({
        user_id,
        amount,
        currency: currency || 'USD',
        status: 'payout_initiated',
        payment_type: 'stripe_payout',
        stripe_payment_intent_id: payout.id
      });
      res.json({ success: true, data: payout });
    } catch (err) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },
  // ...other payment controller methods (create, update, refund, etc.)
};
