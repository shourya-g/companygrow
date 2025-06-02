const { UserSkill } = require('../models');

module.exports = {
  async getAllUserSkills(req, res) {
    const userSkills = await UserSkill.findAll();
    res.json({ success: true, data: userSkills });
  },
  async getUserSkillById(req, res) {
    const userSkill = await UserSkill.findByPk(req.params.id);
    if (!userSkill) return res.status(404).json({ success: false, error: { message: 'UserSkill not found' } });
    res.json({ success: true, data: userSkill });
  },
  async addUserSkill(req, res) {
    try {
      const { user_id, skill_id, proficiency_level, years_experience } = req.body;
      if (!user_id || !skill_id) {
        return res.status(400).json({ success: false, error: 'user_id and skill_id are required' });
      }
      // Prevent duplicate user-skill at the DB level
      const existing = await UserSkill.findOne({ where: { user_id, skill_id } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'User already has this skill' });
      }
      const userSkill = await UserSkill.create({ user_id, skill_id, proficiency_level, years_experience });
      res.status(201).json({ success: true, data: userSkill });
    } catch (err) {
      // Handle unique constraint error gracefully
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, error: 'User already has this skill' });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async updateUserSkill(req, res) {
    try {
      const { id } = req.params;
      const { proficiency_level, years_experience, is_verified } = req.body;
      const userSkill = await UserSkill.findByPk(id);
      if (!userSkill) return res.status(404).json({ success: false, error: 'UserSkill not found' });
      await userSkill.update({ proficiency_level, years_experience, is_verified });
      res.json({ success: true, data: userSkill });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async deleteUserSkill(req, res) {
    try {
      const { id } = req.params;
      const userSkill = await UserSkill.findByPk(id);
      if (!userSkill) return res.status(404).json({ success: false, error: 'UserSkill not found' });
      await userSkill.destroy();
      res.json({ success: true, message: 'UserSkill deleted' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
