// models/Achievement.js
// Tab "Thành Tích" — huy hiệu, streak, milestone cặp đôi

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

// ── Badge definitions (cố định, seed data) ──────────────────────────────────
const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,     // 'first_forecast', 'streak_7', 'perfect_week'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,     // "7 Ngày Liên Tiếp"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,      // "Dự báo 7 ngày liên tiếp không bỏ ngày nào"
  },
  icon_emoji: {
    type: DataTypes.STRING(10),
    defaultValue: '🏆',
  },
  icon_url: {
    type: DataTypes.TEXT,
    allowNull: true,      // custom badge image
  },
  category: {
    type: DataTypes.ENUM('streak', 'mood', 'couple', 'milestone', 'special'),
    defaultValue: 'milestone',
  },
  condition_type: {
    type: DataTypes.STRING(50),
    allowNull: true,      // 'forecast_streak', 'happy_days', 'anniversary'
  },
  condition_value: {
    type: DataTypes.INTEGER,
    allowNull: true,      // 7 (7 ngày streak), 30, 100...
  },
}, {
  tableName: 'badges',
  timestamps: false,
  paranoid: false,
});

// ── UserBadge — badge mà user đã đạt được ───────────────────────────────────
const UserBadge = sequelize.define('UserBadge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  couple_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'couples', key: 'id' },
  },
  badge_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: { model: 'badges', key: 'id' },
  },
  earned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,   // hiển thị animation "mới mở khóa"
  },
}, {
  tableName: 'user_badges',
  paranoid: false,
  indexes: [
    { unique: true, fields: ['user_id', 'badge_id'] },
  ],
});

// ── Streak — tracking chuỗi ngày liên tiếp ──────────────────────────────────
const Streak = sequelize.define('Streak', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  couple_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'couples', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('forecast', 'rating', 'chat'),
    allowNull: false,
  },
  current_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  longest_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_activity_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'streaks',
  paranoid: false,
  indexes: [
    { unique: true, fields: ['user_id', 'type'] },
  ],
});

module.exports = { Badge, UserBadge, Streak };