// routes/messagesRoutes.js
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
const { uploadLocket } = require('../middleware/upload');

router.use(authenticateToken);

// === Chat Messages ===
router.post('/', verifyCoupleAccess, uploadLocket.single('file'), sendMessage);

router.get('/', verifyCoupleAccess, getMessages); 

router.patch('/:message_id/react', reactMessage); 

router.delete('/:message_id', deleteMessage);

// === Locket Photos ===
router.post('/locket/send', verifyCoupleAccess, uploadLocket.single('photo'), sendLocket);
router.get('/locket/unviewed', getUnviewedLocket);
router.post('/locket/:locket_id/view', viewLocket);
router.get('/locket/vault', verifyCoupleAccess, getVaultAlbum);

module.exports = router;