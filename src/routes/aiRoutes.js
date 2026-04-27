// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSession,
  chat,
  getSessions,
  getSessionTurns,
  deleteSession
} = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');
const { verifyCoupleAccess } = require('../middleware/couple');

router.use(authenticateToken);

// Các endpoint cho Bro AI
router.post('/start-conversation', verifyCoupleAccess, createSession);
router.post('/conversation/:session_id/chat', verifyCoupleAccess, chat);
router.get('/sessions', getSessions);
router.get('/conversation/:session_id', getSessionTurns);
router.delete('/conversation/:session_id', deleteSession);

module.exports = router;