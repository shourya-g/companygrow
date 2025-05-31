const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

// Real badge routes using the new controller
router.get('/', badgeController.getAllBadges);
router.get('/:id', badgeController.getBadgeById);
// ...other badge routes (create, update, delete, etc.)

module.exports = router;
