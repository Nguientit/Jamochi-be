// routes/vaultRoutes.js
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
  updateAnniversary
} = require('../controllers/vaultController');
const { authenticateToken } = require('../middleware/auth');
const { verifyCoupleAccess } = require('../middleware/auth');

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
router.get('/dates', verifyCoupleAccess, getSpecialDates);
router.post('/dates', verifyCoupleAccess, createSpecialDate);
router.put('/dates/:id', verifyCoupleAccess, updateSpecialDate);
router.delete('/dates/:id', verifyCoupleAccess, deleteSpecialDate);
router.put('/anniversary', verifyCoupleAccess, updateAnniversary); 

module.exports = router;