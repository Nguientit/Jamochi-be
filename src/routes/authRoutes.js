// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  generateInvite,
  acceptInvite,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// ❌ Không cần xác thực
router.post('/register', register);
router.post('/login', login);

// ✅ Cần xác thực
router.post('/generate-invite', authenticateToken, generateInvite);
router.post('/accept-invite', authenticateToken, acceptInvite);

module.exports = router;
