// models/DayRating.js
// Tab "Thành Tích" — cô ấy chấm điểm ngày của mình
// Dùng để tính streak, badge, biểu đồ mood lịch sử

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const DayRating = sequelize.define('DayRating', {
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

  rating_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  // Điểm tổng ngày (1–5 sao)
  stars: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },

  // Điểm chi tiết (optional, để phân tích sâu hơn)
  mood_score: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    validate: { min: 1, max: 10 },
    comment: 'Tâm trạng trong ngày (1-10)',
  },
  partner_score: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    validate: { min: 1, max: 10 },
    comment: 'Anh ấy hôm nay được mấy điểm (1-10)',
  },

  // Highlight của ngày
  highlight: {
    type: DataTypes.TEXT,
    allowNull: true,           // "Hôm nay anh ấy nấu cơm cho em"
  },

  // Tags nhanh
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING(50)),
    defaultValue: [],
    // ví dụ: ['date_night', 'fight', 'makeup', 'sweet_moment', 'miss_him']
  },

  // Ảnh ngày hôm đó (lưu URL, tối đa 5 ảnh)
  photo_urls: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
  },

}, {
  tableName: 'day_ratings',
  indexes: [
    { unique: true, fields: ['user_id', 'rating_date'] },
    { fields: ['couple_id', 'rating_date'] },
  ],
});

module.exports = DayRating;