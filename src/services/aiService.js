// services/aiService.js — Tab "Bro AI" powered by Google Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AISession, AITurn, User, MoodForecast, MenstrualCycle } = require('../models');
const { Op } = require('sequelize');

// Khởi tạo Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── System prompt của Bro AI ─────────────────────────────────────────────────
const buildSystemPrompt = async (userId, coupleId) => {
  const user = await User.findByPk(userId, { attributes: ['display_name', 'gender'] });

  const todayForecast = await MoodForecast.findOne({
    where: { couple_id: coupleId, forecast_date: new Date().toISOString().split('T')[0] },
    order: [['created_at', 'DESC']],
  });

  const latestCycle = await MenstrualCycle.findOne({
    where: { couple_id: coupleId },
    order: [['period_start', 'DESC']],
  });

  let contextInfo = '';
  if (todayForecast) {
    contextInfo += `\n- Hôm nay người ấy dự báo tâm trạng: ${todayForecast.mood}`;
    if (todayForecast.needs?.length) contextInfo += `, mong muốn: ${todayForecast.needs.join(', ')}`;
    if (todayForecast.needs_note) contextInfo += `, ghi chú: "${todayForecast.needs_note}"`;
  }
  if (latestCycle?.predicted_next_start) {
    const daysUntil = Math.ceil((new Date(latestCycle.predicted_next_start) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0 && daysUntil <= 7) {
      contextInfo += `\n- Kỳ kinh nguyệt dự kiến còn ${daysUntil} ngày nữa (mood có thể nhạy cảm hơn)`;
    }
  }

  return `Bạn là "Bro AI" — trợ lý thân thiết, hài hước nhưng chân thành dành cho ${user.display_name}, người đang trong một mối quan hệ yêu đương.

Nhiệm vụ của bạn:
1. Giúp anh ấy hiểu và đoán ý bạn gái (đặc biệt các câu như "tùy anh", "không sao", im lặng...)
2. Gợi ý cách nói chuyện, xoa dịu, làm lành phù hợp với người Việt Nam
3. Đề xuất quà, hoạt động, ngày hẹn hò
4. Đưa ra lời khuyên thực tế, không phán xét
5. Hiểu văn hóa và ngôn ngữ Việt Nam

Phong cách: Như người bạn thân hiểu chuyện — thân mật, dùng tiếng Việt tự nhiên, đôi khi hài hước nhưng luôn có ích. Dùng emoji vừa phải.

Thông tin context hôm nay:${contextInfo || '\n- Chưa có dự báo tâm trạng hôm nay'}

Lưu ý: Không phán xét bạn gái, luôn đặt cảm xúc cô ấy lên trước, gợi ý thực tế phù hợp văn hóa Việt.`;
};

// ── Tạo session mới ──────────────────────────────────────────────────────────
const createSession = async (userId, coupleId) => {
  return AISession.create({ user_id: userId, couple_id: coupleId });
};

// ── Chat trong session ───────────────────────────────────────────────────────
const chat = async ({ sessionId, userId, coupleId, userMessage }) => {
  // Lấy lịch sử trong session từ Database
  const turns = await AITurn.findAll({
    where: { session_id: sessionId },
    order: [['created_at', 'ASC']],
  });

  // Chuyển đổi lịch sử chat sang định dạng của Gemini (user và model)
  const history = turns.map((t) => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: t.content }],
  }));

  // Lưu tin nhắn của user vào DB
  await AITurn.create({
    session_id: sessionId,
    role: 'user',
    content: userMessage,
  });

  // Lấy Prompt ngữ cảnh
  const systemPrompt = await buildSystemPrompt(userId, coupleId);

  // Cấu hình Model Gemini 1.5 Flash (Nhanh, thông minh, hỗ trợ system instruction)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  // Khởi tạo luồng chat với lịch sử cũ
  const chatSession = model.startChat({
    history: history,
  });

  // Gửi tin nhắn mới cho Gemini
  const result = await chatSession.sendMessage(userMessage);
  const assistantText = result.response.text();

  // Lưu phản hồi của Gemini vào DB
  const assistantTurn = await AITurn.create({
    session_id: sessionId,
    role: 'assistant',
    content: assistantText,
  });

  // Cập nhật số turn của session
  await AISession.update(
    { turn_count: turns.length + 2 },
    { where: { id: sessionId } }
  );

  // Đặt tên tự động cho cuộc trò chuyện nếu là tin nhắn đầu tiên
  if (turns.length === 0) {
    const title = userMessage.length > 60 ? userMessage.substring(0, 57) + '...' : userMessage;
    await AISession.update({ title }, { where: { id: sessionId } });
  }

  return { message: assistantText, turn_id: assistantTurn.id };
};

// ── Lấy danh sách sessions ───────────────────────────────────────────────────
const getSessions = async (userId, page = 1, limit = 20) => {
  return AISession.findAndCountAll({
    where: { user_id: userId },
    order: [['updated_at', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    attributes: ['id', 'title', 'topic', 'turn_count', 'created_at', 'updated_at'],
  });
};

// ── Lấy lịch sử 1 session ────────────────────────────────────────────────────
const getSessionTurns = async (sessionId, userId) => {
  const session = await AISession.findOne({ where: { id: sessionId, user_id: userId } });
  if (!session) throw { status: 404, message: 'Session không tồn tại' };

  const turns = await AITurn.findAll({
    where: { session_id: sessionId },
    order: [['created_at', 'ASC']],
  });

  return { session, turns };
};

// ── Xóa session ──────────────────────────────────────────────────────────────
const deleteSession = async (sessionId, userId) => {
  const session = await AISession.findOne({ where: { id: sessionId, user_id: userId } });
  if (!session) throw { status: 404, message: 'Session không tồn tại' };
  await AITurn.destroy({ where: { session_id: sessionId } });
  await session.destroy();
};

module.exports = { createSession, chat, getSessions, getSessionTurns, deleteSession };