const express = require('express');
const router = express.Router();
const userSkillController = require('../controllers/userSkillController');

// Real user skill routes
router.get('/', userSkillController.getAllUserSkills);
router.get('/:id', userSkillController.getUserSkillById);
// ...other user skill routes (add, update, remove, verify, etc.)

module.exports = router;
