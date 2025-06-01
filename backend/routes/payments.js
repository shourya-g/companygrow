const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Example payment routes (expand as needed)
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
// POST /api/payments/payout - Initiate a Stripe payout
router.post('/payout', paymentController.createPayout);
// ...other payment routes (create, confirm, refund, etc.)

module.exports = router;
