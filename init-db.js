// init-db.js
// Script khởi tạo/đồng bộ database

require('dotenv').config();
const { Sequelize } = require('sequelize');
const { syncDB } = require('./src/models/index');

console.log('🚀 Bắt đầu khởi tạo Database...\n');

// Tạo database nếu chưa tồn tại
const createDatabase = async () => {
  try {
    // Kết nối tới database mặc định (postgres) với SSL
    const tempSeq = new Sequelize(
      'postgres',
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      }
    );

    await tempSeq.authenticate();
    console.log('✅ Kết nối tới PostgreSQL thành công!');
    
    // Tạo database nếu chưa tồn tại
    await tempSeq.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
    console.log(`✅ Database "${process.env.DB_NAME}" vừa được tạo.`);
    
    await tempSeq.close();
  } catch (error) {
    // Database đã tồn tại - bỏ qua lỗi
    if (error.message.includes('already exists')) {
      console.log(`✅ Database "${process.env.DB_NAME}" đã tồn tại.`);
    } else if (error.message.includes('already exists in the database')) {
      console.log(`✅ Database "${process.env.DB_NAME}" đã tồn tại.`);
    } else {
      console.error('⚠️  Cảnh báo:', error.message);
    }
  }
};

// Chạy quá trình khởi tạo
(async () => {
  try {
    await createDatabase();
    console.log('\n📦 Đang đồng bộ các bảng...');
    await syncDB();
    console.log('\n✅ Hoàn tất! Database đã được đồng bộ thành công.');
    console.log('💡 Tip: Server sẵn sàng để chạy!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi khởi tạo Database:', err.message);
    process.exit(1);
  }
})();
