// controllers/vault.controller.js
const { Couple } = require('../models'); 
const specialDateService = require('../services/specialDateService');
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

const getSpecialDates = async (req, res) => {
  try {
    const coupleId = req.user.couple_id;
    const dates = await specialDateService.getDatesByCouple(coupleId);
    res.status(200).json({ success: true, data: dates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

// Thêm ngày kỷ niệm
const createSpecialDate = async (req, res) => {
  try {
    const coupleId = req.user.couple_id;
    const userId = req.user.id;
    const { title, date } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và ngày' });
    }

    // 🎯 Truyền userId vào service
    const newDate = await specialDateService.createDate(coupleId, userId, title, date);
    res.status(201).json({ success: true, data: newDate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

// Cập nhật ngày kỷ niệm
const updateSpecialDate = async (req, res) => {
  try {
    const coupleId = req.user.couple_id;
    const dateId = req.params.id; // Lấy từ /dates/:id
    const { title, date } = req.body;

    const updatedDate = await specialDateService.updateDate(coupleId, dateId, title, date);
    res.status(200).json({ success: true, data: updatedDate });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// Xóa ngày kỷ niệm
const deleteSpecialDate = async (req, res) => {
  try {
    const coupleId = req.user.couple_id;
    const dateId = req.params.id;

    await specialDateService.deleteDate(coupleId, dateId);
    res.status(200).json({ success: true, message: 'Đã xóa thành công' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateAnniversary = async (req, res) => {
  try {
    const coupleId = req.user.couple_id;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày' });
    }

    const couple = await Couple.findByPk(coupleId);
    if (!couple) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cặp đôi' });
    }

    // Cập nhật ngày vào DB
    await couple.update({ anniversary_date: date });

    res.status(200).json({ success: true, message: 'Đã cập nhật ngày bên nhau', data: couple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  }
};
module.exports = { updateProfile, updateMeasurements, getPartner, logPeriodStart, logPeriodEnd, getCycleHistory, getPeriodPrediction, createSpecialDate, getSpecialDates, updateSpecialDate, deleteSpecialDate, updateAnniversary };