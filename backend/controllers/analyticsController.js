// backend/controllers/analyticsController.js
const { User, Project, Skill, Course, Payment, TokenTransaction, UserSkill, CourseEnrollment, ProjectAssignment, UserBadge, Badge } = require('../models');
const { Op } = require('sequelize');

// Get overall user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const usersByDepartment = await User.findAll({
      attributes: ['department', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
      where: { 
        department: { [Op.not]: null },
        is_active: true
      },
      group: ['department'],
      raw: true
    });
    const usersByRole = await User.findAll({
      attributes: ['role', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
      where: { is_active: true },
      group: ['role'],
      raw: true
    });
    
    res.json({ 
      success: true,
      data: {
        totalUsers, 
        activeUsers,
        usersByDepartment,
        usersByRole
      }
    });
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch user stats', details: err.message }
    });
  }
};

// Get project statistics
exports.getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const completedProjects = await Project.count({ where: { status: 'completed' } });
    const activeProjects = await Project.count({ where: { status: 'active' } });
    const projectsByStatus = await Project.findAll({
      attributes: ['status', [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });
    const projectsByPriority = await Project.findAll({
      attributes: ['priority', [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']],
      where: { priority: { [Op.not]: null } },
      group: ['priority'],
      raw: true
    });
    
    res.json({ 
      success: true,
      data: {
        totalProjects, 
        completedProjects,
        activeProjects,
        projectsByStatus,
        projectsByPriority
      }
    });
  } catch (err) {
    console.error('Get project stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch project stats', details: err.message }
    });
  }
};

// Get skill distribution
exports.getSkillDistribution = async (req, res) => {
  try {
    const skillsByCategory = await Skill.findAll({
      attributes: ['category', [Skill.sequelize.fn('COUNT', Skill.sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true
    });
    
    const topSkills = await UserSkill.findAll({
      attributes: [
        'skill_id',
        [UserSkill.sequelize.fn('COUNT', UserSkill.sequelize.col('user_id')), 'user_count'],
        [UserSkill.sequelize.fn('AVG', UserSkill.sequelize.col('proficiency_level')), 'avg_proficiency']
      ],
      include: [{
        model: Skill,
        attributes: ['name', 'category']
      }],
      group: ['skill_id', 'Skill.id', 'Skill.name', 'Skill.category'],
      order: [[UserSkill.sequelize.fn('COUNT', UserSkill.sequelize.col('user_id')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    res.json({ 
      success: true,
      data: {
        skillsByCategory,
        topSkills
      }
    });
  } catch (err) {
    console.error('Get skill distribution error:', err);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch skill distribution', details: err.message }
    });
  }
};

// Get course enrollment stats
exports.getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.count();
    const activeCourses = await Course.count({ where: { is_active: true } });
    const totalEnrollments = await CourseEnrollment.count();
    const completedEnrollments = await CourseEnrollment.count({ where: { status: 'completed' } });
    
    const coursesByCategory = await Course.findAll({
      attributes: ['category', [Course.sequelize.fn('COUNT', Course.sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true
    });
    
    const popularCourses = await CourseEnrollment.findAll({
      attributes: [
        'course_id',
        [CourseEnrollment.sequelize.fn('COUNT', CourseEnrollment.sequelize.col('user_id')), 'enrollment_count']
      ],
      include: [{
        model: Course,
        attributes: ['title', 'category']
      }],
      group: ['course_id', 'Course.id', 'Course.title', 'Course.category'],
      order: [[CourseEnrollment.sequelize.fn('COUNT', CourseEnrollment.sequelize.col('user_id')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    res.json({ 
      success: true,
      data: {
        totalCourses,
        activeCourses,
        totalEnrollments,
        completedEnrollments,
        completionRate: totalEnrollments > 0 ? ((completedEnrollments / totalEnrollments) * 100).toFixed(2) : 0,
        coursesByCategory,
        popularCourses
      }
    });
  } catch (err) {
    console.error('Get course stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch course stats', details: err.message }
    });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.count();
    const totalAmount = await Payment.sum('amount') || 0;
    const successfulPayments = await Payment.count({ where: { status: 'succeeded' } });
    const paymentsByStatus = await Payment.findAll({
      attributes: ['status', [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });
    
    res.json({ 
      success: true,
      data: {
        totalPayments,
        totalAmount: parseFloat(totalAmount).toFixed(2),
        successfulPayments,
        successRate: totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(2) : 0,
        paymentsByStatus
      }
    });
  } catch (err) {
    console.error('Get payment stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch payment stats', details: err.message }
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
    
    const tokensByType = await TokenTransaction.findAll({
      attributes: ['transaction_type', [TokenTransaction.sequelize.fn('SUM', TokenTransaction.sequelize.col('amount')), 'total']],
      group: ['transaction_type'],
      raw: true
    });
    
    res.json({ 
      success: true,
      data: {
        totalTransactions,
        totalTokensEarned,
        totalTokensSpent,
        netTokens: totalTokensEarned - Math.abs(totalTokensSpent),
        tokensByType
      }
    });
  } catch (err) {
    console.error('Get token stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch token stats', details: err.message }
    });
  }
};

// Get badge statistics
exports.getBadgeStats = async (req, res) => {
  try {
    const totalBadges = await Badge.count();
    const totalAwarded = await UserBadge.count();
    const badgesByRarity = await Badge.findAll({
      attributes: ['rarity', [Badge.sequelize.fn('COUNT', Badge.sequelize.col('id')), 'count']],
      where: { rarity: { [Op.not]: null } },
      group: ['rarity'],
      raw: true
    });
    
    const popularBadges = await UserBadge.findAll({
      attributes: [
        'badge_id',
        [UserBadge.sequelize.fn('COUNT', UserBadge.sequelize.col('user_id')), 'awarded_count']
      ],
      include: [{
        model: Badge,
        attributes: ['name', 'badge_type', 'rarity']
      }],
      group: ['badge_id', 'Badge.id', 'Badge.name', 'Badge.badge_type', 'Badge.rarity'],
      order: [[UserBadge.sequelize.fn('COUNT', UserBadge.sequelize.col('user_id')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    res.json({ 
      success: true,
      data: {
        totalBadges,
        totalAwarded,
        badgesByRarity,
        popularBadges
      }
    });
  } catch (err) {
    console.error('Get badge stats error:', err);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch badge stats', details: err.message }
    });
  }
};

// Get comprehensive analytics report data
exports.getComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    // User growth over time
    const userGrowth = await User.findAll({
      attributes: [
        [User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('created_at')), 'month'],
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      where: dateFilter,
      group: [User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('created_at'))],
      order: [[User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    // Course completion trends
    const courseCompletions = await CourseEnrollment.findAll({
      attributes: [
        [CourseEnrollment.sequelize.fn('DATE_TRUNC', 'month', CourseEnrollment.sequelize.col('completion_date')), 'month'],
        [CourseEnrollment.sequelize.fn('COUNT', CourseEnrollment.sequelize.col('id')), 'count']
      ],
      where: { 
        status: 'completed',
        completion_date: { [Op.not]: null },
        ...(startDate && endDate ? { completion_date: { [Op.between]: [new Date(startDate), new Date(endDate)] } } : {})
      },
      group: [CourseEnrollment.sequelize.fn('DATE_TRUNC', 'month', CourseEnrollment.sequelize.col('completion_date'))],
      order: [[CourseEnrollment.sequelize.fn('DATE_TRUNC', 'month', CourseEnrollment.sequelize.col('completion_date')), 'ASC']],
      raw: true
    });
    
    // Project completion trends
    const projectCompletions = await Project.findAll({
      attributes: [
        [Project.sequelize.fn('DATE_TRUNC', 'month', Project.sequelize.col('updated_at')), 'month'],
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      where: { 
        status: 'completed',
        ...(startDate && endDate ? { updated_at: { [Op.between]: [new Date(startDate), new Date(endDate)] } } : {})
      },
      group: [Project.sequelize.fn('DATE_TRUNC', 'month', Project.sequelize.col('updated_at'))],
      order: [[Project.sequelize.fn('DATE_TRUNC', 'month', Project.sequelize.col('updated_at')), 'ASC']],
      raw: true
    });
    
    // Token earning trends
    const tokenEarnings = await TokenTransaction.findAll({
      attributes: [
        [TokenTransaction.sequelize.fn('DATE_TRUNC', 'month', TokenTransaction.sequelize.col('created_at')), 'month'],
        [TokenTransaction.sequelize.fn('SUM', TokenTransaction.sequelize.col('amount')), 'total']
      ],
      where: { 
        transaction_type: 'earned',
        ...(startDate && endDate ? { created_at: { [Op.between]: [new Date(startDate), new Date(endDate)] } } : {})
      },
      group: [TokenTransaction.sequelize.fn('DATE_TRUNC', 'month', TokenTransaction.sequelize.col('created_at'))],
      order: [[TokenTransaction.sequelize.fn('DATE_TRUNC', 'month', TokenTransaction.sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    // Department performance
    const departmentPerformance = await User.findAll({
      attributes: [
        'department',
        [User.sequelize.fn('COUNT', User.sequelize.col('User.id')), 'user_count']
      ],
      where: { 
        department: { [Op.not]: null },
        is_active: true
      },
      group: ['User.department'],
      order: [[User.sequelize.fn('COUNT', User.sequelize.col('User.id')), 'DESC']],
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        userGrowth,
        courseCompletions,
        projectCompletions,
        tokenEarnings,
        departmentPerformance,
        reportGenerated: new Date(),
        dateRange: { startDate, endDate }
      }
    });
  } catch (err) {
    console.error('Get comprehensive report error:', err);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to generate comprehensive report', details: err.message }
    });
  }
};