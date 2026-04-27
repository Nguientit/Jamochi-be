# 📱 JAMOCHI APP - Backend API Documentation

Jamochi là một ứng dụng dành cho cặp đôi với các tính năng:
- 💬 Chat real-time + Video call
- 📸 Locket photos (chia sẻ ảnh nhanh)
- 🌤️ Dự báo tâm trạng theo ngày (Mood Forecast)
- 💾 Vault: Lưu thông tin số đo, ngày kỷ niệm, kỳ kinh nguyệt
- 🤖 Bro AI: Chatbot AI để xoa dịu bạn gái
- 🏆 Thành tích: Badges, Streaks, Day Ratings
- ⚙️ Cài đặt: Giao diện pastel, thông báo, hồ sơ

---

## 🔐 Authentication (Xác thực)

### 1. Register (Đăng ký)
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "Tên hiển thị",
  "date_of_birth": "2000-01-01",
  "gender": "female" // male | female | other
}

Response:
{
  "success": true,
  "message": "Đăng ký thành công 🎉",
  "data": {
    "user": { ...user info },
    "token": "jwt_token_here"
  }
}
```

### 2. Login (Đăng nhập)
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Đăng nhập thành công 💕",
  "data": {
    "user": { ...user info },
    "token": "jwt_token_here"
  }
}
```

### 3. Generate Invite Code (Tạo mã mời)
```
POST /api/auth/generate-invite
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "message": "Mã mời đã được tạo 🔗",
  "data": {
    "invite_code": "COUPLE123456",
    "expires_at": "2026-05-26"
  }
}
```

### 4. Accept Invite (Chấp nhận mã mời)
```
POST /api/auth/accept-invite
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "invite_code": "COUPLE123456"
}

Response:
{
  "success": true,
  "message": "Kết nối thành công 💑",
  "data": {
    "couple": {
      "id": "couple_uuid",
      "user1_id": "user1_uuid",
      "user2_id": "user2_uuid",
      "connected_at": "2026-04-26"
    }
  }
}
```

---

## 📍 ALL Routes đều cần: 
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🌤️ Tab 1: Dự báo (Mood Forecast)

### 1. Chấm điểm tâm trạng hôm nay
```
POST /api/mood/forecast
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "couple_id": "couple_uuid",
  "mood": "happy", // happy | sad | angry | tired | romantic | stressed | excited
  "mood_score": 8,  // 1-10
  "mood_emojis": ["😊", "😴"],
  "needs": "cuddle",  // cuddle | alone | talk | care | support
  "needs_note": "Muốn được ôm"
}

Response:
{
  "success": true,
  "message": "Dự báo hôm nay đã được lưu 🌤️",
  "data": { ...forecast info }
}
```

### 2. Lấy dự báo hôm nay
```
GET /api/mood/forecast/today?couple_id=<couple_uuid>
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": { ...today's forecast }
}
```

### 3. Lấy lịch sử dự báo
```
GET /api/mood/forecast/history?days=30
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": [ ...30 days of forecasts ]
}
```

### 4. Lấy bảng màu theme theo tâm trạng
```
GET /api/mood/theme-palettes
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "message": "Bảng màu theo mood",
  "data": {
    "happy": {
      "primary": "#FFD93D",
      "secondary": "#6BCB77",
      "text": "#2D4059"
    },
    "sad": {
      "primary": "#A8D8FF",
      "secondary": "#7FB3D5",
      "text": "#1C3A47"
    }
    ...
  }
}
```

---

## 💬 Tab 2: Bro AI (AI Chatbot)

### 1. Bắt đầu cuộc trò chuyện
```
POST /api/ai/start-conversation
Authorization: Bearer <JWT_TOKEN>

{
  "couple_id": "couple_uuid",
  "initial_topic": "cô ấy nói 'tùy anh' sao ta trả lời?"
}

Response:
{
  "success": true,
  "data": {
    "conversation_id": "conv_uuid",
    "ai_response": "Hôm nay em có vẻ để lơ lõng nhỉ... 💭 Có chuyện gì khiến em lo lắng không? Hãy kể cho anh nghe, anh sẽ cố gắng xoa dịu..."
  }
}
```

### 2. Gửi tin nhắn đến AI
```
POST /api/ai/send-message
Authorization: Bearer <JWT_TOKEN>

{
  "conversation_id": "conv_uuid",
  "user_message": "Em không biết phải làm sao"
}

Response:
{
  "success": true,
  "message": "Bro AI đã trả lời 🤖",
  "data": {
    "ai_response": "Đó là vì em yêu anh mà... 💕 Em cứ lo lắng về những điều nhỏ nhặt...",
    "turn_id": "turn_uuid"
  }
}
```

### 3. Lấy lịch sử cuộc trò chuyện
```
GET /api/ai/conversation/<conversation_id>
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "conversation_id": "conv_uuid",
    "turns": [
      { "role": "user", "message": "..." },
      { "role": "ai", "message": "..." }
    ]
  }
}
```

### 4. Xóa cuộc trò chuyện
```
DELETE /api/ai/conversation/<conversation_id>
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true }
```

---

## 💾 Tab 3: Vault (Thông tin cá nhân)

### 1. Cập nhật số đo
```
PUT /api/vault/measurements
Authorization: Bearer <JWT_TOKEN>

{
  "height_cm": 160.5,
  "weight_kg": 50.0,
  "bust_cm": 85.0,
  "waist_cm": 65.0,
  "hip_cm": 90.0,
  "blood_type": "O+",
  "shoe_size": 36.5,
  "allergies": "Các ghi chú về dị ứng"
}

Response: { "success": true, "data": {...} }
```

### 2. Lấy thông tin số đo
```
GET /api/vault/measurements
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true, "data": {...} }
```

### 3. Tạo ngày đặc biệt
```
POST /api/vault/special-dates
Authorization: Bearer <JWT_TOKEN>

{
  "couple_id": "couple_uuid",
  "title": "Ngày kỷ niệm",
  "date": "2026-05-15",
  "category": "anniversary", // anniversary | birthday | 20-10 | 8-3 | custom
  "color_theme": "pink"
}

Response: { "success": true, "data": {...} }
```

### 4. Lấy danh sách ngày đặc biệt
```
GET /api/vault/special-dates?couple_id=<couple_uuid>
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true, "data": [...] }
```

### 5. Cập nhật ngày đặc biệt
```
PUT /api/vault/special-dates/<dateId>?couple_id=<couple_uuid>
Authorization: Bearer <JWT_TOKEN>

{ "title": "...", "date": "...", "category": "...", "color_theme": "..." }

Response: { "success": true, "data": {...} }
```

### 6. Xóa ngày đặc biệt
```
DELETE /api/vault/special-dates/<dateId>?couple_id=<couple_uuid>
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true }
```

### 7. Ghi chép kỳ kinh nguyệt
```
POST /api/vault/menstrual-cycle
Authorization: Bearer <JWT_TOKEN>

{
  "couple_id": "couple_uuid",
  "start_date": "2026-04-25",
  "end_date": "2026-05-02",
  "flow_intensity": "heavy", // light | normal | heavy
  "notes": "Ghi chú"
}

Response: { "success": true, "data": {...} }
```

### 8. Lấy thông tin kỳ kinh nguyệt
```
GET /api/vault/menstrual-cycle
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true, "data": {...} }
```

---

## 🏆 Tab 4: Thành tích (Achievements)

### 1. Đánh giá ngày hôm nay
```
POST /api/achievements/day-rating
Authorization: Bearer <JWT_TOKEN>

{
  "couple_id": "couple_uuid",
  "stars": 5,          // 1-5 sao
  "mood_score": 9,     // 1-10
  "partner_score": 8,  // 1-10 (anh ấy được mấy điểm)
  "notes": "Hôm nay tuyệt vời!"
}

Response: { "success": true, "data": {...} }
```

### 2. Lấy đánh giá hôm nay
```
GET /api/achievements/day-rating/today?couple_id=<couple_uuid>
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true, "data": {...} }
```

### 3. Lấy lịch sử đánh giá
```
GET /api/achievements/day-rating/history?days=30
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true, "data": [...] }
```

### 4. Lấy Streaks (Chuỗi liên tiếp)
```
GET /api/achievements/streaks
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "current_streak": 15,
    "longest_streak": 45,
    "last_rated_date": "2026-04-26"
  }
}
```

### 5. Lấy tất cả Badges
```
GET /api/achievements/badges
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": [
    { "id": "badge_uuid", "name": "First Kiss", "description": "...", "icon": "..." }
  ]
}
```

### 6. Lấy Badges của user
```
GET /api/achievements/badges/user
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": [ ...earned badges ]
}
```

---

## 💬 Messages & Chat

### 1. Gửi tin nhắn
```
POST /api/messages/send
Authorization: Bearer <JWT_TOKEN>

{
  "couple_id": "couple_uuid",
  "message_text": "Anh yêu em! 💕",
  "message_type": "text" // text | image | video | audio
}

Response: { "success": true, "data": {...} }
```

### 2. Lấy lịch sử chat
```
GET /api/messages/history?couple_id=<couple_uuid>&limit=50&offset=0
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true, "data": [...] }
```

### 3. Đánh dấu tin nhắn là đã đọc
```
PUT /api/messages/mark-as-read
Authorization: Bearer <JWT_TOKEN>

{
  "couple_id": "couple_uuid"
}

Response: { "success": true }
```

### 4. Upload Locket Photo
```
POST /api/messages/locket/upload
Authorization: Bearer <JWT_TOKEN>

{
  "couple_id": "couple_uuid",
  "photo_url": "https://...",
  "caption": "Ôi mà xinh quá em 😍"
}

Response: { "success": true, "data": {...} }
```

### 5. Lấy Locket Photos
```
GET /api/messages/locket?couple_id=<couple_uuid>&limit=20
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true, "data": [...] }
```

### 6. Xóa Locket Photo
```
DELETE /api/messages/locket/<photoId>
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true }
```

---

## ⚙️ Tab 5: Cài đặt (Settings)

### 1. Lấy hồ sơ
```
GET /api/settings/profile
Authorization: Bearer <JWT_TOKEN>

Response: { "success": true, "data": {...user info} }
```

### 2. Cập nhật hồ sơ
```
PUT /api/settings/profile
Authorization: Bearer <JWT_TOKEN>

{
  "display_name": "Tên mới",
  "nickname": "Em yêu",
  "avatar_url": "https://...",
  "date_of_birth": "2000-01-01",
  "gender": "female"
}

Response: { "success": true, "data": {...} }
```

### 3. Đổi mật khẩu
```
PUT /api/settings/password
Authorization: Bearer <JWT_TOKEN>

{
  "old_password": "password123",
  "new_password": "newpassword123"
}

Response: { "success": true, "message": "Cập nhật mật khẩu thành công 🔐" }
```

### 4. Cập nhật giao diện
```
PUT /api/settings/theme
Authorization: Bearer <JWT_TOKEN>

{
  "theme_color": "pink",   // Dựa vào mood palette
  "dark_mode": false
}

Response: { "success": true, "data": {...} }
```

### 5. Lấy cài đặt thông báo
```
GET /api/settings/notifications
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "push_enabled": true,
    "email_enabled": true,
    "sms_enabled": false
  }
}
```

### 6. Cập nhật cài đặt thông báo
```
PUT /api/settings/notifications
Authorization: Bearer <JWT_TOKEN>

{
  "push_enabled": true,
  "email_enabled": true,
  "sms_enabled": false
}

Response: { "success": true, "data": {...} }
```

---

## 🔌 Socket.IO Events (Real-time)

### Connection
```javascript
// Client side
const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt_token_here'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
});

socket.on('user-online', (data) => {
  console.log(`User ${data.userId} đã online`);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});
```

### Chat Messages (Real-time)
```javascript
// Gửi tin nhắn
socket.emit('send-message', {
  couple_id: 'couple_uuid',
  recipient_id: 'partner_uuid',
  message_text: 'Anh yêu em! 💕',
  message_type: 'text'
});

// Nhận tin nhắn
socket.on('receive-message', (data) => {
  console.log(`Tin nhắn từ ${data.sender_id}: ${data.message_text}`);
});
```

### Video Call
```javascript
// Bắt đầu video call
socket.emit('initiate-video-call', {
  couple_id: 'couple_uuid',
  recipient_id: 'partner_uuid',
  signal: webRtcOffer // WebRTC offer
});

// Nhận lệnh gọi
socket.on('incoming-video-call', (data) => {
  console.log(`Cuộc gọi từ ${data.caller_id}`);
  // Hiển thị popup "Chấp nhận" hoặc "Từ chối"
});

// Chấp nhận cuộc gọi
socket.emit('accept-video-call', {
  caller_id: 'caller_uuid',
  couple_id: 'couple_uuid',
  signal: webRtcAnswer
});

socket.on('video-call-accepted', (data) => {
  console.log('Cuộc gọi đã được chấp nhận');
  // Bắt đầu kết nối peer-to-peer
});

// Kết thúc cuộc gọi
socket.emit('end-video-call', {
  couple_id: 'couple_uuid',
  other_user_id: 'partner_uuid'
});

socket.on('video-call-ended', (data) => {
  console.log('Cuộc gọi đã kết thúc');
});
```

### Locket Photos (Real-time)
```javascript
// Chia sẻ ảnh
socket.emit('share-locket-photo', {
  couple_id: 'couple_uuid',
  recipient_id: 'partner_uuid',
  photo_url: 'https://...',
  caption: 'Xinh quá! 😍'
});

// Nhận ảnh
socket.on('locket-photo-received', (data) => {
  console.log(`Ảnh từ ${data.sender_id}: ${data.photo_url}`);
  // Hiển thị ảnh trên UI
});
```

### Typing Indicator
```javascript
// Đang gõ
socket.emit('user-typing', {
  couple_id: 'couple_uuid',
  recipient_id: 'partner_uuid'
});

socket.on('partner-typing', (data) => {
  console.log('Bạn gái đang gõ...');
});

// Dừng gõ
socket.emit('user-stopped-typing', {
  couple_id: 'couple_uuid',
  recipient_id: 'partner_uuid'
});

socket.on('partner-stopped-typing', (data) => {
  console.log('Bạn gái dừng gõ');
});
```

### Mood Theme Change
```javascript
// Cập nhật tâm trạng → Giao diện thay đổi
socket.emit('mood-updated', {
  couple_id: 'couple_uuid',
  mood: 'sad',
  theme_palette: {
    primary: '#A8D8FF',
    secondary: '#7FB3D5',
    text: '#1C3A47'
  }
});

socket.on('partner-mood-changed', (data) => {
  console.log(`Em đang ${data.mood}`);
  // Đổi giao diện ứng dụng theo theme_palette
  updateTheme(data.theme_palette);
});
```

---

## 📝 Environment Variables (.env)

```
PORT=5000
NODE_ENV=development

# Database
DB_HOST=your_aws_rds_endpoint
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=couple_app_db

# JWT
JWT_SECRET=jamochi_secret_2026
JWT_EXPIRY=7d

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Frontend
FRONTEND_URL=http://localhost:5000

# AWS S3 (để upload ảnh)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=...
```

---

## 🚀 Khởi động ứng dụng

```bash
# Install dependencies
npm install

# Khởi tạo database
node init-db.js

# Khởi động server
npm run dev
```

---

## 📦 Models Overview

- **User**: Thông tin cá nhân, số đo, FCM token
- **Couple**: Kết nối cặp đôi
- **MoodForecast**: Dự báo tâm trạng theo ngày
- **MenstrualCycle**: Ghi chép kỳ kinh nguyệt
- **SpecialDate**: Ngày kỷ niệm, sinh nhật, v.v.
- **LocketPhoto**: Chia sẻ ảnh nhanh
- **Message**: Tin nhắn chat
- **DayRating**: Đánh giá ngày hôm nay
- **AISession & AITurn**: Cuộc trò chuyện với Bro AI
- **Badge, UserBadge, Streak**: Hệ thống thành tích

---

## 💡 Tips

1. **Luôn gửi JWT token** trong header `Authorization: Bearer <token>`
2. **Đối với Socket.IO**, luôn gửi token trong `auth` khi kết nối
3. **Video Call sử dụng WebRTC** - cần phải setup peer-to-peer ở client
4. **Giao diện thay đổi theo tâm trạng** - lắng nghe `partner-mood-changed` event
5. **Thông báo push** - sử dụng FCM token lưu trong User model

---

**Chúc bạn xây dựng ứng dụng tuyệt vời! 💕**
