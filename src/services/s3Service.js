// services/s3Service.js
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');
const path = require('path');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_BUCKET_NAME;

/**
 * Upload buffer lên S3
 * @param {Buffer} buffer - nội dung file
 * @param {string} originalName - tên file gốc (để lấy extension)
 * @param {string} folder - thư mục trong bucket (vd: 'avatars')
 * @returns {string} public URL của file
 */
const uploadToS3 = async (buffer, originalName, folder = 'avatars') => {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const key = `${folder}/${randomUUID()}${ext}`;

  const contentTypeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  const contentType = contentTypeMap[ext] || 'image/jpeg';

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Nếu bucket dùng ACL public-read thì bật dòng dưới,
    // nếu dùng bucket policy thì bỏ comment bên dưới:
    // ACL: 'public-read',
  }));

  // Trả về public URL
  const region = process.env.AWS_REGION || 'ap-southeast-1';
  return `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;
};

/**
 * Xóa file cũ trên S3 (non-critical, không throw nếu lỗi)
 * @param {string} url - full URL của file cũ
 */
const deleteFromS3 = async (url) => {
  try {
    if (!url || !url.includes(BUCKET)) return;
    const key = url.split('.amazonaws.com/')[1];
    if (!key) return;
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (e) {
    console.warn('[S3] Không thể xóa file cũ:', e.message);
  }
};

module.exports = { uploadToS3, deleteFromS3 };