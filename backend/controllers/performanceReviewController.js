const { PerformanceReview } = require('../models');

module.exports = {
  async getAllPerformanceReviews(req, res) {
    const reviews = await PerformanceReview.findAll();
    res.json({ success: true, data: reviews });
  },
  async getPerformanceReviewById(req, res) {
    const review = await PerformanceReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: { message: 'Performance review not found' } });
    res.json({ success: true, data: review });
  },
  // ...other performance review controller methods (create, update, delete, submit, approve, etc.)
};
