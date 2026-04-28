// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  generateInvite,
  acceptInvite,
  getMe,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

router.post('/generate-invite', authenticateToken, generateInvite);
router.post('/accept-invite', authenticateToken, acceptInvite);
router.get('/me', authenticateToken, getMe);

module.exports = router;
