// models/Message.js
// Chat 1-1 giữa 2 người trong cặp đôi
// Hỗ trợ: text, ảnh, video, audio, locket photo, sticker

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const Message = sequelize.define('Message', {
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
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  receiver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },

  // --- Nội dung ---
  type: {
    type: DataTypes.ENUM(
      'text',
      'image',
      'video',
      'audio',
      'locket',       // ảnh chụp nhanh kiểu Locket widget
      'sticker',
      'gif',
      'location',
      'system'        // tin nhắn hệ thống: "Cặp đôi kết nối thành công 🎉"
    ),
    defaultValue: 'text',
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,   // nội dung text
  },
  media_url: {
    type: DataTypes.TEXT,
    allowNull: true,   // URL ảnh/video/audio
  },
  media_thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true,   // thumbnail cho video
  },
  media_duration_sec: {
    type: DataTypes.INTEGER,
    allowNull: true,   // thời lượng audio/video (giây)
  },
  sticker_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  // --- Reply ---
  reply_to_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'messages', key: 'id' },
  },

  // --- Trạng thái ---
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_deleted_by_sender: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_deleted_by_receiver: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // --- Reaction (tim, kiss, haha...) ---
  reaction: {
    type: DataTypes.STRING(10),
    allowNull: true,   // '❤️', '😂', '😮', '😢', '😡'
  },

  // Tin nhắn locket có xem được không (1 lần xem)
  is_locket_viewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  tableName: 'messages',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['couple_id'] },
    { fields: ['sender_id'] },
    { fields: ['receiver_id', 'is_read'] },
  ],
});

module.exports = Message;