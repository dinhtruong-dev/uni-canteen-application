import dotenv from 'dotenv';
dotenv.config();

const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Thiếu biến môi trường Cloudinary: ${missing.join(', ')}`);
}

export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
  defaultFolder: process.env.CLOUDINARY_DEFAULT_FOLDER || 'uni-canteen',
  allowedFormats: (process.env.CLOUDINARY_ALLOWED_FORMATS || 'jpg,jpeg,png,webp').split(','),
  maxFileSize: process.env.CLOUDINARY_MAX_FILE_SIZE
    ? parseInt(process.env.CLOUDINARY_MAX_FILE_SIZE, 10)
    : 5 * 1024 * 1024,
  image: {
    quality: 80,
    width: 800,
  },
  video: {
    quality: 70,
    width: 640,
  },
  storageType: process.env.CLOUDINARY_STORAGE_TYPE || 'upload',
};