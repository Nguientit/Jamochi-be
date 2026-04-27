// models/MoodForecast.js
// Tab "Dự Báo" — cô ấy check-in tâm trạng & nhu cầu mỗi ngày
// Dữ liệu này điều khiển màu giao diện của cả 2 người

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const MoodForecast = sequelize.define('MoodForecast', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  couple_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'couples', key: 'id' },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },

  forecast_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  // --- Mood chính ---
  mood: {
    type: DataTypes.ENUM(
      'happy',      // 😊 Vui
      'sad',        // 😢 Buồn
      'angry',      // 😠 Giận
      'tired',      // 😴 Mệt
      'anxious',    // 😰 Lo lắng
      'romantic',   // 🥰 Tình cảm
      'normal'      // 😐 Bình thường
    ),
    allowNull: false,
    defaultValue: 'normal',
  },

  // Điểm mood 1–10 (để vẽ biểu đồ)
  mood_score: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    validate: { min: 1, max: 10 },
  },

  // Emoji biểu đạt (có thể pick nhiều)
  mood_emojis: {
    type: DataTypes.ARRAY(DataTypes.STRING(10)),  // ['😊', '🥰', '✨']
    defaultValue: [],
  },

  // --- Nhu cầu hôm nay (cô ấy muốn anh làm gì) ---
  needs: {
    type: DataTypes.ARRAY(DataTypes.STRING(50)),
    // ví dụ: ['quality_time', 'physical_touch', 'words_of_affirmation']
    defaultValue: [],
  },
  needs_note: {
    type: DataTypes.TEXT,        // ghi chú thêm bằng lời
    allowNull: true,
  },

  // --- Theme màu được gán tự động theo mood ---
  // Lưu lại để đảm bảo nhất quán kể cả khi logic thay đổi
  theme_palette: {
    type: DataTypes.ENUM(
      'peach',      // 😊 happy
      'lavender',   // 😢 sad
      'coral',      // 😠 angry
      'mint',       // 😴 tired
      'sky',        // 😰 anxious
      'rose',       // 🥰 romantic
      'cream'       // 😐 normal
    ),
    allowNull: false,
    defaultValue: 'cream',
  },

  // Màu hex chính (primary) và phụ (secondary) của theme hôm nay
  theme_primary_color: {
    type: DataTypes.STRING(7),   // '#FFD6E0'
    allowNull: true,
  },
  theme_secondary_color: {
    type: DataTypes.STRING(7),
    allowNull: true,
  },

  // Đã xem bởi bạn trai chưa?
  is_seen_by_partner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  seen_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'mood_forecasts',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // Mỗi ngày chỉ có 1 dự báo / người
    { unique: true, fields: ['user_id', 'forecast_date'] },
    { fields: ['couple_id', 'forecast_date'] },
  ],
});

module.exports = MoodForecast;