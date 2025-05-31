const { UserToken } = require('../models');

module.exports = {
  async getAllUserTokens(req, res) {
    const tokens = await UserToken.findAll();
    res.json({ success: true, data: tokens });
  },
  async getUserTokenById(req, res) {
    const token = await UserToken.findByPk(req.params.id);
    if (!token) return res.status(404).json({ success: false, error: { message: 'User token not found' } });
    res.json({ success: true, data: token });
  },
  // ...other user token controller methods (add, spend, leaderboard, etc.)
};
