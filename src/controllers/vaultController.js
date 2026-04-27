// controllers/vault.controller.js
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
    const result = await vaultService.logPeriodStart({ userId: req.user.id, coupleId: req.coupleId, period_start, symptoms, pain_level, notes });
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
const createSpecialDate = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const { title, target_date } = req.body;
    if (!title || !target_date) return R.badRequest(res, 'Thiếu title hoặc target_date');
    const result = await vaultService.createSpecialDate({ coupleId: req.coupleId, userId: req.user.id, ...req.body });
    return R.created(res, result, 'Đã thêm ngày đặc biệt 🎉');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const getSpecialDates = async (req, res) => {
  try {
    if (!req.couple) return R.forbidden(res, 'Chưa kết nối với người ấy 💔');
    const result = await vaultService.getSpecialDates(req.coupleId);
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const updateSpecialDate = async (req, res) => {
  try {
    const result = await vaultService.updateSpecialDate(req.params.date_id, req.coupleId, req.body);
    return R.success(res, result);
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

const deleteSpecialDate = async (req, res) => {
  try {
    await vaultService.deleteSpecialDate(req.params.date_id, req.coupleId);
    return R.success(res, null, 'Đã xóa');
  } catch (err) { return R.error(res, err.message, err.status || 500); }
};

module.exports = { updateProfile, updateMeasurements, getPartner, logPeriodStart, logPeriodEnd, getCycleHistory, getPeriodPrediction, createSpecialDate, getSpecialDates, updateSpecialDate, deleteSpecialDate };