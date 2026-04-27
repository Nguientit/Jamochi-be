// src/index.js
// 📁 JAMOCHI/src/index.js
// 🛡️ FIX: Gắn `io` vào `app` để controllers emit real-time event

const express = require('express');
const cors    = require('cors');
const http    = require('http');
const { Server } = require('socket.io');
const jwt     = require('jsonwebtoken');
require('dotenv').config();

// ── Models & Routes ───────────────────────────────────────────────────────────
const { sequelize }        = require('./models/index');
const authRoutes           = require('./routes/authRoutes');
const moodRoutes           = require('./routes/moodRoutes');
const vaultRoutes          = require('./routes/vaultRoutes');
const messagesRoutes       = require('./routes/messagesRoutes');
const achievementRoutes    = require('./routes/achievementRoutes');
const aiRoutes             = require('./routes/aiRoutes');
const settingsRoutes       = require('./routes/settingsRoutes');

require('./configs/firebase');

const app    = express();
const server = http.createServer(app);

// ── Socket.IO Setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:      process.env.FRONTEND_URL || '*',
    methods:     ['GET', 'POST'],
    credentials: true,
  },
});

// 🎯 FIX QUAN TRỌNG: Gắn io vào app để controllers dùng được
// Trong controller: const io = req.app.get('io');
app.set('io', io);

// ── Socket.IO Auth Middleware ─────────────────────────────────────────────────
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Thiếu token'));

    const decoded  = jwt.verify(token, process.env.JWT_SECRET || 'jamochi_secret_2026');
    socket.userId  = decoded.userId || decoded.id;
    next();
  } catch {
    next(new Error('Token không hợp lệ'));
  }
});

// ── Online Users Map ──────────────────────────────────────────────────────────
const onlineUsers = new Map(); // userId → socketId

io.on('connection', (socket) => {
  console.log(`📱 User ${socket.userId} connected: ${socket.id}`);
  onlineUsers.set(socket.userId, socket.id);
  io.emit('user-online', { userId: socket.userId });

  // ── Chat ──────────────────────────────────────────────────────────────────
  socket.on('send-message', ({ couple_id, recipient_id, message_text, message_type = 'text' }) => {
    const recipientSocket = onlineUsers.get(recipient_id);
    if (recipientSocket) {
      io.to(recipientSocket).emit('receive-message', {
        sender_id: socket.userId, couple_id, message_text, message_type, timestamp: new Date(),
      });
    }
  });

  // ── Video Call ────────────────────────────────────────────────────────────
  socket.on('initiate-video-call', ({ recipient_id, couple_id, signal }) => {
    const recipientSocket = onlineUsers.get(recipient_id);
    if (recipientSocket) {
      io.to(recipientSocket).emit('incoming-video-call', {
        caller_id: socket.userId, couple_id, signal,
      });
    } else {
      socket.emit('user-not-available', { message: 'Người ấy chưa online 😴' });
    }
  });

  socket.on('accept-video-call', ({ caller_id, couple_id, signal }) => {
    const callerSocket = onlineUsers.get(caller_id);
    if (callerSocket) {
      io.to(callerSocket).emit('video-call-accepted', {
        accepter_id: socket.userId, couple_id, signal,
      });
    }
  });

  socket.on('end-video-call', ({ other_user_id, couple_id }) => {
    const otherSocket = onlineUsers.get(other_user_id);
    if (otherSocket) io.to(otherSocket).emit('video-call-ended', { couple_id });
  });

  // ── Locket Photo ──────────────────────────────────────────────────────────
  socket.on('share-locket-photo', ({ recipient_id, couple_id, photo_url, caption }) => {
    const recipientSocket = onlineUsers.get(recipient_id);
    if (recipientSocket) {
      io.to(recipientSocket).emit('locket-photo-received', {
        sender_id: socket.userId, couple_id, photo_url, caption, timestamp: new Date(),
      });
    }
  });

  // ── Typing ────────────────────────────────────────────────────────────────
  socket.on('user-typing', ({ recipient_id, couple_id }) => {
    const s = onlineUsers.get(recipient_id);
    if (s) io.to(s).emit('partner-typing', { couple_id, user_id: socket.userId });
  });

  socket.on('user-stopped-typing', ({ recipient_id, couple_id }) => {
    const s = onlineUsers.get(recipient_id);
    if (s) io.to(s).emit('partner-stopped-typing', { couple_id });
  });

  // ── Mood (backup manual emit nếu cần) ─────────────────────────────────────
  // Thường do REST API emit qua req.app.get('io') rồi,
  // nhưng giữ lại để client có thể emit trực tiếp khi cần
  socket.on('mood-updated', ({ couple_id, mood, theme_palette }) => {
    socket.broadcast.emit('partner-mood-changed', {
      couple_id, mood, theme_palette, timestamp: new Date(),
    });
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`❌ User ${socket.userId} disconnected`);
    onlineUsers.delete(socket.userId);
    io.emit('user-offline', { userId: socket.userId });
  });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🚀 Jamochi backend đang chạy!', timestamp: new Date() });
});

app.use('/api/auth',         authRoutes);
app.use('/api/mood',         moodRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/vault',        vaultRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/settings',     settingsRoutes);
app.use('/api/messages',     messagesRoutes);

// ── Error Handling ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server nội bộ',
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint không tồn tại: ${req.path}` });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║        🚀 JAMOCHI APP BACKEND 🚀       ║
  ║         Đang chạy tại port: ${PORT}       ║
  ╚════════════════════════════════════════╝
  `);
  try {
    await sequelize.authenticate();
    console.log('✅ Đã kết nối PostgreSQL!');
  } catch (error) {
    console.error('❌ Lỗi Database:', error.message);
  }
});

module.exports = { app, server, io };