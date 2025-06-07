const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validation');

// Public registration route (no auth required)
router.post('/register', userController.registerUser);

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', auth, requireRole(['admin']), userController.getAllUsers);

// @route   GET /api/users/browse
// @desc    Browse user profiles (public info only)
// @access  Private (All authenticated users)
router.get('/browse', auth, userController.browseUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or own profile)
router.get('/:id', auth, userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile)
router.put('/:id', auth, validateUserUpdate, userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', auth, requireRole(['admin']), userController.deleteUser);

// User profile skill management (edit skills from profile)
// @route   POST /api/users/:id/skills
// @desc    Add a skill to the user
// @access  Private (Admin or own profile)
router.post('/:id/skills', auth, async (req, res) => {
  try {
    const userSkillController = require('../controllers/userSkillController');
    const { UserSkill } = require('../models');
    const { id } = req.params;
    
    // Check if user can modify this profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: 'Cannot modify other user skills',
          code: 'UNAUTHORIZED_SKILL_MODIFICATION'
        } 
      });
    }
    
    const { skill_id, proficiency_level, years_experience } = req.body;
    
    if (!skill_id) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'skill_id is required',
          code: 'MISSING_SKILL_ID'
        } 
      });
    }
    
    // Validate proficiency level
    if (proficiency_level && (proficiency_level < 1 || proficiency_level > 5)) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Proficiency level must be between 1 and 5',
          code: 'INVALID_PROFICIENCY_LEVEL'
        } 
      });
    }
    
    // Validate years experience
    if (years_experience && (years_experience < 0 || years_experience > 50)) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Years of experience must be between 0 and 50',
          code: 'INVALID_YEARS_EXPERIENCE'
        } 
      });
    }
    
    // Prevent duplicate user-skill
    const existing = await UserSkill.findOne({ where: { user_id: id, skill_id } });
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: { 
          message: 'User already has this skill',
          code: 'SKILL_ALREADY_EXISTS'
        } 
      });
    }
    
    // Verify skill exists
    const { Skill } = require('../models');
    const skill = await Skill.findByPk(skill_id);
    if (!skill) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          message: 'Skill not found',
          code: 'SKILL_NOT_FOUND'
        } 
      });
    }
    
    req.body.user_id = id;
    return userSkillController.addUserSkill(req, res);
  } catch (err) {
    console.error('Add user skill error:', err);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to add skill',
        code: 'ADD_SKILL_ERROR'
      } 
    });
  }
});

// @route   PUT /api/users/:id/skills/:skillId
// @desc    Update a user's skill (proficiency, years, etc.)
// @access  Private (Admin or own profile)
router.put('/:id/skills/:skillId', auth, async (req, res) => {
  try {
    const { id, skillId } = req.params;
    
    // Check if user can modify this profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: 'Cannot modify other user skills',
          code: 'UNAUTHORIZED_SKILL_MODIFICATION'
        } 
      });
    }
    
    const { proficiency_level, years_experience, is_verified } = req.body;
    
    // Validate proficiency level
    if (proficiency_level && (proficiency_level < 1 || proficiency_level > 5)) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Proficiency level must be between 1 and 5',
          code: 'INVALID_PROFICIENCY_LEVEL'
        } 
      });
    }
    
    // Validate years experience
    if (years_experience && (years_experience < 0 || years_experience > 50)) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Years of experience must be between 0 and 50',
          code: 'INVALID_YEARS_EXPERIENCE'
        } 
      });
    }
    
    // Only admins can verify skills
    if (is_verified !== undefined && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: 'Only admins can verify skills',
          code: 'UNAUTHORIZED_SKILL_VERIFICATION'
        } 
      });
    }
    
    const userSkillController = require('../controllers/userSkillController');
    const { UserSkill } = require('../models');
    
    // Find the userSkill record
    const userSkill = await UserSkill.findOne({ where: { user_id: id, skill_id: skillId } });
    if (!userSkill) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          message: 'User skill not found',
          code: 'USER_SKILL_NOT_FOUND'
        } 
      });
    }
    
    req.params.id = userSkill.id; // set id param for updateUserSkill
    return userSkillController.updateUserSkill(req, res);
  } catch (err) {
    console.error('Update user skill error:', err);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to update skill',
        code: 'UPDATE_SKILL_ERROR'
      } 
    });
  }
});

// @route   DELETE /api/users/:id/skills/:skillId
// @desc    Delete a user's skill
// @access  Private (Admin or own profile)
router.delete('/:id/skills/:skillId', auth, async (req, res) => {
  try {
    const { id, skillId } = req.params;
    
    // Check if user can modify this profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: 'Cannot modify other user skills',
          code: 'UNAUTHORIZED_SKILL_MODIFICATION'
        } 
      });
    }
    
    const userSkillController = require('../controllers/userSkillController');
    const { UserSkill } = require('../models');
    
    const userSkill = await UserSkill.findOne({ where: { user_id: id, skill_id: skillId } });
    if (!userSkill) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          message: 'User skill not found',
          code: 'USER_SKILL_NOT_FOUND'
        } 
      });
    }
    
    req.params.id = userSkill.id;
    return userSkillController.deleteUserSkill(req, res);
  } catch (err) {
    console.error('Delete user skill error:', err);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to delete skill',
        code: 'DELETE_SKILL_ERROR'
      } 
    });
  }
});

// @route   GET /api/users/:id/skills
// @desc    Get all skills for a user (with skill details)
// @access  Private
router.get('/:id/skills', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { User, Skill, UserSkill } = require('../models');
    
    // Check if user can view this profile (more permissive than modification)
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: 'Cannot view other user skills',
          code: 'UNAUTHORIZED_SKILL_VIEW'
        } 
      });
    }
    
    // Find user and include their skills with UserSkill attributes
    const userSkills = await UserSkill.findAll({
      where: { user_id: id },
      include: [
        {
          model: Skill,
          attributes: ['id', 'name', 'category', 'description']
        }
      ],
      attributes: ['proficiency_level', 'years_experience', 'is_verified', 'created_at']
    });
    
    if (!userSkills) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }
    
    // Format the response to include both skill and user_skill data
    const formattedSkills = userSkills.map(userSkill => ({
      id: userSkill.Skill.id,
      name: userSkill.Skill.name,
      category: userSkill.Skill.category,
      description: userSkill.Skill.description,
      proficiency_level: userSkill.proficiency_level,
      years_experience: userSkill.years_experience,
      is_verified: userSkill.is_verified,
      added_at: userSkill.created_at
    }));
    
    res.json({ 
      success: true, 
      data: formattedSkills 
    });
  } catch (err) {
    console.error('Get user skills error:', err);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to fetch user skills',
        code: 'FETCH_USER_SKILLS_ERROR'
      } 
    });
  }
});

// @route   GET /api/users/:id/profile
// @desc    Get user profile with additional info (courses, projects, badges)
// @access  Private
router.get('/:id/profile', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { User, Skill, Course, Project, Badge, CourseEnrollment, ProjectAssignment, UserBadge } = require('../models');
    
    // Check if user can view this profile
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: 'Cannot view other user profiles',
          code: 'UNAUTHORIZED_PROFILE_VIEW'
        } 
      });
    }
    
    // Get user with all related data
    const user = await User.findByPk(id, {
      include: [
        {
          model: Skill,
          through: { 
            attributes: ['proficiency_level', 'years_experience', 'is_verified'] 
          }
        },
        {
          model: CourseEnrollment,
          include: [{ model: Course }],
          attributes: ['status', 'progress_percentage', 'completion_date']
        },
        {
          model: ProjectAssignment,
          include: [{ model: Project }],
          attributes: ['role', 'status', 'hours_worked', 'performance_rating']
        },
        {
          model: Badge,
          through: { 
            attributes: ['earned_date', 'notes'] 
          }
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        } 
      });
    }
    
    // Format user data (remove password)
    const userData = user.toJSON();
    delete userData.password;
    
    res.json({ 
      success: true, 
      data: userData 
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to fetch user profile',
        code: 'FETCH_USER_PROFILE_ERROR'
      } 
    });
  }
});

// @route   GET /api/users/:id/dashboard
// @desc    Get user dashboard data (stats, recent activity)
// @access  Private (Own profile or admin)
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can view this dashboard
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          message: 'Cannot view other user dashboards',
          code: 'UNAUTHORIZED_DASHBOARD_VIEW'
        } 
      });
    }
    
    const { CourseEnrollment, ProjectAssignment, UserBadge, TokenTransaction } = require('../models');
    
    // Get user statistics
    const stats = {
      coursesEnrolled: await CourseEnrollment.count({ where: { user_id: id } }),
      coursesCompleted: await CourseEnrollment.count({ 
        where: { user_id: id, status: 'completed' } 
      }),
      projectsAssigned: await ProjectAssignment.count({ where: { user_id: id } }),
      projectsCompleted: await ProjectAssignment.count({ 
        where: { user_id: id, status: 'completed' } 
      }),
      badgesEarned: await UserBadge.count({ where: { user_id: id } }),
      totalTokensEarned: await TokenTransaction.sum('amount', { 
        where: { 
          user_id: id, 
          transaction_type: 'earned' 
        } 
      }) || 0
    };
    
    // Get recent activity
    const recentCourses = await CourseEnrollment.findAll({
      where: { user_id: id },
      limit: 5,
      order: [['updated_at', 'DESC']],
      include: ['Course']
    });
    
    const recentProjects = await ProjectAssignment.findAll({
      where: { user_id: id },
      limit: 5,
      order: [['updated_at', 'DESC']],
      include: ['Project']
    });
    
    const recentBadges = await UserBadge.findAll({
      where: { user_id: id },
      limit: 5,
      order: [['earned_date', 'DESC']],
      include: ['Badge']
    });
    
    res.json({ 
      success: true, 
      data: {
        stats,
        recent: {
          courses: recentCourses,
          projects: recentProjects,
          badges: recentBadges
        }
      }
    });
  } catch (err) {
    console.error('Get user dashboard error:', err);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to fetch user dashboard',
        code: 'FETCH_USER_DASHBOARD_ERROR'
      } 
    });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate/deactivate user account
// @access  Private (Admin only)
router.put('/:id/activate', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'is_active must be a boolean value',
          code: 'INVALID_ACTIVATION_STATUS'
        } 
      });
    }
    
    const { User } = require('../models');
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        } 
      });
    }
    
    // Prevent self-deactivation
    if (req.user.id === parseInt(id) && !is_active) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Cannot deactivate your own account',
          code: 'SELF_DEACTIVATION_FORBIDDEN'
        } 
      });
    }
    
    await user.update({ is_active });
    
    res.json({ 
      success: true, 
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: { 
        id: user.id, 
        is_active: user.is_active 
      }
    });
  } catch (err) {
    console.error('Activate user error:', err);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Failed to update user activation status',
        code: 'ACTIVATION_UPDATE_ERROR'
      } 
    });
  }
});

module.exports = router;