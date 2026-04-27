// models/LocketPhoto.js
// Vault — ảnh chụp nhanh gửi cho nhau kiểu Locket
// Hiện trên widget màn hình home của bạn trai

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const LocketPhoto = sequelize.define('LocketPhoto', {
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

  photo_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Caption ngắn
  caption: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },

  // Sticker/filter overlay
  filter: {
    type: DataTypes.STRING(50),
    allowNull: true,   // 'warm', 'cool', 'pink', 'vintage'
  },
  sticker_overlay: {
    type: DataTypes.JSONB,
    allowNull: true,   // { emoji: '🌸', x: 0.3, y: 0.7, scale: 1.2 }
  },

  // Đã xem chưa (Locket style: 1 lần xem rồi biến mất)
  is_viewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Lưu vào album hay không (sau khi xem)
  is_saved_to_vault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Reaction của người nhận
  reaction_emoji: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },

}, {
  tableName: 'locket_photos',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['couple_id'] },
    { fields: ['receiver_id', 'is_viewed'] },
  ],
});

module.exports = LocketPhoto;