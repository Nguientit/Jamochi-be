# 🎯 JAMOCHI Backend - Project Setup & Development Guide

## 📋 Project Structure

```
jamochi/
├── init-db.js                 # Script khởi tạo database
├── package.json               # Dependencies
├── .env                        # Environment variables
├── src/
│   ├── index.js               # Main server file (Express + Socket.IO)
│   ├── configs/
│   │   ├── db.js              # Sequelize connection
│   │   └── firebase.js        # Firebase configuration
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── couple.js          # Couple access verification
│   ├── models/                # Sequelize models
│   │   ├── User.js
│   │   ├── Couple.js
│   │   ├── MoodForecast.js
│   │   ├── DayRating.js
│   │   ├── MenstrualCycle.js
│   │   ├── SpecialDate.js
│   │   ├── LocketPhoto.js
│   │   ├── Message.js
│   │   ├── AIConversation.js
│   │   ├── Achievement.js
│   │   └── index.js           # Model exports & sync
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── moodController.js
│   │   ├── vaultController.js
│   │   ├── messagesController.js
│   │   ├── achievementController.js
│   │   ├── aiController.js
│   │   └── settingsController.js
│   ├── services/              # Business logic
│   │   ├── authService.js
│   │   ├── moodService.js
│   │   ├── vaultService.js
│   │   ├── messageService.js
│   │   ├── achievementService.js
│   │   ├── aiService.js
│   │   ├── userService.js
│   │   └── notificationService.js
│   ├── routes/                # Route definitions
│   │   ├── authRoutes.js
│   │   ├── moodRoutes.js
│   │   ├── vaultRoutes.js
│   │   ├── messagesRoutes.js
│   │   ├── achievementRoutes.js
│   │   ├── aiRoutes.js
│   │   └── settingsRoutes.js
│   └── utils/
│       └── response.js        # Standardized response helper
│
└── API_DOCUMENTATION.md       # Detailed API docs
```

---

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Install dependencies
npm install

# Create .env file
touch .env
```

### 2. Configure .env

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL Database (AWS RDS)
DB_HOST=your_rds_endpoint.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=couple_app_db

# JWT
JWT_SECRET=jamochi_secret_2026_super_long_key
JWT_EXPIRY=7d

# Firebase Admin SDK
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=jamochi-app-xxx
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@jamochi-app-xxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxx
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs

# AWS S3 (for photo uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=jamochi-photos
AWS_REGION=ap-southeast-1

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5000
```

### 3. Initialize Database

```bash
node init-db.js
```

Expected output:
```
✅ Đã kết nối thành công với PostgreSQL!
🚀 Đã tự động tạo/cập nhật toàn bộ bảng trong pgAdmin thành công!
Hoàn tất script!
```

### 4. Start Development Server

```bash
npm run dev
```

Expected output:
```
╔════════════════════════════════════════╗
║        🚀 JAMOCHI APP BACKEND 🚀      ║
║         Đang chạy tại port: 5000       ║
╚════════════════════════════════════════╝
✅ Đã kết nối thành công với PostgreSQL!
```

### 5. Test Server

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "🚀 Backend Jamochi đang chạy mượt mà!",
  "timestamp": "2026-04-26T..."
}
```

---

## 🔑 Key Features Overview

### Tab 1: 🌤️ Dự báo (Mood Forecast)
- Cô ấy chấm điểm tâm trạng hôm nay (1-5 sao)
- Mô tả nhu cầu/tâm trạng chi tiết
- Ứng dụng tự động đổi giao diện màu sắc pastel theo tâm trạng
- Real-time thông báo khi partner cập nhật mood

### Tab 2: 🤖 Bro AI (Chatbot)
- AI chatbot để trả lời câu hỏi như "cô ấy nói 'tùy anh' sao ta trả lời?"
- Xoa dịu bạn gái với lời khuyên thông minh
- Lưu lịch sử cuộc trò chuyện

### Tab 3: 💾 Vault
**Thông tin cá nhân:**
- Chiều cao, cân nặng, số đo (bust, waist, hip)
- Nhóm máu, kích thước giày, dị ứng
- Avatar & tên gọi riêng

**Ngày đặc biệt:**
- Ngày kỷ niệm
- Sinh nhật
- 20/10, 8/3
- Ngày đếm ngược tới sự kiện tiếp theo

**Kỳ kinh nguyệt:**
- Ghi chép ngày bắt đầu/kết thúc
- Độ dữ dội
- Ghi chú

### Tab 4: 🏆 Thành tích
- Đánh giá ngày hôm nay (1-5 sao)
- Streaks (chuỗi liên tiếp đánh giá)
- Badges & Achievements
- Biểu đồ tâm trạng lịch sử

### Tab 5: ⚙️ Cài đặt
- Hồ sơ cá nhân
- Thay đổi mật khẩu
- Chọn màu sắc giao diện (pastel palettes)
- Cài đặt thông báo

---

## 💬 Real-time Features (Socket.IO)

### Chat Messages
- Real-time tin nhắn text
- Typing indicator
- Message read status
- Support cho image/video/audio attachments

### Video Call
- WebRTC peer-to-peer video call
- Connection management
- Call notifications

### Locket Photos
- Share instant photos (like Locket app)
- Real-time photo delivery
- Caption support

### Mood Theme Sync
- Khi bạn gái update mood → app thay đổi giao diện
- Partner nhìn thấy ngay sự thay đổi tâm trạng

---

## 🏗️ Architecture & Flow

```
Android App (Swift)
       ↓
    HTTP (REST API)
    Socket.IO (Real-time)
       ↓
    ┌──────────────────┐
    │  Express Server  │
    │  (Port 5000)     │
    └──────────────────┘
       ↓        ↓        ↓
    ┌──────┬────────┬────────┐
    ↓      ↓        ↓        ↓
  Routes Middleware Models Services
    ↓      ↓        ↓        ↓
    └──────┴────────┴────────┘
          ↓
    PostgreSQL (AWS RDS)
    Firebase Admin SDK
    AWS S3
```

---

## 🔐 Authentication Flow

1. **Register**
   - User gửi email, password, display_name
   - Backend hash password & tạo User record
   - Return JWT token

2. **Login**
   - User gửi email, password
   - Backend verify password & return JWT token

3. **Couple Connection**
   - User 1 generate invite code
   - User 2 accept invite code
   - Backend tạo Couple record linking 2 users

4. **Protected Routes**
   - Tất cả API routes (trừ auth) yêu cầu `Authorization: Bearer <JWT_TOKEN>`
   - Middleware `authenticateToken` verify token
   - Middleware `verifyCoupleAccess` verify user có trong couple đó không

---

## 📝 Database Schema Relationships

```
┌─────────────────────────────────────────────┐
│                   User                      │
├─────────────────────────────────────────────┤
│ id (PK), email, password_hash               │
│ display_name, nickname, avatar_url          │
│ height_cm, weight_kg, bust_cm, waist_cm...  │
│ date_of_birth, gender, blood_type, ...      │
│ fcm_token, is_active, last_seen_at          │
└─────────────────────────────────────────────┘
        ↑          ↑
        │ user1_id │ user2_id
        │          │
┌───────┴──────────┴────────┐
│        Couple              │
├────────────────────────────┤
│ id (PK)                    │
│ user1_id, user2_id (FK)    │
│ connected_at               │
└────────────────────────────┘
        ↓
    Có nhiều:
    ├─ MoodForecast (tâm trạng hàng ngày)
    ├─ DayRating (đánh giá ngày)
    ├─ Message (tin nhắn chat)
    ├─ LocketPhoto (ảnh chia sẻ)
    ├─ SpecialDate (ngày kỷ niệm)
    ├─ MenstrualCycle (kỳ kinh)
    └─ AISession (cuộc trò chuyện AI)
```

---

## 🛠️ Common Development Tasks

### Add a New Route

1. **Create Controller** → `src/controllers/newController.js`
2. **Create Service** → `src/services/newService.js`
3. **Create Routes** → `src/routes/newRoutes.js`
4. **Import in index.js** → `app.use('/api/new', newRoutes)`

### Add a New Model

1. Create file → `src/models/NewModel.js`
2. Import in `src/models/index.js`
3. Run `node init-db.js` to sync database

### Database Changes

```bash
# Make changes to model files
# Then run:
node init-db.js
# The `alter: true` option will update tables automatically
```

---

## 🐛 Troubleshooting

### Database Connection Error

```
❌ Lỗi khi đồng bộ Database: ConnectionError [SequelizeConnectionError]: 
database "couple_app_db" does not exist
```

**Solution:**
```bash
# Create database first (using pgAdmin or psql)
psql -h your_host -U postgres -c "CREATE DATABASE couple_app_db;"

# Then run:
node init-db.js
```

### JWT Token Invalid

```
❌ Token không hợp lệ hoặc đã hết hạn
```

**Solution:**
- Make sure JWT_SECRET in .env matches the one in code
- Check if token is expired (JWT_EXPIRY)

### Socket.IO Connection Failed

```
❌ Error: Token không hợp lệ
```

**Solution:**
```javascript
// Client side - Make sure to send valid JWT token
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_valid_jwt_token_here'
  }
});
```

### CORS Error

```
Access-Control-Allow-Origin header missing
```

**Solution:**
- Update FRONTEND_URL in .env
- Or allow all origins (not recommended for production)

---

## 📊 Monitoring & Debugging

### Enable Verbose Logging

```env
DEBUG=*
LOG_LEVEL=debug
```

### Database Query Logging

In `src/configs/db.js`, change:
```javascript
logging: false  // Change to: logging: console.log
```

### Socket.IO Debugging

```javascript
// In index.js
io.on('connection', (socket) => {
  console.log('📱 Connection:', socket.id, socket.userId);
  // ... all events will be logged
});
```

---

## 🚀 Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Setup AWS RDS PostgreSQL
- [ ] Setup AWS S3 bucket
- [ ] Configure Firebase Admin SDK
- [ ] Setup SSL/HTTPS certificate
- [ ] Update FRONTEND_URL for CORS
- [ ] Enable rate limiting
- [ ] Setup monitoring/logging
- [ ] Backup database strategy
- [ ] Implement error tracking (Sentry, etc.)
- [ ] Performance optimization

---

## 📚 Useful Resources

- Sequelize Docs: https://sequelize.org/
- Express Docs: https://expressjs.com/
- Socket.IO Docs: https://socket.io/docs/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

---

## 💡 Best Practices

1. ✅ Always hash passwords before storing
2. ✅ Validate input data in controllers
3. ✅ Use middleware for common logic
4. ✅ Keep services focused on business logic
5. ✅ Use transactions for critical operations
6. ✅ Implement proper error handling
7. ✅ Log important events
8. ✅ Use environment variables for sensitive data
9. ✅ Test all API endpoints before deployment
10. ✅ Monitor database performance

---

**Happy Coding! 💕 Chúc bạn xây dựng ứng dụng tuyệt vời cho bạn gái!**
