// controllers/authController.js
const authService = require('../services/authService');
const R = require('../utils/response');

const register = async (req, res) => {
  try {
    const { email, password, display_name, date_of_birth, gender } = req.body;
    if (!email || !password || !display_name)
      return R.badRequest(res, 'Thiếu thông tin bắt buộc (email, password, display_name)');

    const result = await authService.register({ email, password, display_name, date_of_birth, gender });
    return R.created(res, result, 'Đăng ký thành công 🎉');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return R.badRequest(res, 'Thiếu email hoặc password');

    const result = await authService.login({ email, password });
    return R.success(res, result, 'Đăng nhập thành công 💕');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const generateInvite = async (req, res) => {
  try {
    const result = await authService.generateInviteCode(req.user.id);
    return R.success(res, result, 'Mã mời đã được tạo 🔗');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { invite_code } = req.body;
    if (!invite_code) return R.badRequest(res, 'Thiếu mã mời');

    const couple = await authService.acceptInvite(req.user.id, invite_code);
    return R.success(res, couple, 'Kết nối thành công 💑');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const getMe = async (req, res) => {
  try {
    const result = await authService.getMe(req.user.id);
    return R.success(res, result);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const updateFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token) return R.badRequest(res, 'Thiếu fcm_token');
    await authService.updateFcmToken(req.user.id, fcm_token);
    return R.success(res, null, 'Cập nhật FCM token thành công');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

module.exports = { register, login, generateInvite, acceptInvite, getMe, updateFcmToken };