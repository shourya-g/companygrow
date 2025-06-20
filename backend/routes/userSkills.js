const express = require('express');
const router = express.Router();
const userSkillController = require('../controllers/userSkillController');
const { auth, requireRole } = require('../middleware/auth');

// Real user skill routes
router.get('/', auth, userSkillController.getAllUserSkills);
router.get('/:id', auth, userSkillController.getUserSkillById);
router.post('/', auth, userSkillController.addUserSkill);
router.put('/:id', auth, userSkillController.updateUserSkill);
router.delete('/:id', auth, userSkillController.deleteUserSkill);

// New routes for enhanced functionality
// @route   GET /api/userSkills/stats/:userId
// @desc    Get user skill statistics
// @access  Private
router.get('/stats/:userId', auth, userSkillController.getUserSkillStats);

// @route   PUT /api/userSkills/bulk-update
// @desc    Bulk update user skills (admin only)
// @access  Private (Admin only)
router.put('/bulk-update', auth, requireRole(['admin']), userSkillController.bulkUpdateUserSkills);

module.exports = router;