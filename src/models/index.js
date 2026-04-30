const sequelize = require('../configs/db');

// 1. Import toàn bộ Models
const User = require('./User');
const Couple = require('./Couple');
const MoodForecast = require('./MoodForecast');
const MenstrualCycle = require('./MenstrualCycle');
const SpecialDate = require('./SpecialDate');
const LocketPhoto = require('./LocketPhoto');
const Message = require('./Message');
const DayRating = require('./DayRating');
const { AISession, AITurn } = require('./AIConversation');
const { Badge, UserBadge, Streak } = require('./Achievement');

// 2. Định nghĩa Associations (quan hệ giữa các bảng)
// MoodForecast -> User
MoodForecast.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});
User.hasMany(MoodForecast, {
  foreignKey: 'user_id',
  as: 'moodForecasts'
});

// Message -> Message (self-referencing for reply_to)
Message.belongsTo(Message, {
  foreignKey: 'reply_to_id',
  as: 'replyTo',
  allowNull: true
});
Message.hasMany(Message, {
  foreignKey: 'reply_to_id',
  as: 'replies'
});

Couple.belongsTo(User, {
  as: 'user1',
  foreignKey: 'user_1_id'
});
Couple.belongsTo(User, {
  as: 'user2',
  foreignKey: 'user_2_id'
});
// 2. Hàm chạy đồng bộ (Gen DB)
const syncDB = async () => {
  try {
    // Kiểm tra kết nối
    await sequelize.authenticate();
    console.log('✅ Đã kết nối thành công với PostgreSQL!');

    // Bắt đầu quá trình gen bảng
    // alter: true -> Tự động so sánh model hiện tại và DB, thiếu cột nào nó sẽ tự thêm (Rất tốt cho dev)
    // force: true -> Xóa sạch bảng cũ và tạo lại từ đầu (Chỉ dùng khi test, cẩn thận mất data!)
    await sequelize.sync({ alter: true });

    console.log('🚀 Đã tự động tạo/cập nhật toàn bộ bảng trong pgAdmin thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ Database:', error);
  }
};

module.exports = {
  sequelize,
  syncDB,
  User, Couple, MoodForecast, MenstrualCycle, SpecialDate,
  LocketPhoto, Message, DayRating, AISession, AITurn,
  Badge, UserBadge, Streak
};