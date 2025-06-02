const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

module.exports = {
  async getAllUsers(req, res) {
    // TODO: Add admin check
    const users = await User.findAll();
    res.json({ success: true, data: users });
  },
  async getUserById(req, res) {
    // Use unscoped to ensure all fields are available
    const user = await User.scope(null).findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    const userObj = user.toJSON ? user.toJSON() : user;
    delete userObj.password;
    res.json({ success: true, data: userObj });
  },
  async registerUser(req, res) {
    try {
      const { email, password, first_name, last_name } = req.body;
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Email already registered' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ email, password: hashed, first_name, last_name });
      // Do NOT attach any skills on registration
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const userObj = user.toJSON ? user.toJSON() : user;
      delete userObj.password;
      res.json({ user: userObj, token });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.scope(null).findOne({ where: { email } });
      if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const userObj = user.toJSON ? user.toJSON() : user;
      delete userObj.password;
      res.json({ user: userObj, token });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async updateUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      const { password, ...rest } = req.body;
      if (password) {
        rest.password = await bcrypt.hash(password, 10);
      }
      await user.update(rest);
      res.json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async deleteUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      await user.destroy();
      res.json({ success: true, message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ success: false, error: 'Email and new password are required' });
      }
      const user = await User.scope(null).findOne({ where: { email } });
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
