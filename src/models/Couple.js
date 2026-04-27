// models/Couple.js
// Liên kết 2 người dùng thành một cặp đôi duy nhất
// App chỉ phục vụ 1 cặp, nhưng model này giúp mở rộng nếu cần

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const Couple = sequelize.define('Couple', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // 2 thành viên
  user_1_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  user_2_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },

  // --- Thông tin cặp đôi ---
  couple_name: {
    type: DataTypes.STRING(100),   // "Mochi & Jello", "Nam & Linh"...
    allowNull: true,
  },
  anniversary_date: {
    type: DataTypes.DATEONLY,       // ngày yêu nhau
    allowNull: true,
  },
  couple_avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // --- Invite system ---
  invite_code: {
    type: DataTypes.STRING(8),      // mã mời 8 ký tự để kết nối
    unique: true,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'paused'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'couples',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['user_1_id', 'user_2_id'] },
    { unique: true, fields: ['invite_code'] },
  ],
});

module.exports = Couple;