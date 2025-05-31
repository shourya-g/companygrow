const { Course } = require('../models');

module.exports = {
  async getAllCourses(req, res) {
    const courses = await Course.findAll();
    res.json({ success: true, data: courses });
  },
  async getCourseById(req, res) {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: { message: 'Course not found' } });
    res.json({ success: true, data: course });
  },
  // ...other course controller methods (create, update, delete, search, etc.)
};
