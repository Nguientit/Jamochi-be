// models/MenstrualCycle.js
// Vault — theo dõi chu kỳ kinh nguyệt
// Tự động dự báo ngày tới, cảnh báo PMS cho bạn trai

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const MenstrualCycle = sequelize.define('MenstrualCycle', {
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

  // --- Chu kỳ cụ thể ---
  period_start: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  period_end: {
    type: DataTypes.DATEONLY,
    allowNull: true,          // null nếu chưa kết thúc
  },
  flow_level: {
    type: DataTypes.ENUM('light', 'normal', 'heavy'),
    allowNull: true,
  },

  // --- Triệu chứng ---
  symptoms: {
    type: DataTypes.ARRAY(DataTypes.STRING(50)),
    defaultValue: [],
    // 'cramps', 'headache', 'bloating', 'mood_swings', 'fatigue', 'acne'
  },
  pain_level: {
    type: DataTypes.SMALLINT,   // 1–10
    allowNull: true,
    validate: { min: 1, max: 10 },
  },

  // --- Ghi chú ---
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // --- Dự báo (tính toán sẵn) ---
  cycle_length_days: {
    type: DataTypes.SMALLINT,
    allowNull: true,            // độ dài chu kỳ lần này
  },
  predicted_next_start: {
    type: DataTypes.DATEONLY,
    allowNull: true,            // ngày bắt đầu dự kiến lần tới
  },
  predicted_ovulation: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

}, {
  tableName: 'menstrual_cycles',
  indexes: [
    { fields: ['user_id', 'period_start'] },
    { fields: ['couple_id'] },
  ],
});

module.exports = MenstrualCycle;