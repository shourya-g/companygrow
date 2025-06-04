const { CourseSkill, Course, Skill } = require('../models');

module.exports = {
  // Get all course skills
  async getAllCourseSkills(req, res) {
    try {
      const courseSkills = await CourseSkill.findAll({
        include: [
          { model: Course, attributes: ['id', 'title'] },
          { model: Skill, attributes: ['id', 'name', 'category'] }
        ],
        order: [['course_id', 'ASC']]
      });
      
      res.json({ 
        success: true, 
        data: courseSkills 
      });
    } catch (err) {
      console.error('Get all course skills error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch course skills',
          code: 'FETCH_COURSE_SKILLS_ERROR'
        } 
      });
    }
  },

  // Get course skill by ID
  async getCourseSkillById(req, res) {
    try {
      const courseSkill = await CourseSkill.findByPk(req.params.id, {
        include: [
          { model: Course },
          { model: Skill }
        ]
      });
      
      if (!courseSkill) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'Course skill not found',
            code: 'COURSE_SKILL_NOT_FOUND'
          } 
        });
      }
      
      res.json({ 
        success: true, 
        data: courseSkill 
      });
    } catch (err) {
      console.error('Get course skill by ID error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch course skill',
          code: 'FETCH_COURSE_SKILL_ERROR'
        } 
      });
    }
  },

  // Add skill to course
  async addSkillToCourse(req, res) {
    try {
      const { course_id, skill_id, skill_level } = req.body;
      
      // Only admins and managers can manage course skills
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can manage course skills',
            code: 'UNAUTHORIZED_COURSE_SKILL_MANAGEMENT'
          }
        });
      }
      
      if (!course_id || !skill_id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Course ID and Skill ID are required',
            code: 'MISSING_REQUIRED_FIELDS'
          }
        });
      }
      
      // Validate skill level
      if (skill_level && (skill_level < 1 || skill_level > 5)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Skill level must be between 1 and 5',
            code: 'INVALID_SKILL_LEVEL'
          }
        });
      }
      
      // Check if course exists
      const course = await Course.findByPk(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course not found',
            code: 'COURSE_NOT_FOUND'
          }
        });
      }
      
      // Check if skill exists
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
      
      // Check if course already has this skill
      const existingCourseSkill = await CourseSkill.findOne({
        where: { course_id, skill_id }
      });
      
      if (existingCourseSkill) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Course already teaches this skill',
            code: 'SKILL_ALREADY_EXISTS'
          }
        });
      }
      
      // Create course skill
      const courseSkill = await CourseSkill.create({
        course_id,
        skill_id,
        skill_level: skill_level || 1
      });
      
      // Fetch the created course skill with related data
      const createdCourseSkill = await CourseSkill.findByPk(courseSkill.id, {
        include: [
          { model: Course },
          { model: Skill }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Skill successfully added to course',
        data: createdCourseSkill
      });
    } catch (err) {
      console.error('Add skill to course error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to add skill to course',
          code: 'ADD_COURSE_SKILL_ERROR'
        }
      });
    }
  },

  // Update course skill
  async updateCourseSkill(req, res) {
    try {
      const { id } = req.params;
      const { skill_level } = req.body;
      
      // Only admins and managers can manage course skills
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can manage course skills',
            code: 'UNAUTHORIZED_COURSE_SKILL_MANAGEMENT'
          }
        });
      }
      
      const courseSkill = await CourseSkill.findByPk(id);
      if (!courseSkill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course skill not found',
            code: 'COURSE_SKILL_NOT_FOUND'
          }
        });
      }
      
      // Validate skill level
      if (skill_level && (skill_level < 1 || skill_level > 5)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Skill level must be between 1 and 5',
            code: 'INVALID_SKILL_LEVEL'
          }
        });
      }
      
      const updateData = {};
      if (skill_level) updateData.skill_level = skill_level;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No valid fields to update',
            code: 'NO_UPDATE_FIELDS'
          }
        });
      }
      
      await courseSkill.update(updateData);
      
      // Fetch updated course skill with related data
      const updatedCourseSkill = await CourseSkill.findByPk(id, {
        include: [
          { model: Course },
          { model: Skill }
        ]
      });
      
      res.json({
        success: true,
        message: 'Course skill updated successfully',
        data: updatedCourseSkill
      });
    } catch (err) {
      console.error('Update course skill error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update course skill',
          code: 'UPDATE_COURSE_SKILL_ERROR'
        }
      });
    }
  },

  // Remove skill from course
  async removeSkillFromCourse(req, res) {
    try {
      const { id } = req.params;
      
      // Only admins and managers can manage course skills
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can manage course skills',
            code: 'UNAUTHORIZED_COURSE_SKILL_MANAGEMENT'
          }
        });
      }
      
      const courseSkill = await CourseSkill.findByPk(id);
      if (!courseSkill) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course skill not found',
            code: 'COURSE_SKILL_NOT_FOUND'
          }
        });
      }
      
      await courseSkill.destroy();
      
      res.json({
        success: true,
        message: 'Skill successfully removed from course'
      });
    } catch (err) {
      console.error('Remove skill from course error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to remove skill from course',
          code: 'REMOVE_COURSE_SKILL_ERROR'
        }
      });
    }
  },

  // Get skills for a specific course
  async getCourseSkills(req, res) {
    try {
      const { courseId } = req.params;
      
      const courseSkills = await CourseSkill.findAll({
        where: { course_id: courseId },
        include: [
          { model: Skill }
        ],
        order: [['skill_level', 'ASC']]
      });
      
      res.json({
        success: true,
        data: courseSkills
      });
    } catch (err) {
      console.error('Get course skills error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch course skills',
          code: 'FETCH_COURSE_SKILLS_ERROR'
        }
      });
    }
  },

  // Get courses that teach a specific skill
  async getSkillCourses(req, res) {
    try {
      const { skillId } = req.params;
      
      const courseSkills = await CourseSkill.findAll({
        where: { skill_id: skillId },
        include: [
          { model: Course }
        ],
        order: [['skill_level', 'ASC']]
      });
      
      res.json({
        success: true,
        data: courseSkills
      });
    } catch (err) {
      console.error('Get skill courses error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch skill courses',
          code: 'FETCH_SKILL_COURSES_ERROR'
        }
      });
    }
  }
};