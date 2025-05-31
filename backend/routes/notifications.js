const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getAllNotifications);
router.get('/:id', notificationController.getNotificationById);
// ...other notification routes (create, update, delete, mark as read, etc.)

module.exports = router;
