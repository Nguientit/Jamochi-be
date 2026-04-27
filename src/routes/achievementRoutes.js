// routes/achievementRoutes.js
const express = require('express');
const router = express.Router();
const {
  upsertRating,
  getRatingHistory,
  getSummary,
  markBadgeSeen
} = require('../controllers/achievementController');
const { authenticateToken } = require('../middleware/auth');
const { verifyCoupleAccess } = require('../middleware/couple');

router.use(authenticateToken);

// Đánh giá ngày hôm nay
router.post('/day-rating', verifyCoupleAccess, upsertRating);
router.get('/day-rating/history', getRatingHistory);

// Lấy tổng quan (Summary) bao gồm cả streaks và badges
router.get('/summary', getSummary); 

// Đánh dấu huy hiệu đã xem
router.put('/badges/:badge_id/seen', markBadgeSeen);

module.exports = router;