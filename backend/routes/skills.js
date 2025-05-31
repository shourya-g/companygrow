const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

router.get('/', skillController.getAllSkills);
router.get('/:id', skillController.getSkillById);
// ...other skill routes (create, update, delete, search, etc.)

module.exports = router;
