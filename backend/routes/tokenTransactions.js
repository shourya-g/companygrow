const express = require('express');
const router = express.Router();
const tokenTransactionController = require('../controllers/tokenTransactionController');

router.get('/', tokenTransactionController.getAllTokenTransactions);
router.get('/:id', tokenTransactionController.getTokenTransactionById);
// ...other token transaction routes (create, filter by type, etc.)

module.exports = router;
