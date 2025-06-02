const express = require('express');
const router = express.Router();
const userSkillController = require('../controllers/userSkillController');

// Real user skill routes
router.get('/', userSkillController.getAllUserSkills);
router.get('/:id', userSkillController.getUserSkillById);
router.post('/', userSkillController.addUserSkill);
router.put('/:id', userSkillController.updateUserSkill);
router.delete('/:id', userSkillController.deleteUserSkill);

module.exports = router;
