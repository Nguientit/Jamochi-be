// routes/messagesRoutes.js
// Chat messages, Locket photos, Voice/Video call

const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  reactMessage,
  deleteMessage,
  sendLocket,
  getUnviewedLocket,
  viewLocket,
  getVaultAlbum
} = require('../controllers/messagesController');
const { authenticateToken, verifyCoupleAccess } = require('../middleware/auth');

// Tất cả các route Messages cần xác thực
router.use(authenticateToken);

// === Chat Messages ===
router.post('/send', verifyCoupleAccess, sendMessage);
router.get('/history', verifyCoupleAccess, getMessages);
router.post('/:message_id/react', reactMessage);
router.delete('/:message_id', deleteMessage);

// === Locket Photos ===
router.post('/locket/send', verifyCoupleAccess, sendLocket);
router.get('/locket/unviewed', getUnviewedLocket);
router.post('/locket/:locket_id/view', viewLocket);
router.get('/locket/vault', verifyCoupleAccess, getVaultAlbum);

module.exports = router;