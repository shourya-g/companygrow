const express = require('express');
const router = express.Router();

// Placeholder routes for projects
router.get('/', (req, res) => {
  res.json({ message: 'projects routes - Coming soon!' });
});

module.exports = router;
