// controllers/settingsController.js
// Tab "Cài đặt"

const userService = require('../services/userService');
const R = require('../utils/response');

const getProfile = async (req, res) => {
  try {
    const result = await userService.getUserById(req.user.id);
    return R.success(res, result);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { display_name, nickname, avatar_url, date_of_birth, gender } = req.body;
    const result = await userService.updateProfile(req.user.id, {
      display_name,
      nickname,
      avatar_url,
      date_of_birth,
      gender,
    });
    return R.success(res, result, 'Cập nhật hồ sơ thành công 👤');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return R.badRequest(res, 'Thiếu mật khẩu cũ hoặc mới');
    }

    await userService.updatePassword(req.user.id, old_password, new_password);
    return R.success(res, null, 'Cập nhật mật khẩu thành công 🔐');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const updateTheme = async (req, res) => {
  try {
    const { theme_color, dark_mode } = req.body;
    const result = await userService.updateTheme(req.user.id, { theme_color, dark_mode });
    return R.success(res, result, 'Cập nhật giao diện thành công 🎨');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const getNotificationSettings = async (req, res) => {
  try {
    const result = await userService.getNotificationSettings(req.user.id);
    return R.success(res, result);
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const { push_enabled, email_enabled, sms_enabled } = req.body;
    const result = await userService.updateNotificationSettings(req.user.id, {
      push_enabled,
      email_enabled,
      sms_enabled,
    });
    return R.success(res, result, 'Cập nhật thông báo thành công 🔔');
  } catch (err) {
    return R.error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  updateTheme,
  getNotificationSettings,
  updateNotificationSettings,
};
