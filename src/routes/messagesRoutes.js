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
  getVaultAlbum,
  getMemoriesCalendar
} = require('../controllers/messagesController');
const { authenticateToken, verifyCoupleAccess } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticateToken);

// === Chat Messages ===
router.post('/', verifyCoupleAccess, upload.single('file'), sendMessage);

router.get('/', verifyCoupleAccess, getMessages); 

router.patch('/:message_id/react', reactMessage); 

router.delete('/:message_id', deleteMessage);

router.get('/memories', verifyCoupleAccess, getMemoriesCalendar);

// === Locket Photos ===
router.post('/locket/send', verifyCoupleAccess, upload.single('photo'), sendLocket);
router.get('/locket/unviewed', getUnviewedLocket);
router.post('/locket/:locket_id/view', viewLocket);
router.get('/locket/vault', verifyCoupleAccess, getVaultAlbum);

// Thêm vào routes/messagesRoutes.js
module.exports = router;