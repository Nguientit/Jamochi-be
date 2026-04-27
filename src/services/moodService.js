// services/moodService.js — Tab "Dự Báo"
// 📁 JAMOCHI/src/services/moodService.js

const { MoodForecast, User, Couple } = require('../models');
const { Op } = require('sequelize');

// Dùng require an toàn để tránh circular dependency
const getNotificationService = () => {
  try { return require('./notificationService'); } catch { return null; }
};

// ── Bảng màu theo mood ───────────────────────────────────────────────────────
const MOOD_THEME_MAP = {
  happy:    { palette: 'peach',    primary: '#FFDAC1', secondary: '#FFB347' },
  sad:      { palette: 'lavender', primary: '#C8B6E2', secondary: '#9B8EC4' },
  angry:    { palette: 'coral',    primary: '#FF9AA2', secondary: '#FF6B6B' },
  tired:    { palette: 'mint',     primary: '#B5EAD7', secondary: '#78C2A4' },
  anxious:  { palette: 'sky',      primary: '#AED9E0', secondary: '#5BC8D6' },
  romantic: { palette: 'rose',     primary: '#FFD6E0', secondary: '#FF85A2' },
  normal:   { palette: 'cream',    primary: '#FFF5E4', secondary: '#E8D5C4' },
};

// ── Helper: tìm couple của user (dùng lại ở nhiều chỗ) ──────────────────────
const findActiveCouple = async (userId) => {
  return Couple.findOne({
    where: {
      status: 'active',
      [Op.or]: [{ user_1_id: userId }, { user_2_id: userId }],
    },
  });
};

// ── Tạo / cập nhật dự báo hôm nay ───────────────────────────────────────────
const upsertForecast = async ({
  userId, coupleId, mood,
  mood_score, mood_emojis, needs, needs_note,
}) => {
  // 🛡️ FIX: Validate đầu vào trước
  if (!userId)   throw { status: 400, message: 'Thiếu userId' };
  if (!coupleId) throw { status: 400, message: 'Thiếu coupleId — user chưa ghép đôi' };
  if (!mood || !MOOD_THEME_MAP[mood]) {
    throw { status: 400, message: `Mood không hợp lệ: ${mood}` };
  }

  const today = new Date().toISOString().split('T')[0];
  const theme = MOOD_THEME_MAP[mood];

  const [forecast] = await MoodForecast.upsert({
    user_id:              userId,
    couple_id:            coupleId,
    forecast_date:        today,
    mood,
    mood_score:           mood_score ?? 5,
    mood_emojis:          mood_emojis  || [],
    needs:                needs        || [],
    needs_note:           needs_note   || null,
    theme_palette:        theme.palette,
    theme_primary_color:  theme.primary,
    theme_secondary_color: theme.secondary,
    is_seen_by_partner:   false,
    seen_at:              null,
  }, {
    conflictFields: ['user_id', 'forecast_date'],
    returning: true,
  });

  // Push notification (non-critical)
  try {
    const ns   = getNotificationService();
    const user = await User.findByPk(userId, { attributes: ['display_name'] });
    if (ns?.notifyPartner) {
      await ns.notifyPartner(coupleId, userId, {
        title: `${user?.display_name || 'Người ấy'} vừa dự báo hôm nay 🌤️`,
        body:  `Tâm trạng: ${getMoodLabel(mood)}`,
        data:  { type: 'mood_forecast', mood, theme_palette: theme.palette },
      });
    }
  } catch (e) {
    console.warn('[MoodService] Push notification failed:', e.message);
  }

  return forecast;
};

// ── Lấy dự báo hôm nay ───────────────────────────────────────────────────────
// 🛡️ FIX HOÀN TOÀN: trả về object chuẩn cho cả 2 trường hợp (nam/nữ xem)
const getTodayForecast = async (coupleId, requesterId) => {
  if (!coupleId) throw { status: 400, message: 'Thiếu coupleId' };

  const today = new Date().toISOString().split('T')[0];

  const forecasts = await MoodForecast.findAll({
    where: {
      couple_id:     coupleId,
      forecast_date: today,
    },
    // 🛡️ FIX: Không dùng as: 'user_id' (trùng tên cột) — dùng alias rõ ràng
    include: [{
      model:      User,
      as:         'user',           // phải match association trong models/index.js
      attributes: ['id', 'display_name', 'avatar_url', 'gender'],
    }],
    order: [['created_at', 'DESC']],
  });

  // Chưa có ai dự báo hôm nay
  if (!forecasts || forecasts.length === 0) {
    return {
      has_forecast:   false,
      mood:           'normal',
      mood_score:     5,
      theme_palette:  'cream',
      theme_primary_color:   '#FFF5E4',
      theme_secondary_color: '#E8D5C4',
      message:        'Chưa có dự báo hôm nay 🌤️',
      partner_forecast: null,
      my_forecast:      null,
    };
  }

  // Phân loại: dự báo của mình vs của partner
  const myForecast      = forecasts.find(f => f.user_id === requesterId)  || null;
  const partnerForecast = forecasts.find(f => f.user_id !== requesterId)  || null;

  // Đánh dấu đã xem (nếu xem dự báo của partner)
  if (partnerForecast && !partnerForecast.is_seen_by_partner) {
    partnerForecast.is_seen_by_partner = true;
    partnerForecast.seen_at = new Date();
    await partnerForecast.save();
  }

  // 🎯 Mood hiển thị = ưu tiên mood của PARTNER (để chàng trai thấy màu của cô ấy)
  const displayForecast = partnerForecast || myForecast;

  return {
    has_forecast:          true,
    mood:                  displayForecast.mood,
    mood_score:            displayForecast.mood_score,
    theme_palette:         displayForecast.theme_palette,
    theme_primary_color:   displayForecast.theme_primary_color,
    theme_secondary_color: displayForecast.theme_secondary_color,
    needs:                 displayForecast.needs,
    needs_note:            displayForecast.needs_note,
    // Tách rõ để Flutter dùng linh hoạt
    partner_forecast: partnerForecast,
    my_forecast:      myForecast,
  };
};

// ── Lịch sử dự báo ───────────────────────────────────────────────────────────
const getForecastHistory = async (userId, days = 30) => {
  if (!userId) throw { status: 400, message: 'Thiếu userId' };

  const from = new Date();
  from.setDate(from.getDate() - days);

  return MoodForecast.findAll({
    where: {
      user_id:       userId,
      forecast_date: { [Op.gte]: from.toISOString().split('T')[0] },
    },
    order:      [['forecast_date', 'DESC']],
    attributes: ['forecast_date', 'mood', 'mood_score', 'theme_palette',
                 'theme_primary_color', 'theme_secondary_color'],
  });
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getMoodLabel = (mood) => ({
  happy:    '😊 Vui vẻ',
  sad:      '😢 Buồn',
  angry:    '😠 Đang giận đấy',
  tired:    '😴 Mệt nha',
  anxious:  '😰 Lo lắng',
  romantic: '🥰 Yêu thí',
  normal:   '😐 Phình phường',
}[mood] || mood);

const getMoodTheme = (mood) => MOOD_THEME_MAP[mood] || MOOD_THEME_MAP.normal;

module.exports = {
  upsertForecast, getTodayForecast, getForecastHistory,
  getMoodTheme, MOOD_THEME_MAP, findActiveCouple,
};