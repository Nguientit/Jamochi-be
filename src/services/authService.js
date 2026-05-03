// services/authService.js
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { User, Couple } = require('../models');
const { sign } = require('../utils/jwt');

// ── Đăng ký ──────────────────────────────────────────────────────────────────
const register = async ({ email, password, display_name, date_of_birth, gender }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw { status: 409, message: 'Email đã được sử dụng' };

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    password_hash,
    display_name,
    date_of_birth: date_of_birth || null,
    gender: gender || null,
  });

  const token = sign({ id: user.id });
  const { password_hash: _, ...userData } = user.toJSON();
  return { user: userData, token };
};

// ── Đăng nhập ────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };

  if (!user.is_active) throw { status: 403, message: 'Tài khoản đã bị vô hiệu hóa' };

  const token = sign({ id: user.id });
  const { password_hash: _, ...userData } = user.toJSON();

  // Tìm couple
  const couple = await Couple.findOne({
    where: {
      status: 'active',
      [Op.or]: [{ user_1_id: user.id }, { user_2_id: user.id }],
    },
    include: [
      {
        model: User,
        as: 'user1',
        attributes: ['id', 'display_name', 'avatar_url', 'gender'],
      },
      {
        model: User,
        as: 'user2',
        attributes: ['id', 'display_name', 'avatar_url', 'gender'],
      },
    ],
  });

  return { user: userData, token, couple: couple || null };
};

// ── Tạo invite code để kết nối cặp đôi ──────────────────────────────────────
const generateInviteCode = async (userId) => {
  // Kiểm tra đã có couple chưa
  const existing = await Couple.findOne({
    where: {
      status: 'active',
      [Op.or]: [{ user_1_id: userId }, { user_2_id: userId }],
    },
  });
  if (existing) throw { status: 409, message: 'Bạn đã kết nối với người ấy rồi 💕' };

  // Tạo hoặc cập nhật pending couple
  let pendingCouple = await Couple.findOne({
    where: { user_1_id: userId, status: 'pending' },
  });

  const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  if (pendingCouple) {
    pendingCouple.invite_code = code;
    await pendingCouple.save();
  } else {
    pendingCouple = await Couple.create({
      user_1_id: userId,
      user_2_id: userId, // tạm, sẽ cập nhật khi accept
      invite_code: code,
      status: 'pending',
    });
  }

  return { invite_code: code, expires_hint: '24 giờ' };
};

// ── Nhập invite code để kết nối ──────────────────────────────────────────────
const acceptInvite = async (userId, inviteCode) => {
  const couple = await Couple.findOne({
    where: { invite_code: inviteCode, status: 'pending' },
  });

  if (!couple) throw { status: 404, message: 'Mã mời không hợp lệ hoặc đã hết hạn 💔' };
  if (couple.user_1_id === userId) throw { status: 400, message: 'Không thể tự kết nối với chính mình' };

  // Kiểm tra user này đã có couple chưa
  const existingCouple = await Couple.findOne({
    where: {
      status: 'active',
      [Op.or]: [{ user_1_id: userId }, { user_2_id: userId }],
    },
  });
  if (existingCouple) throw { status: 409, message: 'Bạn đã kết nối với người ấy rồi 💕' };

  couple.user_2_id = userId;
  couple.status = 'active';
  couple.invite_code = null;
  await couple.save();

  return couple;
};

// ── Lấy profile hiện tại ─────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash', 'fcm_token'] },
  });
  const couple = await Couple.findOne({
    where: {
      status: 'active',
      [Op.or]: [{ user_1_id: user.id }, { user_2_id: user.id }],
    },
    include: [
      {
        model: User,
        as: 'user1',
        attributes: ['id', 'display_name', 'nickname', 'avatar_url', 'gender'], 
      },
      {
        model: User,
        as: 'user2',
        attributes: ['id', 'display_name', 'nickname', 'avatar_url', 'gender'],
      },
    ],
  });
  return { user, couple };
};

module.exports = { register, login, generateInviteCode, acceptInvite, getMe };