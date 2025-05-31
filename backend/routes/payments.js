const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Example payment routes (expand as needed)
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
// ...other payment routes (create, confirm, refund, etc.)

module.exports = router;
