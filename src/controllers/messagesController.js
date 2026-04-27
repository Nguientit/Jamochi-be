// controllers/message.controller.js
const msgService = require('../services/messageService');
const R = require('../utils/response');

// ── Chat ──────────────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const { type, content, media_url, reply_to_id, sticker_id } = req.body;

    const msg = await msgService.sendMessage({
      coupleId: req.couple.id,
      senderId: req.user.id,
      receiverId: req.partnerId,
      type, content, media_url, reply_to_id, sticker_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('receive-message', msg); 
    }

    return R.created(res, msg, 'Tin nhắn đã gửi 💌');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const getMessages = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const { before, limit } = req.query;

    const messages = await msgService.getMessages({
      coupleId: req.couple.id,
      before,
      limit: parseInt(limit) || 30,
    });

    // Đánh dấu đã đọc
    await msgService.markRead(req.couple.id, req.user.id);
    return R.success(res, messages);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const reactMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const { emoji } = req.body;
    const result = await msgService.reactToMessage(message_id, req.user.id, emoji);
    return R.success(res, result);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const deleteMessage = async (req, res) => {
  try {
    await msgService.deleteMessage(req.params.message_id, req.user.id);
    return R.success(res, null, 'Đã xóa tin nhắn');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

// ── Locket ────────────────────────────────────────────────────────────────────
const sendLocket = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const { photo_url, thumbnail_url, caption, filter, sticker_overlay } = req.body;
    if (!photo_url) return R.badRequest(res, 'Thiếu photo_url');

    const locket = await msgService.sendLocket({
      coupleId: req.coupleId,
      senderId: req.user.id,
      receiverId: req.partnerId,
      photo_url, thumbnail_url, caption, filter, sticker_overlay,
    });
    return R.created(res, locket, 'Ảnh đã gửi 📸');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const getUnviewedLocket = async (req, res) => {
  try {
    const locket = await msgService.getUnviewedLocket(req.user.id);
    return R.success(res, locket);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const viewLocket = async (req, res) => {
  try {
    const { save_to_vault, reaction_emoji } = req.body;
    const result = await msgService.viewLocket(req.params.locket_id, req.user.id, { save_to_vault, reaction_emoji });
    return R.success(res, result);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const getVaultAlbum = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const { page, limit } = req.query;
    const result = await msgService.getVaultAlbum(req.coupleId, parseInt(page) || 1, parseInt(limit) || 20);
    return R.success(res, result);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

module.exports = { sendMessage, getMessages, reactMessage, deleteMessage, sendLocket, getUnviewedLocket, viewLocket, getVaultAlbum };