// routes/vaultRoutes.js
// Tab "Vault" - Lưu thông tin số đo, ngày kỷ niệm, sinh nhật, v.v.

const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updateMeasurements,
  getPartner,
  logPeriodStart,
  logPeriodEnd,
  getCycleHistory,
  getPeriodPrediction,
  createSpecialDate,
  getSpecialDates,
  updateSpecialDate,
  deleteSpecialDate,
} = require('../controllers/vaultController');
const { authenticateToken } = require('../middleware/auth');
const { verifyCoupleAccess } = require('../middleware/couple');

// Tất cả các route Vault cần xác thực
router.use(authenticateToken);

// === Thông tin cá nhân & Số đo ===
router.put('/profile', updateProfile);
router.put('/measurements', updateMeasurements);
router.get('/partner', verifyCoupleAccess, getPartner);

// === Kỳ kinh nguyệt ===
router.post('/period/start', verifyCoupleAccess, logPeriodStart);
router.put('/period/:cycle_id/end', verifyCoupleAccess, logPeriodEnd);
router.get('/period/history', getCycleHistory);
router.get('/period/next-prediction', getPeriodPrediction);

// === Ngày đặc biệt (Kỷ niệm, Sinh nhật, 20/10, v.v.) ===
router.post('/special-dates', verifyCoupleAccess, createSpecialDate);
router.get('/special-dates', verifyCoupleAccess, getSpecialDates);
router.put('/special-dates/:date_id', verifyCoupleAccess, updateSpecialDate);
router.delete('/special-dates/:date_id', verifyCoupleAccess, deleteSpecialDate);

module.exports = router;
