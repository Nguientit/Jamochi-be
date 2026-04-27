// services/vault.service.js — Tab "Vault"
const { MenstrualCycle, SpecialDate, User } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('./notificationService');

// ════════════════════════════════════════════════════════════
// MENSTRUAL CYCLE
// ════════════════════════════════════════════════════════════

const logPeriodStart = async ({ userId, coupleId, period_start, symptoms, pain_level, notes }) => {
  // Tính toán dự báo dựa trên lịch sử
  const lastCycles = await MenstrualCycle.findAll({
    where: { user_id: userId },
    order: [['period_start', 'DESC']],
    limit: 3,
  });

  let avgCycleLength = 28; // mặc định
  if (lastCycles.length >= 2) {
    const lengths = [];
    for (let i = 0; i < lastCycles.length - 1; i++) {
      const diff = Math.abs(
        new Date(lastCycles[i].period_start) - new Date(lastCycles[i + 1].period_start)
      ) / (1000 * 60 * 60 * 24);
      lengths.push(diff);
    }
    avgCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  }

  const startDate = new Date(period_start);
  const predictedNext = new Date(startDate);
  predictedNext.setDate(predictedNext.getDate() + avgCycleLength);

  const predictedOvulation = new Date(startDate);
  predictedOvulation.setDate(predictedOvulation.getDate() + 14);

  const cycle = await MenstrualCycle.create({
    user_id: userId,
    couple_id: coupleId,
    period_start,
    symptoms: symptoms || [],
    pain_level: pain_level || null,
    notes: notes || null,
    cycle_length_days: avgCycleLength,
    predicted_next_start: predictedNext.toISOString().split('T')[0],
    predicted_ovulation: predictedOvulation.toISOString().split('T')[0],
  });

  // Cảnh báo cho bạn trai
  try {
    await notificationService.notifyPartner(coupleId, userId, {
      title: '🌸 Nhắc nhở nhẹ',
      body: 'Người ấy đang trong kỳ, hãy quan tâm thêm nhé 💕',
      data: { type: 'period_started' },
    });
  } catch (e) { /* non-critical */ }

  return cycle;
};

const logPeriodEnd = async (cycleId, userId, { period_end, flow_level }) => {
  const cycle = await MenstrualCycle.findOne({ where: { id: cycleId, user_id: userId } });
  if (!cycle) throw { status: 404, message: 'Không tìm thấy chu kỳ' };

  cycle.period_end = period_end;
  cycle.flow_level = flow_level || null;
  await cycle.save();
  return cycle;
};

const getCycleHistory = async (userId, limit = 6) => {
  return MenstrualCycle.findAll({
    where: { user_id: userId },
    order: [['period_start', 'DESC']],
    limit,
  });
};

const getNextPeriodPrediction = async (userId) => {
  const latest = await MenstrualCycle.findOne({
    where: { user_id: userId },
    order: [['period_start', 'DESC']],
  });

  if (!latest) return null;

  const today = new Date();
  const nextStart = new Date(latest.predicted_next_start);
  const daysUntil = Math.ceil((nextStart - today) / (1000 * 60 * 60 * 24));

  return {
    predicted_next_start: latest.predicted_next_start,
    predicted_ovulation: latest.predicted_ovulation,
    days_until_next: daysUntil,
    pms_warning: daysUntil <= 5 && daysUntil > 0, // cảnh báo PMS 5 ngày trước
    cycle_length_days: latest.cycle_length_days,
  };
};

// ════════════════════════════════════════════════════════════
// SPECIAL DATES
// ════════════════════════════════════════════════════════════

const createSpecialDate = async ({ coupleId, userId, title, description, type, target_date, is_recurring, recurrence, icon_emoji, color_hex, notify_days_before }) => {
  return SpecialDate.create({
    couple_id: coupleId,
    created_by: userId,
    title,
    description: description || null,
    type: type || 'anniversary',
    target_date,
    is_recurring: is_recurring ?? false,
    recurrence: recurrence || null,
    icon_emoji: icon_emoji || '🎉',
    color_hex: color_hex || '#FFD6E0',
    notify_days_before: notify_days_before ?? 3,
  });
};

const getSpecialDates = async (coupleId) => {
  const dates = await SpecialDate.findAll({
    where: { couple_id: coupleId },
    order: [['target_date', 'ASC']],
  });

  const today = new Date();

  // Tính số ngày còn lại cho mỗi ngày đặc biệt
  return dates.map((d) => {
    const target = new Date(d.target_date);
    let nextOccurrence = new Date(target);

    if (d.is_recurring) {
      // Tính lần tiếp theo
      if (d.recurrence === 'yearly') {
        nextOccurrence.setFullYear(today.getFullYear());
        if (nextOccurrence < today) nextOccurrence.setFullYear(today.getFullYear() + 1);
      } else if (d.recurrence === 'monthly') {
        nextOccurrence.setMonth(today.getMonth());
        nextOccurrence.setFullYear(today.getFullYear());
        if (nextOccurrence < today) nextOccurrence.setMonth(today.getMonth() + 1);
      }
    }

    const daysLeft = Math.ceil((nextOccurrence - today) / (1000 * 60 * 60 * 24));
    const daysElapsed = d.type === 'anniversary'
      ? Math.floor((today - new Date(d.target_date)) / (1000 * 60 * 60 * 24))
      : null;

    return {
      ...d.toJSON(),
      days_left: daysLeft,
      days_elapsed: daysElapsed,
      next_occurrence: nextOccurrence.toISOString().split('T')[0],
    };
  });
};

const updateSpecialDate = async (dateId, coupleId, updates) => {
  const date = await SpecialDate.findOne({ where: { id: dateId, couple_id: coupleId } });
  if (!date) throw { status: 404, message: 'Không tìm thấy ngày đặc biệt' };

  const allowed = ['title', 'description', 'target_date', 'icon_emoji', 'color_hex', 'notify_days_before', 'is_notification_enabled'];
  allowed.forEach((k) => { if (updates[k] !== undefined) date[k] = updates[k]; });
  await date.save();
  return date;
};

const deleteSpecialDate = async (dateId, coupleId) => {
  const date = await SpecialDate.findOne({ where: { id: dateId, couple_id: coupleId } });
  if (!date) throw { status: 404, message: 'Không tìm thấy ngày đặc biệt' };
  await date.destroy();
};

module.exports = {
  logPeriodStart, logPeriodEnd, getCycleHistory, getNextPeriodPrediction,
  createSpecialDate, getSpecialDates, updateSpecialDate, deleteSpecialDate,
};