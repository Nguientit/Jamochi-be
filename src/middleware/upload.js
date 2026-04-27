const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Cấu hình kết nối đến AWS S3
const s3Config = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const uploadLocket = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // Không dùng acl: 'public-read' ở đây nếu Bucket của bạn đã cấu hình Policy Public
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Đổi tên file để không bao giờ bị trùng
      cb(null, 'lockets/' + uniqueSuffix + '-' + file.originalname); 
    }
  })
});

module.exports = { uploadLocket };