const { Course, User } = require('../models');

module.exports = {
  // GET /api/courses - Get all courses
  async getAllCourses(req, res) {
    try {
      // Get query parameters - IMPORTANT: Default to 'true' for active courses
      const { 
        limit = 50, 
        offset = 0, 
        category, 
        difficulty_level, 
        search,
        active = 'true' // This ensures we show active courses by default
      } = req.query;

      // Build where clause
      const whereClause = {};
      
      // CRITICAL FIX: Ensure we fetch active courses by default
      if (active === 'false') {
        whereClause.is_active = false;
      } else {
        // Default behavior: show only active courses
        whereClause.is_active = true;
      }

      // Add category filter
      if (category) {
        whereClause.category = category;
      }

      // Add difficulty filter
      if (difficulty_level) {
        whereClause.difficulty_level = difficulty_level;
      }

      // Add search filter
      if (search) {
        const { Op } = require('sequelize');
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { instructor_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const courses = await Course.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({ 
        success: true, 
        data: courses.rows,
        pagination: {
          total: courses.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          totalPages: Math.ceil(courses.count / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('Get all courses error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch courses',
          code: 'FETCH_COURSES_ERROR'
        } 
      });
    }
  },

  // GET /api/courses/:id - Get course by ID
  async getCourseById(req, res) {
    try {
      const course = await Course.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });
      
      if (!course) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'Course not found',
            code: 'COURSE_NOT_FOUND'
          } 
        });
      }
      
      res.json({ 
        success: true, 
        data: course 
      });
    } catch (err) {
      console.error('Get course by ID error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch course',
          code: 'FETCH_COURSE_ERROR'
        } 
      });
    }
  },

  // POST /api/courses - Create new course
  async createCourse(req, res) {
    try {
      // Only admin and managers can create courses
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can create courses',
            code: 'UNAUTHORIZED_CREATE'
          }
        });
      }

      const courseData = {
        ...req.body,
        created_by: req.user.id,
        is_active: true // Default to active
      };

      const course = await Course.create(courseData);
      
      // Fetch the created course with creator info
      const createdCourse = await Course.findByPk(course.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });
      
      res.status(201).json({ 
        success: true, 
        message: 'Course created successfully',
        data: createdCourse 
      });
    } catch (err) {
      console.error('Create course error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to create course',
          code: 'CREATE_COURSE_ERROR'
        } 
      });
    }
  },

  // PUT /api/courses/:id - Update course
  async updateCourse(req, res) {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'Course not found',
            code: 'COURSE_NOT_FOUND'
          } 
        });
      }

      // Check permissions - only course creator or admin can update
      if (req.user.role !== 'admin' && course.created_by !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          error: { 
            message: 'Cannot update other user courses',
            code: 'UNAUTHORIZED_UPDATE'
          } 
        });
      }

      await course.update(req.body);
      
      // Fetch updated course with creator info
      const updatedCourse = await Course.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      });
      
      res.json({ 
        success: true, 
        message: 'Course updated successfully',
        data: updatedCourse 
      });
    } catch (err) {
      console.error('Update course error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to update course',
          code: 'UPDATE_COURSE_ERROR'
        } 
      });
    }
  },

  // DELETE /api/courses/:id - Delete course
  async deleteCourse(req, res) {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'Course not found',
            code: 'COURSE_NOT_FOUND'
          } 
        });
      }

      // Check permissions - only course creator or admin can delete
      if (req.user.role !== 'admin' && course.created_by !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          error: { 
            message: 'Cannot delete other user courses',
            code: 'UNAUTHORIZED_DELETE'
          } 
        });
      }

      await course.destroy();
      
      res.json({ 
        success: true, 
        message: 'Course deleted successfully' 
      });
    } catch (err) {
      console.error('Delete course error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to delete course',
          code: 'DELETE_COURSE_ERROR'
        } 
      });
    }
  },

  // GET /api/courses/popular - Get popular courses
  async getPopularCourses(req, res) {
    try {
      const { limit = 5 } = req.query;

      const courses = await Course.findAll({
        where: { is_active: true }, // Ensure we only get active courses
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        attributes: {
          include: [
            [
              require('sequelize').literal(`(
                SELECT COUNT(*)
                FROM course_enrollments AS ce
                WHERE ce.course_id = "Course".id
              )`),
              'enrollment_count'
            ]
          ]
        },
        order: [
          [require('sequelize').literal('enrollment_count'), 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: parseInt(limit)
      });

      console.log(`Popular courses query returned ${courses.length} courses`);

      res.json({
        success: true,
        data: courses
      });
    } catch (err) {
      console.error('Get popular courses error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch popular courses',
          code: 'FETCH_POPULAR_COURSES_ERROR'
        }
      });
    }
  },

  // GET /api/courses/recommended - Get recommended courses for user
  async getRecommendedCourses(req, res) {
    try {
      const { limit = 5 } = req.query;
      
      // For now, return newest active courses as recommendations
      const courses = await Course.findAll({
        where: { is_active: true }, // Ensure we only get active courses
        include: [
          {
            model: User,
            as: 'creator', 
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        order: [
          ['created_at', 'DESC'] // Show newest courses as recommendations
        ],
        limit: parseInt(limit)
      });

      console.log(`Recommended courses query returned ${courses.length} courses`);

      res.json({
        success: true,
        data: courses
      });
    } catch (err) {
      console.error('Get recommended courses error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch recommended courses',
          code: 'FETCH_RECOMMENDED_COURSES_ERROR'
        }
      });
    }
  },

  // GET /api/courses/recent - Get recently added courses  
  async getRecentCourses(req, res) {
    try {
      const { limit = 5 } = req.query;

      const courses = await Course.findAll({
        where: { is_active: true }, // Ensure we only get active courses
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name'] 
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit)
      });

      console.log(`Recent courses query returned ${courses.length} courses`);

      res.json({
        success: true,
        data: courses
      });
    } catch (err) {
      console.error('Get recent courses error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch recent courses',
          code: 'FETCH_RECENT_COURSES_ERROR'
        }
      });
    }
  }
};