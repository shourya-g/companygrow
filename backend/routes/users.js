const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Real user routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/reset-password', userController.resetPassword); // Password reset route

// User profile skill management (edit skills from profile)
// Add a skill to the user
// POST /api/users/:id/skills
router.post('/:id/skills', async (req, res) => {
  const userSkillController = require('../controllers/userSkillController');
  const { UserSkill } = require('../models');
  const { id } = req.params;
  const { skill_id, proficiency_level, years_experience } = req.body;
  // Prevent duplicate user-skill
  const existing = await UserSkill.findOne({ where: { user_id: id, skill_id } });
  if (existing) {
    return res.status(409).json({ success: false, error: 'User already has this skill' });
  }
  req.body.user_id = id;
  return userSkillController.addUserSkill(req, res);
});
// Update a user's skill (proficiency, years, etc.)
// PUT /api/users/:id/skills/:skillId
router.put('/:id/skills/:skillId', async (req, res) => {
  // Find the userSkill by user_id and skill_id
  const { id, skillId } = req.params;
  const userSkillController = require('../controllers/userSkillController');
  // Find the userSkill record
  const { UserSkill } = require('../models');
  const userSkill = await UserSkill.findOne({ where: { user_id: id, skill_id: skillId } });
  if (!userSkill) return res.status(404).json({ success: false, error: 'UserSkill not found' });
  req.params.id = userSkill.id; // set id param for updateUserSkill
  return userSkillController.updateUserSkill(req, res);
});
// Delete a user's skill
// DELETE /api/users/:id/skills/:skillId
router.delete('/:id/skills/:skillId', async (req, res) => {
  const { id, skillId } = req.params;
  const userSkillController = require('../controllers/userSkillController');
  const { UserSkill } = require('../models');
  const userSkill = await UserSkill.findOne({ where: { user_id: id, skill_id: skillId } });
  if (!userSkill) return res.status(404).json({ success: false, error: 'UserSkill not found' });
  req.params.id = userSkill.id;
  return userSkillController.deleteUserSkill(req, res);
});
// Get all skills for a user (with skill details)
router.get('/:id/skills', async (req, res) => {
  const { id } = req.params;
  const { User, Skill } = require('../models');
  try {
    // Find user and include their skills (with join table fields if needed)
    const user = await User.findByPk(id, {
      include: [{
        model: Skill,
        through: { attributes: [] } // omit join table fields, or include as needed
      }]
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user.Skills });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
