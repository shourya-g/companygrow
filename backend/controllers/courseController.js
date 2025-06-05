const { Course, User, Skill, CourseSkill, CourseEnrollment } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Get all courses with filtering and search
  async getAllCourses(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        category, 
        difficulty_level, 
        is_active = true,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Build where conditions
      const whereConditions = {};
      
      if (is_active !== 'all') {
        whereConditions.is_active = is_active === 'true';
      }
      
      if (search) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { instructor_name: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      if (category) {
        whereConditions.category = category;
      }
      
      if (difficulty_level) {
        whereConditions.difficulty_level = difficulty_level;
      }

      // Validate sort fields
      const validSortFields = ['title', 'created_at', 'duration_hours', 'price', 'category'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

      const { count, rows: courses } = await Course.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Skill,
            through: { attributes: ['skill_level'] },
            attributes: ['id', 'name', 'category']
          },
          {
            model: CourseEnrollment,
            attributes: ['id', 'status'],
            required: false
          }
        ],
        order: [[sortField, sortDirection]],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      // Add enrollment statistics
      const coursesWithStats = await Promise.all(courses.map(async (course) => {
        const enrollmentStats = await CourseEnrollment.findAll({
          where: { course_id: course.id },
          attributes: [
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_enrollments'],
            [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'completed' THEN 1 END")), 'completed_enrollments'],
            [require('sequelize').fn('AVG', require('sequelize').col('progress_percentage')), 'avg_progress']
          ],
          raw: true
        });

        const courseData = course.toJSON();
        courseData.stats = {
          total_enrollments: parseInt(enrollmentStats[0]?.total_enrollments || 0),
          completed_enrollments: parseInt(enrollmentStats[0]?.completed_enrollments || 0),
          avg_progress: Math.round(parseFloat(enrollmentStats[0]?.avg_progress || 0))
        };

        return courseData;
      }));

      res.json({
        success: true,
        data: coursesWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
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

  // Get course by ID with detailed information
  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const { include_enrollments = false } = req.query;

      const includeOptions = [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email', 'bio']
        },
        {
          model: Skill,
          through: { attributes: ['skill_level'] },
          attributes: ['id', 'name', 'category', 'description']
        }
      ];

      // Include enrollments if requested and user has permission
      if (include_enrollments === 'true' && ['admin', 'manager'].includes(req.user?.role)) {
        includeOptions.push({
          model: CourseEnrollment,
          include: [{
            model: User,
            attributes: ['id', 'first_name', 'last_name', 'email']
          }],
          attributes: ['id', 'status', 'progress_percentage', 'enrollment_date', 'completion_date']
        });
      }

      const course = await Course.findByPk(id, {
        include: includeOptions
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

      // Get enrollment statistics
      const enrollmentStats = await CourseEnrollment.findAll({
        where: { course_id: id },
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_enrollments'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'completed' THEN 1 END")), 'completed_enrollments'],
          [require('sequelize').fn('AVG', require('sequelize').col('progress_percentage')), 'avg_progress'],
          [require('sequelize').fn('AVG', require('sequelize').col('final_score')), 'avg_score']
        ],
        raw: true
      });

      // Check if current user is enrolled
      let userEnrollment = null;
      if (req.user) {
        userEnrollment = await CourseEnrollment.findOne({
          where: { course_id: id, user_id: req.user.id },
          attributes: ['id', 'status', 'progress_percentage', 'enrollment_date', 'start_date', 'completion_date', 'final_score']
        });
      }

      const courseData = course.toJSON();
      courseData.stats = {
        total_enrollments: parseInt(enrollmentStats[0]?.total_enrollments || 0),
        completed_enrollments: parseInt(enrollmentStats[0]?.completed_enrollments || 0),
        avg_progress: Math.round(parseFloat(enrollmentStats[0]?.avg_progress || 0)),
        avg_score: Math.round(parseFloat(enrollmentStats[0]?.avg_score || 0))
      };
      courseData.user_enrollment = userEnrollment;

      res.json({
        success: true,
        data: courseData
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

  // Create new course
  async createCourse(req, res) {
    try {
      const {
        title,
        description,
        category,
        difficulty_level,
        duration_hours,
        instructor_name,
        instructor_bio,
        course_image,
        video_url,
        course_materials,
        prerequisites,
        learning_objectives,
        price,
        skills // Array of skill objects: [{ skill_id, skill_level }]
      } = req.body;

      // Only admins and managers can create courses
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can create courses',
            code: 'UNAUTHORIZED_COURSE_CREATION'
          }
        });
      }

      // Validate required fields
      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Title, description, and category are required',
            code: 'MISSING_REQUIRED_FIELDS'
          }
        });
      }

      // Validate difficulty level
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (difficulty_level && !validDifficulties.includes(difficulty_level)) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Difficulty level must be one of: ${validDifficulties.join(', ')}`,
            code: 'INVALID_DIFFICULTY_LEVEL'
          }
        });
      }

      // Validate duration and price
      if (duration_hours && (duration_hours < 0 || duration_hours > 1000)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Duration hours must be between 0 and 1000',
            code: 'INVALID_DURATION'
          }
        });
      }

      if (price && (price < 0 || price > 10000)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Price must be between 0 and 10000',
            code: 'INVALID_PRICE'
          }
        });
      }

      // Create course
      const courseData = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        difficulty_level: difficulty_level || 'beginner',
        duration_hours: duration_hours || 0,
        instructor_name: instructor_name?.trim(),
        instructor_bio: instructor_bio?.trim(),
        course_image,
        video_url,
        course_materials: Array.isArray(course_materials) ? course_materials : [],
        prerequisites: prerequisites?.trim(),
        learning_objectives: Array.isArray(learning_objectives) ? learning_objectives : [],
        price: price || 0,
        is_active: true,
        created_by: req.user.id
      };

      const course = await Course.create(courseData);

      // Add skills to course if provided
      if (Array.isArray(skills) && skills.length > 0) {
        const courseSkills = skills.map(skill => ({
          course_id: course.id,
          skill_id: skill.skill_id,
          skill_level: skill.skill_level || 1
        }));

        await CourseSkill.bulkCreate(courseSkills);
      }

      // Fetch the created course with relations
      const createdCourse = await Course.findByPk(course.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Skill,
            through: { attributes: ['skill_level'] },
            attributes: ['id', 'name', 'category']
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

  // Update course
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course not found',
            code: 'COURSE_NOT_FOUND'
          }
        });
      }

      // Check permissions - only creator, admin, or manager can update
      const canUpdate = req.user.role === 'admin' || 
                       req.user.role === 'manager' || 
                       req.user.id === course.created_by;

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Not authorized to update this course',
            code: 'UNAUTHORIZED_UPDATE'
          }
        });
      }

      // Validate fields if provided
      if (updateData.difficulty_level) {
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        if (!validDifficulties.includes(updateData.difficulty_level)) {
          return res.status(400).json({
            success: false,
            error: {
              message: `Difficulty level must be one of: ${validDifficulties.join(', ')}`,
              code: 'INVALID_DIFFICULTY_LEVEL'
            }
          });
        }
      }

      if (updateData.duration_hours && (updateData.duration_hours < 0 || updateData.duration_hours > 1000)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Duration hours must be between 0 and 1000',
            code: 'INVALID_DURATION'
          }
        });
      }

      if (updateData.price && (updateData.price < 0 || updateData.price > 10000)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Price must be between 0 and 10000',
            code: 'INVALID_PRICE'
          }
        });
      }

      // Trim string fields
      const fieldsToTrim = ['title', 'description', 'category', 'instructor_name', 'instructor_bio', 'prerequisites'];
      fieldsToTrim.forEach(field => {
        if (updateData[field] && typeof updateData[field] === 'string') {
          updateData[field] = updateData[field].trim();
        }
      });

      // Remove skills from update data (handled separately)
      const { skills, ...courseUpdateData } = updateData;

      await course.update(courseUpdateData);

      // Update skills if provided
      if (Array.isArray(skills)) {
        // Remove existing skills
        await CourseSkill.destroy({ where: { course_id: id } });
        
        // Add new skills
        if (skills.length > 0) {
          const courseSkills = skills.map(skill => ({
            course_id: id,
            skill_id: skill.skill_id,
            skill_level: skill.skill_level || 1
          }));
          await CourseSkill.bulkCreate(courseSkills);
        }
      }

      // Fetch updated course with relations
      const updatedCourse = await Course.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Skill,
            through: { attributes: ['skill_level'] },
            attributes: ['id', 'name', 'category']
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

  // Delete course
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course not found',
            code: 'COURSE_NOT_FOUND'
          }
        });
      }

      // Check permissions - only creator, admin, or manager can delete
      const canDelete = req.user.role === 'admin' || 
                       req.user.role === 'manager' || 
                       req.user.id === course.created_by;

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Not authorized to delete this course',
            code: 'UNAUTHORIZED_DELETE'
          }
        });
      }

      // Check if course has enrollments
      const enrollmentCount = await CourseEnrollment.count({ where: { course_id: id } });
      if (enrollmentCount > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot delete course with existing enrollments. Deactivate instead.',
            code: 'COURSE_HAS_ENROLLMENTS'
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

  // Toggle course active status
  async toggleCourseStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'is_active must be a boolean value',
            code: 'INVALID_STATUS'
          }
        });
      }

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course not found',
            code: 'COURSE_NOT_FOUND'
          }
        });
      }

      // Only admin or manager can toggle status
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can change course status',
            code: 'UNAUTHORIZED_STATUS_CHANGE'
          }
        });
      }

      await course.update({ is_active });

      res.json({
        success: true,
        message: `Course ${is_active ? 'activated' : 'deactivated'} successfully`,
        data: {
          id: course.id,
          is_active: course.is_active
        }
      });
    } catch (err) {
      console.error('Toggle course status error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update course status',
          code: 'STATUS_UPDATE_ERROR'
        }
      });
    }
  },

  // Get course categories
  async getCourseCategories(req, res) {
    try {
      const categories = await Course.findAll({
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'course_count']
        ],
        where: { is_active: true },
        group: ['category'],
        order: [['category', 'ASC']]
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (err) {
      console.error('Get course categories error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch course categories',
          code: 'FETCH_CATEGORIES_ERROR'
        }
      });
    }
  },

  // Get popular courses
  async getPopularCourses(req, res) {
    try {
      const { limit = 10 } = req.query;

      // Use correct table and alias for Postgres/Sequelize
      const popularCourses = await Course.findAll({
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
        where: { is_active: true },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        order: [
          [require('sequelize').literal('enrollment_count'), 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: popularCourses
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

  // Get recommended courses for user
  async getRecommendedCourses(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;

      // Get user's skills to recommend relevant courses
      const { UserSkill } = require('../models');
      const userSkills = await UserSkill.findAll({
        where: { user_id: userId },
        attributes: ['skill_id']
      });

      const userSkillIds = userSkills.map(us => us.skill_id);

      // Get courses that teach skills the user doesn't have or has low proficiency in
      let recommendedCourses;

      if (userSkillIds.length > 0) {
        recommendedCourses = await Course.findAll({
          where: { is_active: true },
          include: [
            {
              model: Skill,
              through: { attributes: ['skill_level'] },
              where: {
                id: { [Op.notIn]: userSkillIds }
              },
              required: true
            },
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'first_name', 'last_name']
            }
          ],
          order: [['created_at', 'DESC']],
          limit: parseInt(limit)
        });
      } else {
        // For users with no skills, recommend beginner courses
        recommendedCourses = await Course.findAll({
          where: { 
            is_active: true,
            difficulty_level: 'beginner'
          },
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
      }

      res.json({
        success: true,
        data: recommendedCourses
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
  }
};