// models/AIConversation.js
// Tab "Bro AI" — lịch sử hỏi đáp với chatbot
// Mỗi session là 1 cuộc trò chuyện, gồm nhiều turns

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

// ── Session (1 cuộc trò chuyện) ─────────────────────────────────────────────
const AISession = sequelize.define('AISession', {
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

  // Tiêu đề tự động tóm tắt session
  title: {
    type: DataTypes.STRING(200),
    allowNull: true,   // "Cô ấy nói tùy anh thì sao?"
  },

  // Tổng số lượt trong session
  turn_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Chủ đề chính (AI tự tag)
  topic: {
    type: DataTypes.ENUM(
      'decode_gf',      // giải mã ý của cô ấy
      'gift_idea',      // gợi ý quà
      'date_plan',      // lên kế hoạch hẹn hò
      'apology',        // xin lỗi / làm lành
      'general',        // câu hỏi chung
      'period_advice',  // lời khuyên khi tới kỳ
    ),
    defaultValue: 'general',
  },

}, {
  tableName: 'ai_sessions',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
  ],
});

// ── Turn (1 lượt hỏi–đáp trong session) ────────────────────────────────────
const AITurn = sequelize.define('AITurn', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  session_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'ai_sessions', key: 'id' },
  },

  role: {
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // Token usage để tracking cost
  input_tokens: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  output_tokens: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // Người dùng có save/bookmark câu trả lời này không
  is_saved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  tableName: 'ai_turns',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false,   // không cần soft delete cho turns
  indexes: [
    { fields: ['session_id'] },
  ],
});

module.exports = { AISession, AITurn };