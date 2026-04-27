// middlewares/auth.js
const { verify } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/response');
const { User, Couple } = require('../models');

// ── Xác thực JWT ─────────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return unauthorized(res, 'Thiếu token xác thực');
    }

    const token = authHeader.split(' ')[1];
    const { valid, payload, error } = verify(token);

    if (!valid) {
      return unauthorized(res, `Token không hợp lệ: ${error}`);
    }

    const user = await User.findByPk(payload.userId, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user || !user.is_active) {
      return unauthorized(res, 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Gắn user + couple vào request
    req.user = user;

    // Tìm couple của user
    const couple = await Couple.findOne({
      where: {
        status: 'active',
        ...(require('sequelize').Op
          ? {}
          : {}),
      },
    });

    // Dùng raw query để tránh phụ thuộc Op
    const { Op } = require('sequelize');
    const activeCouple = await Couple.findOne({
      where: {
        status: 'active',
        [Op.or]: [
          { user_1_id: user.id },
          { user_2_id: user.id },
        ],
      },
    });

    req.couple = activeCouple || null;
    req.coupleId = activeCouple?.id || null;
    req.partnerId = activeCouple
      ? (activeCouple.user_1_id === user.id ? activeCouple.user_2_id : activeCouple.user_1_id)
      : null;

    // Cập nhật last_seen
    user.last_seen_at = new Date();
    await user.save({ silent: true });

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return unauthorized(res, 'Lỗi xác thực');
  }
};

// ── Yêu cầu phải có couple ───────────────────────────────────────────────────
const requireCouple = (req, res, next) => {
  if (!req.couple) {
    return forbidden(res, 'Bạn chưa kết nối với người ấy 💔');
  }
  next();
};

module.exports = { authenticate, requireCouple };