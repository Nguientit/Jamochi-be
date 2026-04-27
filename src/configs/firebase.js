const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Khởi tạo Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();

console.log('🔥 Đã khởi tạo Firebase Admin thành công!');

module.exports = { admin, messaging };