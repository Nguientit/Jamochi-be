// middleware/couple.js
// Middleware xác thực xem user có trong cặp đôi không

const { Couple } = require('../models/index');
const R = require('../utils/response');

const verifyCoupleAccess = async (req, res, next) => {
  try {
    let coupleId = req.query.couple_id || req.body.couple_id || req.params.couple_id;
    let couple;

    if (coupleId) {
      // Nếu có couple_id, kiểm tra xem user có trong cặp đôi này không
      couple = await Couple.findOne({
        where: {
          id: coupleId,
          [require('sequelize').Op.or]: [
            { user_1_id: req.user.id },
            { user_2_id: req.user.id },
          ],
        },
      });
    } else {
      // Nếu không có couple_id, tự động tìm cặp đôi của user
      couple = await Couple.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { user_1_id: req.user.id },
            { user_2_id: req.user.id },
          ],
        },
      });
    }

    if (!couple) {
      return R.forbidden(res, 'Bạn không có quyền truy cập dữ liệu này 🔒');
    }

    // Lưu thông tin couple vào request
    req.couple = couple;
    req.coupleId = couple.id;
    
    // Xác định partner ID
    req.partnerId = couple.user_1_id === req.user.id ? couple.user_2_id : couple.user_1_id;

    next();
  } catch (error) {
    return R.error(res, error.message, 500);
  }
};

module.exports = { verifyCoupleAccess };
