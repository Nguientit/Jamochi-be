// controllers/achievement.controller.js
const achieveService = require('../services/achievementService');
const R = require('../utils/response');

const upsertRating = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const { stars } = req.body;
    if (!stars) return R.badRequest(res, 'Thiếu stars (1-5)');
    const result = await achieveService.upsertDayRating({ userId: req.user.id, coupleId: req.coupleId, ...req.body });
    return R.success(res, result, 'Đã lưu đánh giá ngày hôm nay ⭐');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const getRatingHistory = async (req, res) => {
  try {
    const result = await achieveService.getRatingHistory(req.user.id, parseInt(req.query.days) || 30);
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const getSummary = async (req, res) => {
  try {
    const [summary, streaks, badges] = await Promise.all([
      achieveService.getRatingSummary(req.user.id),
      achieveService.getStreaks(req.user.id),
      achieveService.getUserBadges(req.user.id),
    ]);
    return R.success(res, { summary, streaks, badges });
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const markBadgeSeen = async (req, res) => {
  try {
    await achieveService.markBadgeSeen(req.user.id, req.params.badge_id);
    return R.success(res, null);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

module.exports = { upsertRating, getRatingHistory, getSummary, markBadgeSeen };

// ─────────────────────────────────────────────────────────────────────────────

// controllers/ai.controller.js
const aiService = require('../services/aiService');

const createSession = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const session = await aiService.createSession(req.user.id, req.coupleId);
    return R.created(res, session, 'Session mới đã tạo 🤖');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const chat = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { message } = req.body;
    if (!message?.trim()) return R.badRequest(res, 'Thiếu nội dung tin nhắn');
    const result = await aiService.chat({ sessionId: session_id, userId: req.user.id, coupleId: req.coupleId, userMessage: message });
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
    return R.success(res, null, 'Đã xóa session');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

// Need to re-require R since it's a different module scope
const RR = require('../utils/response');
module.exports.aiController = { createSession, chat, getSessions, getSessionTurns, deleteSession };