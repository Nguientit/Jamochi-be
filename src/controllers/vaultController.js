// controllers/vault.controller.js
const { Couple } = require('../models');
const vaultService = require('../services/vaultService');
const userService = require('../services/userService');
const R = require('../utils/response');

// ── Profile & Số đo ───────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const result = await userService.updateProfile(req.user.id, req.body);
    return R.success(res, result, 'Cập nhật thông tin thành công');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const updateMeasurements = async (req, res) => {
  try {
    const result = await userService.updateMeasurements(req.user.id, req.body);
    return R.success(res, result, 'Cập nhật số đo thành công 📏');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const getPartner = async (req, res) => {
  try {
    if (!req.partnerId) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const partner = await userService.getPartner(req.partnerId);
    return R.success(res, partner);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

// ── Menstrual Cycle ──────────────────────────────────────────────────────────
const logPeriodStart = async (req, res) => {
  try {
    const { period_start, symptoms, pain_level, notes } = req.body;
    if (!period_start) return R.badRequest(res, 'Thiếu ngày bắt đầu');
    const result = await vaultService.logPeriodStart({
      userId: req.user.id,
      coupleId: req.coupleId,
      period_start, symptoms, pain_level, notes,
    });
    return R.created(res, result, 'Đã ghi nhận kỳ kinh 🌸');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const logPeriodEnd = async (req, res) => {
  try {
    const { period_end, flow_level } = req.body;
    const result = await vaultService.logPeriodEnd(req.params.cycle_id, req.user.id, { period_end, flow_level });
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const getCycleHistory = async (req, res) => {
  try {
    const result = await vaultService.getCycleHistory(req.user.id, parseInt(req.query.limit) || 6);
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const getPeriodPrediction = async (req, res) => {
  try {
    const result = await vaultService.getNextPeriodPrediction(req.user.id);
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

// ── Special Dates ─────────────────────────────────────────────────────────────
const getSpecialDates = async (req, res) => {
  try {
    const dates = await vaultService.getSpecialDates(req.coupleId);
    return R.success(res, dates);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const createSpecialDate = async (req, res) => {
  try {
    const {
      title, description, type, date,
      is_recurring, recurrence,
      icon_emoji, color_hex, notify_days_before,
    } = req.body;

    if (!title || !date) return R.badRequest(res, 'Thiếu title hoặc date');

    const result = await vaultService.createSpecialDate({
      coupleId: req.coupleId,
      userId: req.user.id,
      title,
      description,
      type: type || 'anniversary',
      target_date: date,
      is_recurring,
      recurrence,
      icon_emoji,
      color_hex,
      notify_days_before,
    });

    return R.created(res, result, 'Thêm ngày đặc biệt thành công ✨');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const updateSpecialDate = async (req, res) => {
  try {
    const {
      title, description, date,
      icon_emoji, color_hex,
      notify_days_before, is_notification_enabled,
    } = req.body;

    // Map `date` → `target_date` để khớp với service
    const updates = {
      title, description,
      target_date: date,
      icon_emoji, color_hex,
      notify_days_before, is_notification_enabled,
    };

    // Loại bỏ các key undefined để không ghi đè giá trị cũ
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const result = await vaultService.updateSpecialDate(req.params.id, req.coupleId, updates);
    return R.success(res, result, 'Cập nhật thành công');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const deleteSpecialDate = async (req, res) => {
  try {
    await vaultService.deleteSpecialDate(req.params.id, req.coupleId);
    return R.success(res, null, 'Đã xóa thành công');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const updateAnniversary = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return R.badRequest(res, 'Vui lòng chọn ngày');

    const couple = await Couple.findByPk(req.coupleId);
    if (!couple) return R.notFound(res, 'Không tìm thấy cặp đôi');

    await couple.update({ anniversary_date: date });
    return R.success(res, couple, 'Đã cập nhật ngày bên nhau 💕');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

module.exports = {
  updateProfile, updateMeasurements, getPartner,
  logPeriodStart, logPeriodEnd, getCycleHistory, getPeriodPrediction,
  createSpecialDate, getSpecialDates, updateSpecialDate, deleteSpecialDate,
  updateAnniversary,
};