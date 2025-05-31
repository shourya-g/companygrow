const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Real user routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
// ...other user routes (register, login, update, delete, etc.)

module.exports = router;
