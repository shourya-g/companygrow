const { User } = require('../models');

module.exports = {
  async getAllUsers(req, res) {
    // TODO: Add admin check
    const users = await User.findAll();
    res.json({ success: true, data: users });
  },
  async getUserById(req, res) {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    res.json({ success: true, data: user });
  },
  // ...other user controller methods (register, login, update, delete, etc.)
};
