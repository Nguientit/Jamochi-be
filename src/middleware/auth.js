// middleware/auth.js

const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Couple } = require('../models');

// ── Xác thực JWT ─────────────────────────────────────────────────────────────
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ success: false, message: 'Thiếu token xác thực' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jamochi_secret_2026');

    const user = await User.findByPk(decoded.userId || decoded.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Tài khoản không hợp lệ' });
    }

    req.user = user;

    const couple = await Couple.findOne({
      where: {
        status: 'active',
        [Op.or]: [
          { user_1_id: user.id },
          { user_2_id: user.id },
        ],
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
          attributes: ['id', 'display_name', 'avatar_url', 'gender'], // Chỉ lấy các trường cần thiết
        },
      ],
    });

    req.couple = couple || null;
    req.coupleId = couple?.id || null;
    req.partnerId = couple
      ? (couple.user_1_id === user.id ? couple.user_2_id : couple.user_1_id)
      : null;

    // Cập nhật last_seen
    user.last_seen_at = new Date();
    await user.save({ silent: true }).catch(() => { }); // non-critical

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token đã hết hạn, hãy đăng nhập lại' });
    }
    console.error('[Auth Middleware] Error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xác thực' });
  }
};

// ── Kiểm tra đã ghép đôi chưa (dùng sau authenticateToken) ──────────────────
// Vì authenticateToken đã tìm couple rồi, middleware này chỉ cần check
const verifyCoupleAccess = (req, res, next) => {
  if (!req.couple) {
    return res.status(403).json({
      success: false,
      message: 'Bạn chưa ghép đôi với ai 💔 — hãy vào màn Invite trước',
    });
  }
  next();
};

module.exports = { authenticateToken, verifyCoupleAccess };