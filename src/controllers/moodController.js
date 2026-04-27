// controllers/moodController.js
// 📁 JAMOCHI/src/controllers/moodController.js

const moodService = require('../services/moodService');
const R = require('../utils/response');

// ── POST /api/mood/forecast ───────────────────────────────────────────────────
const upsertForecast = async (req, res) => {
  try {
    // 🛡️ FIX GỐC RỄ: req.couple có thể là undefined nếu middleware chưa gắn
    // Middleware verifyCoupleAccess phải chạy TRƯỚC và gắn req.couple
    const coupleId = req.couple?.id ?? req.coupleId ?? null;

    if (!coupleId) {
      return R.forbidden(res, 'Bạn chưa ghép đôi với ai 💔 — hãy vào màn Invite trước');
    }

    const { mood, mood_score, mood_emojis, needs, needs_note } = req.body;

    if (!mood) return R.badRequest(res, 'Thiếu thông tin mood');

    const result = await moodService.upsertForecast({
      userId:    req.user.id,
      coupleId,              // ← truyền đúng
      mood, mood_score, mood_emojis, needs, needs_note,
    });

    // 🎯 Emit Socket.IO để partner nhận real-time (nếu io được gắn vào app)
    const io = req.app.get('io');
    if (io) {
      const theme = moodService.getMoodTheme(mood);
      io.emit('partner-mood-changed', {
        couple_id:     coupleId,
        sender_id:     req.user.id,
        mood,
        theme_palette:         theme.palette,
        theme_primary_color:   theme.primary,
        theme_secondary_color: theme.secondary,
        timestamp: new Date(),
      });
    }

    return R.success(res, result, 'Dự báo hôm nay đã được lưu 🌤️');
  } catch (err) {
    console.error('[moodController] upsertForecast error:', err);
    return R.error(res, err.message, err.status || 500);
  }
};

// ── GET /api/mood/forecast/today ─────────────────────────────────────────────
const getTodayForecast = async (req, res) => {
  try {
    // 🛡️ FIX: Lấy coupleId từ nhiều nguồn phòng trường hợp middleware khác nhau
    const coupleId = req.couple?.id ?? req.coupleId ?? null;

    if (!coupleId) {
      return R.forbidden(res, 'Bạn chưa ghép đôi với ai 💔');
    }

    const result = await moodService.getTodayForecast(coupleId, req.user.id);
    return R.success(res, result);
  } catch (err) {
    console.error('[moodController] getTodayForecast error:', err);
    return R.error(res, err.message, err.status || 500);
  }
};

// ── GET /api/mood/forecast/history ───────────────────────────────────────────
const getForecastHistory = async (req, res) => {
  try {
    const days   = parseInt(req.query.days) || 30;
    const result = await moodService.getForecastHistory(req.user.id, days);
    return R.success(res, result);
  } catch (err) {
    console.error('[moodController] getForecastHistory error:', err);
    return R.error(res, err.message, err.status || 500);
  }
};

// ── GET /api/mood/theme-palettes ─────────────────────────────────────────────
const getThemePalettes = async (req, res) => {
  return R.success(res, moodService.MOOD_THEME_MAP, 'Bảng màu theo mood');
};

module.exports = { upsertForecast, getTodayForecast, getForecastHistory, getThemePalettes };