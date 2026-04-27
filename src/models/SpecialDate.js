// models/SpecialDate.js
// Vault — lưu các ngày đặc biệt: kỷ niệm, sinh nhật, đếm ngược, nhắc nhở

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const SpecialDate = sequelize.define('SpecialDate', {
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
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },

  title: {
    type: DataTypes.STRING(200),
    allowNull: false,           // "Ngày yêu nhau", "Sinh nhật em yêu"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Loại ngày đặc biệt
  type: {
    type: DataTypes.ENUM(
      'anniversary',     // ngày kỷ niệm (lặp lại hàng năm)
      'birthday',        // sinh nhật
      'countdown',       // đếm ngược đến 1 sự kiện cụ thể
      'reminder',        // nhắc nhở 1 lần
      'monthly',         // lặp lại hàng tháng (ngày yêu nhau tháng này)
    ),
    allowNull: false,
    defaultValue: 'anniversary',
  },

  target_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  // Lặp lại?
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurrence: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
    allowNull: true,
  },

  // Màu & icon hiển thị trong Vault
  icon_emoji: {
    type: DataTypes.STRING(10),
    defaultValue: '🎉',
  },
  color_hex: {
    type: DataTypes.STRING(7),
    defaultValue: '#FFD6E0',
  },

  // Thông báo trước bao nhiêu ngày?
  notify_days_before: {
    type: DataTypes.SMALLINT,
    defaultValue: 3,
  },
  is_notification_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  tableName: 'special_dates',
  indexes: [
    { fields: ['couple_id', 'target_date'] },
    { fields: ['couple_id', 'type'] },
  ],
});

module.exports = SpecialDate;