const { Skill } = require('../models');

module.exports = {
  async getAllSkills(req, res) {
    const skills = await Skill.findAll();
    res.json({ success: true, data: skills });
  },
  async getSkillById(req, res) {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) return res.status(404).json({ success: false, error: { message: 'Skill not found' } });
    res.json({ success: true, data: skill });
  },
  // ...other skill controller methods (create, update, delete, search, etc.)
};
