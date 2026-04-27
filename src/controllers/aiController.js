// controllers/ai.controller.js
const aiService = require('../services/aiService');
const R = require('../utils/response');

const createSession = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const session = await aiService.createSession(req.user.id, req.coupleId);
    return R.created(res, session, 'Bro AI sẵn sàng rồi 🤖');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const chat = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { message } = req.body;
    if (!message?.trim()) return R.badRequest(res, 'Thiếu nội dung');
    const result = await aiService.chat({
      sessionId: session_id,
      userId: req.user.id,
      coupleId: req.coupleId,
      userMessage: message,
    });
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const getSessions = async (req, res) => {
  try {
    const result = await aiService.getSessions(req.user.id, parseInt(req.query.page) || 1);
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const getSessionTurns = async (req, res) => {
  try {
    const result = await aiService.getSessionTurns(req.params.session_id, req.user.id);
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const deleteSession = async (req, res) => {
  try {
    await aiService.deleteSession(req.params.session_id, req.user.id);
    return R.success(res, null, 'Đã xóa cuộc trò chuyện');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

module.exports = { createSession, chat, getSessions, getSessionTurns, deleteSession };