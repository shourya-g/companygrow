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
  // ...other user skill controller methods (add, update, remove, verify, etc.)
};
