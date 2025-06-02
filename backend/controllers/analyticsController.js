// backend/controllers/analyticsController.js
const { User, Project, Skill, Course, Payment, TokenTransaction } = require('../models');

// Get overall user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    res.json({ totalUsers, activeUsers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user stats', details: err.message });
  }
};

// Get project statistics
exports.getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const completedProjects = await Project.count({ where: { status: 'completed' } });
    res.json({ totalProjects, completedProjects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project stats', details: err.message });
  }
};

// Get skill distribution
exports.getSkillDistribution = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      attributes: ['name'],
      include: [{ model: User, as: 'users', attributes: ['id'] }]
    });
    const distribution = skills.map(skill => ({
      skill: skill.name,
      userCount: skill.users ? skill.users.length : 0
    }));
    res.json({ distribution });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skill distribution', details: err.message });
  }
};

// Get course enrollment stats
exports.getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.count();
    // Optionally, add more course analytics here
    res.json({ totalCourses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course stats', details: err.message });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.count();
    const totalAmount = await Payment.sum('amount');
    res.json({ totalPayments, totalAmount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment stats', details: err.message });
  }
};

// Get token transaction statistics
exports.getTokenStats = async (req, res) => {
  try {
    const totalTransactions = await TokenTransaction.count();
    const totalTokens = await TokenTransaction.sum('amount');
    res.json({ totalTransactions, totalTokens });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch token stats', details: err.message });
  }
};
