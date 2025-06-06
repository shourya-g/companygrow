const { Course, Skill, CourseSkill, CourseEnrollment, User } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Get all courses with advanced filtering
  async getAllCourses(req, res) {
    try {
      const {
        category,
        difficulty_level,
        skill_id,
        min_duration,
        max_duration,
        max_price,
        instructor,
        search,
        sort_by = 'created_at',
        sort_order = 'DESC',
        page = 1,
        limit = 12,
        user_enrolled = false,
        available_only = true
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (available_only === 'true') {
        whereClause.is_active = true;
      }
      
      if (category) {
        whereClause.category = category;
      }
      
      if (difficulty_level) {
        whereClause.difficulty_level = difficulty_level;
      }
      
      if (min_duration || max_duration) {
        whereClause.duration_hours = {};
        if (min_duration) whereClause.duration_hours[Op.gte] = parseInt(min_duration);
        if (max_duration) whereClause.duration_hours[Op.lte] = parseInt(max_duration);
      }
      
      if (max_price) {
        whereClause.price = { [Op.lte]: parseFloat(max_price) };
      }
      
      if (instructor) {
        whereClause.instructor_name = { [Op.iLike]: `%${instructor}%` };
      }
      
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { instructor_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Build include array
      const include = [
        {
          model: Skill,
          through: { attributes: ['skill_level'] },
          attributes: ['id', 'name', 'category']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ];

      // Add enrollment data if user is authenticated
      if (req.user) {
        include.push({
          model: CourseEnrollment,
          where: { user_id: req.user.id },
          required: false,
          attributes: ['id', 'status', 'progress_percentage', 'enrollment_date']
        });
      }

      // Filter by skill if specified
      if (skill_id) {
        include[0].where = { id: skill_id };
        include[0].required = true;
      }

      // Build order clause
      const validSortFields = ['title', 'price', 'duration_hours', 'created_at', 'category'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: courses } = await Course.findAndCountAll({
        where: whereClause,
        include,
        order: [[sortField, sortDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      // Filter out courses user is already enrolled in if requested
      let filteredCourses = courses;
      if (user_enrolled === 'false' && req.user) {
        filteredCourses = courses.filter(course => 
          !course.CourseEnrollments || course.CourseEnrollments.length === 0
        );
      } else if (user_enrolled === 'true' && req.user) {
        filteredCourses = courses.filter(course => 
          course.CourseEnrollments && course.CourseEnrollments.length > 0
        );
      }

      // Calculate enrollment count for each course
      const coursesWithStats = await Promise.all(
        filteredCourses.map(async (course) => {
          const enrollmentCount = await CourseEnrollment.count({
            where: { course_id: course.id }
          });
          
          const completionCount = await CourseEnrollment.count({
            where: { 
              course_id: course.id,
              status: 'completed'
            }
          });

          return {
            ...course.toJSON(),
            enrollment_count: enrollmentCount,
            completion_count: completionCount,
            completion_rate: enrollmentCount > 0 ? Math.round((completionCount / enrollmentCount) * 100) : 0,
            is_enrolled: course.CourseEnrollments && course.CourseEnrollments.length > 0,
            enrollment_status: course.CourseEnrollments && course.CourseEnrollments.length > 0 
              ? course.CourseEnrollments[0].status 
              : null
          };
        })
      );

      res.json({
        success: true,
        data: coursesWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        },
        filters_applied: {
          category,
          difficulty_level,
          skill_id,
          min_duration,
          max_duration,
          max_price,
          instructor,
          search,
          user_enrolled
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
      const course = await Course.findByPk(req.params.id, {
        include: [
          {
            model: Skill,
            through: { attributes: ['skill_level'] },
            attributes: ['id', 'name', 'category', 'description']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name']
          },
          ...(req.user ? [{
            model: CourseEnrollment,
            where: { user_id: req.user.id },
            required: false,
            attributes: ['id', 'status', 'progress_percentage', 'enrollment_date', 'completion_date', 'final_score']
          }] : [])
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

      // Get enrollment statistics
      const enrollmentCount = await CourseEnrollment.count({
        where: { course_id: course.id }
      });

      const completionCount = await CourseEnrollment.count({
        where: { 
          course_id: course.id,
          status: 'completed'
        }
      });

      // Check if user has required skills
      let skillMatch = null;
      if (req.user && course.Skills.length > 0) {
        const { UserSkill } = require('../models');
        const userSkills = await UserSkill.findAll({
          where: { user_id: req.user.id },
          include: [{ model: Skill }]
        });

        const skillAnalysis = course.Skills.map(courseSkill => {
          const userSkill = userSkills.find(us => us.skill_id === courseSkill.id);
          return {
            skill: courseSkill.name,
            required_level: courseSkill.CourseSkill.skill_level,
            user_level: userSkill ? userSkill.proficiency_level : 0,
            meets_requirement: userSkill ? userSkill.proficiency_level >= courseSkill.CourseSkill.skill_level : false
          };
        });

        skillMatch = {
          total_skills: course.Skills.length,
          met_requirements: skillAnalysis.filter(s => s.meets_requirement).length,
          skill_analysis: skillAnalysis,
          recommended: skillAnalysis.every(s => s.meets_requirement)
        };
      }

      const courseData = {
        ...course.toJSON(),
        enrollment_count: enrollmentCount,
        completion_count: completionCount,
        completion_rate: enrollmentCount > 0 ? Math.round((completionCount / enrollmentCount) * 100) : 0,
        is_enrolled: course.CourseEnrollments && course.CourseEnrollments.length > 0,
        enrollment_status: course.CourseEnrollments && course.CourseEnrollments.length > 0 
          ? course.CourseEnrollments[0].status 
          : null,
        skill_match: skillMatch
      };

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

  // Create new course (admin/manager only)
  async createCourse(req, res) {
    try {
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only admins and managers can create courses',
            code: 'UNAUTHORIZED_COURSE_CREATION'
          }
        });
      }

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
        skills // Array of {skill_id, skill_level}
      } = req.body;

      if (!title || !category || !difficulty_level) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Title, category, and difficulty level are required',
            code: 'MISSING_REQUIRED_FIELDS'
          }
        });
      }

      const course = await Course.create({
        title: title.trim(),
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
        price: price || 0,
        created_by: req.user.id,
        is_active: true
      });

      // Add skills to course if provided
      if (skills && Array.isArray(skills) && skills.length > 0) {
        const { CourseSkill } = require('../models');
        const courseSkills = skills.map(skill => ({
          course_id: course.id,
          skill_id: skill.skill_id,
          skill_level: skill.skill_level || 1
        }));
        
        await CourseSkill.bulkCreate(courseSkills);
      }

      // Fetch the created course with related data
      const createdCourse = await Course.findByPk(course.id, {
        include: [
          {
            model: Skill,
            through: { attributes: ['skill_level'] },
            attributes: ['id', 'name', 'category']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name']
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

      // Check permissions
      if (!['admin', 'manager'].includes(req.user.role) && course.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot update other user courses',
            code: 'UNAUTHORIZED_UPDATE'
          }
        });
      }

      const updateData = { ...req.body };
      delete updateData.skills; // Handle skills separately

      await course.update(updateData);

      // Update skills if provided
      if (req.body.skills && Array.isArray(req.body.skills)) {
        const { CourseSkill } = require('../models');
        
        // Remove existing course skills
        await CourseSkill.destroy({ where: { course_id: course.id } });
        
        // Add new course skills
        if (req.body.skills.length > 0) {
          const courseSkills = req.body.skills.map(skill => ({
            course_id: course.id,
            skill_id: skill.skill_id,
            skill_level: skill.skill_level || 1
          }));
          
          await CourseSkill.bulkCreate(courseSkills);
        }
      }

      // Fetch updated course with related data
      const updatedCourse = await Course.findByPk(course.id, {
        include: [
          {
            model: Skill,
            through: { attributes: ['skill_level'] },
            attributes: ['id', 'name', 'category']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name']
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

      // Check permissions
      if (!['admin', 'manager'].includes(req.user.role) && course.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot delete other user courses',
            code: 'UNAUTHORIZED_DELETE'
          }
        });
      }

      // Check if course has enrollments
      const enrollmentCount = await CourseEnrollment.count({
        where: { course_id: course.id }
      });

      if (enrollmentCount > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot delete course with existing enrollments',
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

  // Get course categories
  async getCourseCategories(req, res) {
    try {
      const categories = await Course.findAll({
        attributes: ['category'],
        group: ['category'],
        where: { is_active: true },
        raw: true
      });

      res.json({
        success: true,
        data: categories.map(c => c.category).filter(Boolean)
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

  // Get course recommendations for user
  async getCourseRecommendations(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }
        });
      }

      const { UserSkill } = require('../models');
      
      // Get user's current skills
      const userSkills = await UserSkill.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Skill, attributes: ['id', 'name', 'category'] }]
      });

      // Get user's enrolled courses
      const enrolledCourses = await CourseEnrollment.findAll({
        where: { user_id: req.user.id },
        attributes: ['course_id']
      });

      const enrolledCourseIds = enrolledCourses.map(e => e.course_id);

      // Find courses that match user's skill interests but aren't enrolled
      const recommendations = await Course.findAll({
        where: {
          id: { [Op.notIn]: enrolledCourseIds },
          is_active: true
        },
        include: [
          {
            model: Skill,
            through: { attributes: ['skill_level'] },
            attributes: ['id', 'name', 'category'],
            where: userSkills.length > 0 ? {
              category: {
                [Op.in]: [...new Set(userSkills.map(us => us.Skill.category))]
              }
            } : undefined,
            required: userSkills.length > 0
          }
        ],
        limit: 10,
        order: [['created_at', 'DESC']]
      });

      // Calculate relevance score for each recommendation
      const scoredRecommendations = recommendations.map(course => {
        let relevanceScore = 0;
        let matchingSkills = 0;

        course.Skills.forEach(courseSkill => {
          const userSkill = userSkills.find(us => us.skill_id === courseSkill.id);
          if (userSkill) {
            matchingSkills++;
            // Higher score if user's skill level is close to required level
            const levelDiff = Math.abs(userSkill.proficiency_level - courseSkill.CourseSkill.skill_level);
            relevanceScore += Math.max(0, 5 - levelDiff);
          }
        });

        return {
          ...course.toJSON(),
          relevance_score: relevanceScore,
          matching_skills: matchingSkills,
          recommendation_reason: matchingSkills > 0 
            ? `Matches ${matchingSkills} of your skill interests`
            : 'Popular course'
        };
      });

      // Sort by relevance score
      scoredRecommendations.sort((a, b) => b.relevance_score - a.relevance_score);

      res.json({
        success: true,
        data: scoredRecommendations.slice(0, 6),
        message: `Found ${scoredRecommendations.length} course recommendations`
      });
    } catch (err) {
      console.error('Get course recommendations error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch course recommendations',
          code: 'FETCH_RECOMMENDATIONS_ERROR'
        }
      });
    }
  }
};