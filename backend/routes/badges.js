const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { auth, requireRole } = require('../middleware/auth');

// Public badge routes
router.get('/', badgeController.getAllBadges);
router.get('/:id', badgeController.getBadgeById);

// User badge routes (require authentication)
router.get('/user/:userId', auth, badgeController.getUserBadges);

// Admin badge management routes
router.post('/', auth, requireRole(['admin']), badgeController.createBadge);
router.put('/:id', auth, requireRole(['admin']), badgeController.updateBadge);
router.delete('/:id', auth, requireRole(['admin']), badgeController.deleteBadge);

// Badge awarding (admin/manager only)
router.post('/award', auth, requireRole(['admin', 'manager']), badgeController.awardBadge);

module.exports = router;
