const express = require('express');
const router = express.Router();
const appSettingController = require('../controllers/appSettingController');

router.get('/', appSettingController.getAllSettings);
router.get('/:key', appSettingController.getSettingByKey);
// ...other app setting routes (create, update, delete, etc.)

module.exports = router;
