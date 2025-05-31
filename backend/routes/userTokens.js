const express = require('express');
const router = express.Router();
const userTokenController = require('../controllers/userTokenController');

router.get('/', userTokenController.getAllUserTokens);
router.get('/:id', userTokenController.getUserTokenById);
// ...other user token routes (add, spend, leaderboard, etc.)

module.exports = router;
