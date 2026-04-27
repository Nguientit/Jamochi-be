const { Sequelize } = require('sequelize');
require('dotenv').config();

// Khởi tạo kết nối
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    timezone: '+07:00',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// BẮT BUỘC PHẢI EXPORT TRỰC TIẾP INSTANCE NÀY (Không có dấu ngoặc nhọn {})
module.exports = sequelize;