const express = require('express');
const router = express.Router();

// Placeholder routes for courses
router.get('/', (req, res) => {
  res.json({ message: 'courses routes - Coming soon!' });
});

module.exports = router;
