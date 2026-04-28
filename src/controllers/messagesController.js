// controllers/message.controller.js
const msgService = require('../services/messageService');
const R = require('../utils/response');

// ── Chat ──────────────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');

    const { type, content, reply_to_id, sticker_id } = req.body;
    const final_media_url = req.file ? req.file.location : req.body.media_url;

    const msg = await msgService.sendMessage({
      coupleId: req.couple.id,
      senderId: req.user.id,
      receiverId: req.partnerId,
      type, content, reply_to_id, sticker_id,
      media_url: final_media_url,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('receive-message', msg);
    }

    try {
      const partner = await User.findByPk(req.partnerId);

      if (partner && partner.fcm_token) {
        let bodyText = content;
        if (type === 'image') bodyText = 'Đã gửi một ảnh';
        if (type === 'sticker') bodyText = 'Đã gửi một nhãn dán';

        const payload = {
          token: partner.fcm_token,
          notification: {
            title: req.user.displayName || 'Người yêu bạn',
            body: bodyText,
          },
          data: {
            type: 'chat_message',
            message_id: msg.id.toString(),
          }
        };

        await messaging.send(payload);
        console.log('✅ Đã bắn thông báo Push Notification tới:', partner.displayName);
      }
    } catch (pushErr) {
      console.error('🚨 Lỗi gửi thông báo Push:', pushErr);
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

    // 🎯 Lấy link ảnh từ S3 (nếu có file upload) hoặc từ body (nếu test API)
    const photo_url = req.file ? req.file.location : req.body.photo_url;

    if (!photo_url) return R.badRequest(res, 'Chưa có ảnh nào được tải lên!');

    const { caption, filter, sticker_overlay } = req.body;

    const locket = await msgService.sendLocket({
      coupleId: req.couple.id, // 🎯 Đảm bảo dùng req.couple.id
      senderId: req.user.id,
      receiverId: req.partnerId,
      photo_url,
      thumbnail_url: photo_url, // Lấy luôn link S3 làm ảnh thu nhỏ
      caption, filter, sticker_overlay,
    });

    // Phát sự kiện Socket cho người ấy
    const io = req.app.get('io');
    if (io) {
      io.emit('locket-photo-received', locket);
    }

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
    const result = await msgService.getVaultAlbum(req.couple.id, parseInt(page) || 1, parseInt(limit) || 20);
    return R.success(res, result);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

module.exports = { sendMessage, getMessages, reactMessage, deleteMessage, sendLocket, getUnviewedLocket, viewLocket, getVaultAlbum };