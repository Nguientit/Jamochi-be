// services/userService.js
const { User } = require('../models');

// ── Cập nhật thông tin cơ bản ────────────────────────────────────────────────
const updateProfile = async (userId, fields) => {
  const allowed = [
    'display_name', 'nickname', 'avatar_url', 'date_of_birth', 'gender',
  ];
  const updates = {};
  allowed.forEach((key) => { if (fields[key] !== undefined) updates[key] = fields[key]; });

  await User.update(updates, { where: { id: userId } });
  return User.findByPk(userId, { attributes: { exclude: ['password_hash', 'fcm_token'] } });
};

// ── Cập nhật số đo (Vault) ───────────────────────────────────────────────────
const updateMeasurements = async (userId, fields) => {
  const allowed = [
    'height_cm', 'weight_kg', 'bust_cm', 'waist_cm', 'hip_cm',
    'blood_type', 'shoe_size', 'allergies',
  ];
  const updates = {};
  allowed.forEach((key) => { if (fields[key] !== undefined) updates[key] = fields[key]; });

  await User.update(updates, { where: { id: userId } });
  return User.findByPk(userId, {
    attributes: [
      'id', 'display_name', 'height_cm', 'weight_kg',
      'bust_cm', 'waist_cm', 'hip_cm', 'blood_type', 'shoe_size', 'allergies',
    ],
  });
};

// ── Lấy thông tin partner ────────────────────────────────────────────────────
const getPartner = async (partnerId) => {
  return User.findByPk(partnerId, {
    attributes: { exclude: ['password_hash', 'fcm_token', 'email'] },
  });
};

module.exports = { updateProfile, updateMeasurements, getPartner };