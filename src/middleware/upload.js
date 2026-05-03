// middleware/upload.js
// Parse multipart/form-data, giữ file trong memory (không ghi disk)

const multer = require('multer');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

const upload = multer({
  storage: multer.memoryStorage(), // giữ trong RAM, không ghi file tạm
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF (tối đa ${MAX_SIZE_MB}MB)`));
    }
  },
});

module.exports = upload;