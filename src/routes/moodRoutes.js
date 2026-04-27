// routes/moodRoutes.js
// 📁 JAMOCHI/src/routes/moodRoutes.js

const express = require('express');
const router  = express.Router();

const {
  upsertForecast,
  getTodayForecast,
  getForecastHistory,
  getThemePalettes,
} = require('../controllers/moodController');

const { authenticateToken, verifyCoupleAccess } = require('../middleware/auth');

// Tất cả routes đều cần đăng nhập
router.use(authenticateToken);

// POST /api/mood/forecast          — Cô ấy cập nhật mood hôm nay
router.post('/forecast',            verifyCoupleAccess, upsertForecast);

// GET  /api/mood/forecast/today    — Lấy mood hôm nay (cả 2 đều gọi được)
router.get('/forecast/today',       verifyCoupleAccess, getTodayForecast);

// GET  /api/mood/forecast/history  — Lịch sử mood (vẽ biểu đồ)
router.get('/forecast/history',     getForecastHistory);

// GET  /api/mood/theme-palettes    — Bảng màu theo mood (không cần couple)
router.get('/theme-palettes',       getThemePalettes);

module.exports = router;