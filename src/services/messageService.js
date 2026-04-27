// services/messageService.js — Chat & Locket
const { Message, LocketPhoto, User } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('./notificationService');

// ════════════════════════════════════════════════════════════
// CHAT
// ════════════════════════════════════════════════════════════

// ── Gửi tin nhắn ─────────────────────────────────────────────────────────────
const sendMessage = async ({ coupleId, senderId, receiverId, type = 'text', content, media_url, reply_to_id, sticker_id }) => {
  if (type === 'text' && !content?.trim()) throw { status: 400, message: 'Nội dung tin nhắn không được trống' };

  const message = await Message.create({
    couple_id: coupleId,
    sender_id: senderId,
    receiver_id: receiverId,
    type,
    content: content?.trim() || null,
    media_url: media_url || null,
    reply_to_id: reply_to_id || null,
    sticker_id: sticker_id || null,
  });

  // Push notification
  try {
    const sender = await User.findByPk(senderId, { attributes: ['display_name'] });
    const notifBody = type === 'text' ? content : type === 'image' ? '📷 Đã gửi một ảnh' : `📎 Đã gửi ${type}`;
    await notificationService.notifyUser(receiverId, {
      title: sender.display_name,
      body: notifBody,
      data: { type: 'new_message', message_id: message.id },
    });
  } catch (e) { /* non-critical */ }

  return message;
};

// ── Lấy lịch sử chat (phân trang cursor) ─────────────────────────────────────
const getMessages = async ({ coupleId, before, limit = 30 }) => {
  const where = {
    couple_id: coupleId,
    is_deleted_by_sender: false,
    ...(before && { created_at: { [Op.lt]: new Date(before) } }),
  };

  const messages = await Message.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    include: [
      { model: Message, as: 'replyTo', attributes: ['id', 'content', 'type', 'sender_id'] },
    ],
  });

  return messages.reverse();
};

// ── Đánh dấu đã đọc ──────────────────────────────────────────────────────────
const markRead = async (coupleId, receiverId) => {
  await Message.update(
    { is_read: true, read_at: new Date() },
    { where: { couple_id: coupleId, receiver_id: receiverId, is_read: false } }
  );
};

// ── Reaction cho tin nhắn ────────────────────────────────────────────────────
const reactToMessage = async (messageId, userId, emoji) => {
  const message = await Message.findByPk(messageId);
  if (!message) throw { status: 404, message: 'Tin nhắn không tồn tại' };
  if (message.receiver_id !== userId && message.sender_id !== userId)
    throw { status: 403, message: 'Không có quyền react tin nhắn này' };

  message.reaction = emoji || null;
  await message.save();
  return message;
};

// ── Xóa tin nhắn (soft delete) ───────────────────────────────────────────────
const deleteMessage = async (messageId, userId) => {
  const message = await Message.findByPk(messageId);
  if (!message) throw { status: 404, message: 'Tin nhắn không tồn tại' };

  if (message.sender_id === userId) message.is_deleted_by_sender = true;
  else if (message.receiver_id === userId) message.is_deleted_by_receiver = true;
  else throw { status: 403, message: 'Không có quyền xóa tin nhắn này' };

  await message.save();
};

// ════════════════════════════════════════════════════════════
// LOCKET PHOTO
// ════════════════════════════════════════════════════════════

// ── Gửi locket photo ─────────────────────────────────────────────────────────
const sendLocket = async ({ coupleId, senderId, receiverId, photo_url, thumbnail_url, caption, filter, sticker_overlay }) => {
  const locket = await LocketPhoto.create({
    couple_id: coupleId,
    sender_id: senderId,
    receiver_id: receiverId,
    photo_url,
    thumbnail_url: thumbnail_url || null,
    caption: caption || null,
    filter: filter || null,
    sticker_overlay: sticker_overlay || null,
  });

  try {
    const sender = await User.findByPk(senderId, { attributes: ['display_name'] });
    await notificationService.notifyUser(receiverId, {
      title: `${sender.display_name} gửi ảnh cho bạn 📸`,
      body: caption || 'Nhấn để xem ngay nhé!',
      data: { type: 'locket_photo', locket_id: locket.id },
    });
  } catch (e) { /* non-critical */ }

  return locket;
};

// ── Lấy locket chưa xem ──────────────────────────────────────────────────────
const getUnviewedLocket = async (receiverId) => {
  return LocketPhoto.findOne({
    where: { receiver_id: receiverId, is_viewed: false },
    order: [['created_at', 'DESC']],
    include: [{ model: User, as: 'sender', attributes: ['id', 'display_name', 'avatar_url'] }],
  });
};

// ── Xem locket (đánh dấu đã xem) ────────────────────────────────────────────
const viewLocket = async (locketId, receiverId, { save_to_vault = false, reaction_emoji = null }) => {
  const locket = await LocketPhoto.findByPk(locketId);
  if (!locket) throw { status: 404, message: 'Ảnh không tồn tại' };
  if (locket.receiver_id !== receiverId) throw { status: 403, message: 'Không có quyền xem ảnh này' };

  locket.is_viewed = true;
  locket.viewed_at = new Date();
  locket.is_saved_to_vault = save_to_vault;
  if (reaction_emoji) locket.reaction_emoji = reaction_emoji;
  await locket.save();

  return locket;
};

// ── Album vault (các ảnh đã lưu) ─────────────────────────────────────────────
const getVaultAlbum = async (coupleId, page = 1, limit = 20) => {
  return LocketPhoto.findAndCountAll({
    where: { couple_id: coupleId, is_saved_to_vault: true },
    order: [['created_at', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    include: [{ model: User, as: 'sender', attributes: ['id', 'display_name', 'avatar_url'] }],
  });
};

module.exports = {
  sendMessage, getMessages, markRead, reactToMessage, deleteMessage,
  sendLocket, getUnviewedLocket, viewLocket, getVaultAlbum,
};