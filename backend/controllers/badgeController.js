const { Badge } = require('../models');

module.exports = {
  async getAllBadges(req, res) {
    const badges = await Badge.findAll();
    res.json({ success: true, data: badges });
  },
  async getBadgeById(req, res) {
    const badge = await Badge.findByPk(req.params.id);
    if (!badge) return res.status(404).json({ success: false, error: { message: 'Badge not found' } });
    res.json({ success: true, data: badge });
  },
  // ...other badge controller methods (create, update, delete, etc.)
};
