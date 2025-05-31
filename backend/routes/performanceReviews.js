const express = require('express');
const router = express.Router();
const performanceReviewController = require('../controllers/performanceReviewController');

router.get('/', performanceReviewController.getAllPerformanceReviews);
router.get('/:id', performanceReviewController.getPerformanceReviewById);
// ...other performance review routes (create, update, delete, submit, approve, etc.)

module.exports = router;
