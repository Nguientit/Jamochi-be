// services/achievementService.js — Tab "Thành Tích"
const { DayRating, Streak, Badge, UserBadge, MoodForecast } = require('../models');
const { Op, fn, col } = require('sequelize');

// ════════════════════════════════════════════════════════════
// DAY RATING
// ════════════════════════════════════════════════════════════

const upsertDayRating = async ({ userId, coupleId, stars, mood_score, partner_score, highlight, tags, photo_urls }) => {
  const today = new Date().toISOString().split('T')[0];

  const [rating] = await DayRating.upsert({
    user_id: userId,
    couple_id: coupleId,
    rating_date: today,
    stars,
    mood_score: mood_score || null,
    partner_score: partner_score || null,
    highlight: highlight || null,
    tags: tags || [],
    photo_urls: photo_urls || [],
  }, { conflictFields: ['user_id', 'rating_date'], returning: true });

  // Cập nhật streak
  await updateStreak(userId, coupleId, 'rating');

  // Kiểm tra badge
  await checkAndAwardBadges(userId, coupleId);

  return rating;
};

const getRatingHistory = async (userId, days = 30) => {
  const from = new Date();
  from.setDate(from.getDate() - days);

  return DayRating.findAll({
    where: {
      user_id: userId,
      rating_date: { [Op.gte]: from.toISOString().split('T')[0] },
    },
    order: [['rating_date', 'DESC']],
  });
};

const getRatingSummary = async (userId) => {
  const ratings = await DayRating.findAll({
    where: { user_id: userId },
    attributes: ['stars', 'mood_score', 'partner_score', 'rating_date'],
  });

  if (!ratings.length) return null;

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    total_ratings: ratings.length,
    avg_stars: +avg(ratings.map((r) => r.stars)).toFixed(1),
    avg_mood: ratings.filter((r) => r.mood_score).length
      ? +avg(ratings.filter((r) => r.mood_score).map((r) => r.mood_score)).toFixed(1)
      : null,
    avg_partner_score: ratings.filter((r) => r.partner_score).length
      ? +avg(ratings.filter((r) => r.partner_score).map((r) => r.partner_score)).toFixed(1)
      : null,
  };
};

// ════════════════════════════════════════════════════════════
// STREAK
// ════════════════════════════════════════════════════════════

const updateStreak = async (userId, coupleId, type) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let [streak] = await Streak.findOrCreate({
    where: { user_id: userId, type },
    defaults: { couple_id: coupleId, current_streak: 0, longest_streak: 0 },
  });

  if (streak.last_activity_date === today) return streak; // sudah dihitung hari ini

  if (streak.last_activity_date === yesterdayStr) {
    streak.current_streak += 1;
  } else {
    streak.current_streak = 1; // reset streak
  }

  if (streak.current_streak > streak.longest_streak) {
    streak.longest_streak = streak.current_streak;
  }

  streak.last_activity_date = today;
  await streak.save();
  return streak;
};

const getStreaks = async (userId) => {
  return Streak.findAll({ where: { user_id: userId } });
};

// ════════════════════════════════════════════════════════════
// BADGES
// ════════════════════════════════════════════════════════════

const checkAndAwardBadges = async (userId, coupleId) => {
  const newBadges = [];

  // Đếm số ngày rating
  const ratingCount = await DayRating.count({ where: { user_id: userId } });
  const ratingStreak = await Streak.findOne({ where: { user_id: userId, type: 'rating' } });

  const badgesToCheck = [
    { id: 'first_rating',   condition: ratingCount >= 1 },
    { id: 'rating_7',       condition: ratingStreak?.current_streak >= 7 },
    { id: 'rating_30',      condition: ratingStreak?.current_streak >= 30 },
    { id: 'rating_100',     condition: ratingCount >= 100 },
  ];

  for (const { id, condition } of badgesToCheck) {
    if (!condition) continue;
    const already = await UserBadge.findOne({ where: { user_id: userId, badge_id: id } });
    if (!already) {
      await UserBadge.create({ user_id: userId, couple_id: coupleId, badge_id: id });
      newBadges.push(id);
    }
  }

  return newBadges;
};

const getUserBadges = async (userId) => {
  return UserBadge.findAll({
    where: { user_id: userId },
    include: [{ model: Badge }],
    order: [['earned_at', 'DESC']],
  });
};

const markBadgeSeen = async (userId, badgeId) => {
  await UserBadge.update({ is_new: false }, { where: { user_id: userId, badge_id: badgeId } });
};

module.exports = {
  upsertDayRating, getRatingHistory, getRatingSummary,
  updateStreak, getStreaks,
  getUserBadges, markBadgeSeen, checkAndAwardBadges,
};