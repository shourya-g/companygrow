const { CourseEnrollment, Course, User } = require('../models');

module.exports = {
  // Get all course enrollments
  async getAllCourseEnrollments(req, res) {
    try {
      const enrollments = await CourseEnrollment.findAll({
        include: [
          { model: Course, attributes: ['id', 'title', 'category'] },
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({ 
        success: true, 
        data: enrollments 
      });
    } catch (err) {
      console.error('Get all course enrollments error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch course enrollments',
          code: 'FETCH_ENROLLMENTS_ERROR'
        } 
      });
    }
  },

  // Get course enrollment by ID
  async getCourseEnrollmentById(req, res) {
    try {
      const enrollment = await CourseEnrollment.findByPk(req.params.id, {
        include: [
          { model: Course },
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });
      
      if (!enrollment) {
        return res.status(404).json({ 
          success: false, 
          error: { 
            message: 'Course enrollment not found',
            code: 'ENROLLMENT_NOT_FOUND'
          } 
        });
      }
      
      res.json({ 
        success: true, 
        data: enrollment 
      });
    } catch (err) {
      console.error('Get course enrollment by ID error:', err);
      res.status(500).json({ 
        success: false, 
        error: { 
          message: 'Failed to fetch course enrollment',
          code: 'FETCH_ENROLLMENT_ERROR'
        } 
      });
    }
  },

  // Enroll user in course
  async enrollInCourse(req, res) {
    try {
      const { course_id, user_id } = req.body;
      const enrollingUserId = user_id || req.user.id;
      
      // Check if user can enroll others (admin/manager only)
      if (user_id && req.user.id !== user_id && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot enroll other users',
            code: 'UNAUTHORIZED_ENROLLMENT'
          }
        });
      }
      
      if (!course_id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Course ID is required',
            code: 'MISSING_COURSE_ID'
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
      
      // Check if user is already enrolled
      const existingEnrollment = await CourseEnrollment.findOne({
        where: { user_id: enrollingUserId, course_id }
      });
      
      if (existingEnrollment) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'User is already enrolled in this course',
            code: 'ALREADY_ENROLLED'
          }
        });
      }
      
      // Create enrollment
      const enrollment = await CourseEnrollment.create({
        user_id: enrollingUserId,
        course_id,
        status: 'enrolled',
        progress_percentage: 0,
        enrollment_date: new Date()
      });
      
      // Fetch the created enrollment with related data
      const createdEnrollment = await CourseEnrollment.findByPk(enrollment.id, {
        include: [
          { model: Course },
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: createdEnrollment
      });
    } catch (err) {
      console.error('Enroll in course error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to enroll in course',
          code: 'ENROLLMENT_ERROR'
        }
      });
    }
  },

  // Update course progress
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { progress_percentage, status, final_score } = req.body;
      
      const enrollment = await CourseEnrollment.findByPk(id);
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course enrollment not found',
            code: 'ENROLLMENT_NOT_FOUND'
          }
        });
      }
      
      // Check if user can update this enrollment
      if (req.user.id !== enrollment.user_id && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot update other user enrollments',
            code: 'UNAUTHORIZED_UPDATE'
          }
        });
      }
      
      const updateData = {};
      let courseCompleted = false;
      
      // Validate and set progress percentage
      if (progress_percentage !== undefined) {
        if (progress_percentage < 0 || progress_percentage > 100) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Progress percentage must be between 0 and 100',
              code: 'INVALID_PROGRESS'
            }
          });
        }
        updateData.progress_percentage = progress_percentage;
        
        // Auto-complete if 100%
        if (progress_percentage === 100) {
          updateData.status = 'completed';
          updateData.completion_date = new Date();
          courseCompleted = true;
        }
      }
      
      // Set final score if provided
      if (final_score !== undefined) {
        if (final_score < 0 || final_score > 100) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Final score must be between 0 and 100',
              code: 'INVALID_SCORE'
            }
          });
        }
        updateData.final_score = final_score;
      }
      
      // Validate and set status
      if (status) {
        const validStatuses = ['enrolled', 'in_progress', 'completed', 'dropped'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: {
              message: `Status must be one of: ${validStatuses.join(', ')}`,
              code: 'INVALID_STATUS'
            }
          });
        }
        updateData.status = status;
        
        if (status === 'completed') {
          updateData.completion_date = new Date();
          if (!updateData.progress_percentage) {
            updateData.progress_percentage = 100;
          }
          courseCompleted = true;
        } else if (status === 'in_progress' && enrollment.status === 'enrolled') {
          updateData.start_date = new Date();
        }
      }
      
      await enrollment.update(updateData);

      // Award badges if course was just completed
      let awardedBadges = [];
      if (courseCompleted && enrollment.status !== 'completed') {
        try {
          const badgeController = require('./badgeController');
          awardedBadges = await badgeController.awardCourseCompletionBadge(
            enrollment.user_id, 
            enrollment.course_id,
            updateData.final_score || final_score
          );
        } catch (badgeError) {
          console.error('Error awarding course completion badges:', badgeError);
          // Don't fail the whole request if badge awarding fails
        }
      }
      
      // Fetch updated enrollment with related data
      const updatedEnrollment = await CourseEnrollment.findByPk(id, {
        include: [
          { model: Course },
          { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });
      
      res.json({
        success: true,
        message: 'Course progress updated successfully',
        data: updatedEnrollment,
        badges_awarded: awardedBadges.length > 0 ? awardedBadges.map(b => ({
          id: b.id,
          name: b.name,
          rarity: b.rarity,
          token_reward: b.token_reward
        })) : []
      });
    } catch (err) {
      console.error('Update course progress error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update course progress',
          code: 'UPDATE_PROGRESS_ERROR'
        }
      });
    }
  },

  // Get enrollments for a specific user
  async getUserEnrollments(req, res) {
    try {
      const { userId } = req.params;
      
      // Check if user can view these enrollments
      if (req.user.id !== parseInt(userId) && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot view other user enrollments',
            code: 'UNAUTHORIZED_VIEW'
          }
        });
      }
      
      const enrollments = await CourseEnrollment.findAll({
        where: { user_id: userId },
        include: [
          { model: Course }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: enrollments
      });
    } catch (err) {
      console.error('Get user enrollments error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch user enrollments',
          code: 'FETCH_USER_ENROLLMENTS_ERROR'
        }
      });
    }
  },

  // Unenroll from course
  async unenrollFromCourse(req, res) {
    try {
      const { id } = req.params;
      
      const enrollment = await CourseEnrollment.findByPk(id);
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Course enrollment not found',
            code: 'ENROLLMENT_NOT_FOUND'
          }
        });
      }
      
      // Check if user can unenroll
      if (req.user.id !== enrollment.user_id && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot unenroll other users',
            code: 'UNAUTHORIZED_UNENROLL'
          }
        });
      }
      
      // Don't allow unenrolling from completed courses
      if (enrollment.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot unenroll from completed courses',
            code: 'CANNOT_UNENROLL_COMPLETED'
          }
        });
      }
      
      await enrollment.destroy();
      
      res.json({
        success: true,
        message: 'Successfully unenrolled from course'
      });
    } catch (err) {
      console.error('Unenroll from course error:', err);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to unenroll from course',
          code: 'UNENROLL_ERROR'
        }
      });
    }
  }
};