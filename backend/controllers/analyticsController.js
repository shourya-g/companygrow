// backend/controllers/analyticsController.js
const { User, Project, Skill, Course, Payment, TokenTransaction, CourseEnrollment } = require('../models');

// Get overall user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    
    res.json({ 
      success: true, 
      data: { 
        totalUsers, 
        activeUsers 
      } 
    });
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'Failed to fetch user stats', 
        code: 'FETCH_USER_STATS_ERROR'
      } 
    });
  }
};

// Get project statistics
exports.getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'active' } });
    const completedProjects = await Project.count({ where: { status: 'completed' } });
    
    res.json({ 
      success: true,
      data: { 
        totalProjects, 
        activeProjects,
        completedProjects 
      } 
    });
  } catch (err) {
    console.error('Get project stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'Failed to fetch project stats', 
        code: 'FETCH_PROJECT_STATS_ERROR'
      } 
    });
  }
};

// Get skill distribution
exports.getSkillDistribution = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      attributes: ['id', 'name', 'category'],
      include: [{
        model: User,
        through: { attributes: [] },
        attributes: []
      }]
    });
    
    const distribution = skills.map(skill => ({
      skill: skill.name,
      category: skill.category,
      userCount: skill.Users ? skill.Users.length : 0
    }));
    
    res.json({ 
      success: true,
      data: { distribution } 
    });
  } catch (err) {
    console.error('Get skill distribution error:', err);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'Failed to fetch skill distribution', 
        code: 'FETCH_SKILL_DISTRIBUTION_ERROR'
      } 
    });
  }
};

// Get course enrollment stats
exports.getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.count();
    const activeCourses = await Course.count({ where: { is_active: true } });
    const totalEnrollments = await CourseEnrollment.count();
    const completedEnrollments = await CourseEnrollment.count({ 
      where: { status: 'completed' } 
    });
    
    res.json({ 
      success: true,
      data: { 
        totalCourses, 
        activeCourses,
        totalEnrollments,
        completedEnrollments,
        completionRate: totalEnrollments > 0 ? 
          Math.round((completedEnrollments / totalEnrollments) * 100) : 0
      } 
    });
  } catch (err) {
    console.error('Get course stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'Failed to fetch course stats', 
        code: 'FETCH_COURSE_STATS_ERROR'
      } 
    });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.count();
    const totalAmount = await Payment.sum('amount') || 0;
    const successfulPayments = await Payment.count({ 
      where: { status: 'succeeded' } 
    });
    
    res.json({ 
      success: true,
      data: { 
        totalPayments, 
        totalAmount: parseFloat(totalAmount).toFixed(2),
        successfulPayments,
        successRate: totalPayments > 0 ? 
          Math.round((successfulPayments / totalPayments) * 100) : 0
      } 
    });
  } catch (err) {
    console.error('Get payment stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'Failed to fetch payment stats', 
        code: 'FETCH_PAYMENT_STATS_ERROR'
      } 
    });
  }
};

// Get token transaction statistics
exports.getTokenStats = async (req, res) => {
  try {
    const totalTransactions = await TokenTransaction.count();
    const totalTokensEarned = await TokenTransaction.sum('amount', {
      where: { transaction_type: 'earned' }
    }) || 0;
    const totalTokensSpent = await TokenTransaction.sum('amount', {
      where: { transaction_type: 'spent' }
    }) || 0;
    
    res.json({ 
      success: true,
      data: { 
        totalTransactions, 
        totalTokensEarned,
        totalTokensSpent,
        activeTokens: totalTokensEarned - totalTokensSpent
      } 
    });
  } catch (err) {
    console.error('Get token stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'Failed to fetch token stats', 
        code: 'FETCH_TOKEN_STATS_ERROR'
      } 
    });
  }
};

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    // Get basic stats
    const totalUsers = await User.count();
    const totalCourses = await Course.count({ where: { is_active: true } });
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'active' } });
    
    // Get recent activity
    const recentCourses = await Course.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['first_name', 'last_name']
      }]
    });

    const recentProjects = await Project.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        as: 'manager',
        attributes: ['first_name', 'last_name']
      }]
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCourses,
          totalProjects,
          activeProjects
        },
        recentCourses,
        recentProjects
      }
    });
  } catch (err) {
    console.error('Get dashboard overview error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch dashboard overview',
        code: 'FETCH_DASHBOARD_OVERVIEW_ERROR'
      }
    });
  }
};