import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận tệp hình ảnh (jpg, png, webp, jpeg)!'));
    }
  },
});

// 1. Upload ảnh Base64
router.post('/image', authMiddleware, (req, res) => uploadController.uploadBase64(req, res));

// 2. Upload Avatar (File)
router.post('/avatar', authMiddleware, upload.single('image'), (req, res) => uploadController.uploadAvatar(req, res));

// 3. Upload ảnh Món ăn (File)
router.post('/product', authMiddleware, upload.single('image'), (req, res) => uploadController.uploadProduct(req, res));

// 4. Xóa ảnh
router.delete('/image', authMiddleware, (req, res) => uploadController.deleteImage(req, res));

export default router;
