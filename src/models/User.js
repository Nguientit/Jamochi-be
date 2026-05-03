// models/User.js
// Đại diện cho mỗi người dùng trong cặp đôi (chàng trai & cô gái)

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // --- Xác thực ---
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  // --- Thông tin cơ bản ---
  display_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },

  // --- Thông tin số đo (dành cho profile cô ấy) ---
  height_cm: {
    type: DataTypes.DECIMAL(5, 2),   // cm, ví dụ: 160.50
    allowNull: true,
  },
  weight_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  bust_cm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  waist_cm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  hip_cm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  blood_type: {
    type: DataTypes.ENUM('A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true,
  },
  shoe_size: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true,
  },
  allergies: {
    type: DataTypes.TEXT,           // ghi chú dị ứng
    allowNull: true,
  },

  // --- Trạng thái ---
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_seen_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['email'] },
  ],
});

module.exports = User;