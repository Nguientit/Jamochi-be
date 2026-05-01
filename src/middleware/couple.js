// middleware/couple.js
const { Couple } = require('../models/index');
const R = require('../utils/response');

const verifyCoupleAccess = async (req, res, next) => {
  try {
    let coupleId = req.user.couple_id || req.query.couple_id || req.body.couple_id;

    if (!coupleId) {
      const couple = await Couple.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { user_1_id: req.user.id },
            { user_2_id: req.user.id },
          ],
        },
      });

      if (!couple) {
        return R.forbidden(res, 'Bạn không có quyền truy cập dữ liệu này 🔒');
      }
      
      coupleId = couple.id;
      req.couple = couple;
      req.partnerId = couple.user_1_id === req.user.id ? couple.user_2_id : couple.user_1_id;
    }

    req.coupleId = coupleId; 
    
    next();
  } catch (error) {
    return R.error(res, "Lỗi xác thực cặp đôi: " + error.message, 500);
  }
};

module.exports = { verifyCoupleAccess };