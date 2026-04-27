// services/notificationService.js
// Firebase FCM — gửi push notification cho partner

const admin = require('firebase-admin');
const { User, Couple } = require('../models');
const { Op } = require('sequelize');

// ── Gửi notification cho partner ─────────────────────────────────────────────
const notifyPartner = async (coupleId, senderId, { title, body, data = {} }) => {
  const couple = await Couple.findByPk(coupleId);
  if (!couple) return;

  const partnerId = couple.user_1_id === senderId ? couple.user_2_id : couple.user_1_id;
  const partner = await User.findByPk(partnerId, { attributes: ['fcm_token'] });

  if (!partner?.fcm_token) return; // partner chưa đăng nhập thiết bị

  const message = {
    token: partner.fcm_token,
    notification: { title, body },
    data: { ...data, coupleId, senderId },
    android: {
      priority: 'high',
      notification: { sound: 'default', channelId: 'jamochi_default' },
    },
    apns: {
      payload: { aps: { sound: 'default', badge: 1 } },
    },
  };

  try {
    const result = await admin.messaging().send(message);
    console.log('📬 Notification sent:', result);
    return result;
  } catch (err) {
    console.warn('FCM error:', err.message);
  }
};

// ── Gửi notification cho 1 user cụ thể ──────────────────────────────────────
const notifyUser = async (userId, { title, body, data = {} }) => {
  const user = await User.findByPk(userId, { attributes: ['fcm_token'] });
  if (!user?.fcm_token) return;

  await admin.messaging().send({
    token: user.fcm_token,
    notification: { title, body },
    data,
    android: { priority: 'high' },
  });
};

module.exports = { notifyPartner, notifyUser };