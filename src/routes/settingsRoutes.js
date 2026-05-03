// routes/settingsRoutes.js
// Tab "Cài đặt" - Cấu hình app, thông tin tài khoản

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePassword,
  updateTheme,
  getNotificationSettings,
  updateNotificationSettings,
} = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');
const { uploadLocket } = require('../middleware/upload');

// Tất cả các route Settings cần xác thực
router.use(authenticateToken);

// === Hồ sơ người dùng ===
router.get('/profile', getProfile);
router.put('/profile', uploadLocket.single('avatar'), updateProfile);
router.put('/password', updatePassword);

// === Tùy chỉnh giao diện ===
router.put('/theme', updateTheme);

// === Thông báo ===
router.get('/notifications', getNotificationSettings);
router.put('/notifications', updateNotificationSettings);

module.exports = router;
