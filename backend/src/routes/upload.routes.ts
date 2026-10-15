import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import { cloudinaryService } from '../services/cloudinary.service';
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
router.post('/image', authMiddleware, async (req: Request, res: Response) => {
  const { image, folder } = req.body;

  if (!image) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh (image)' });
  }

  try {
    const result = await cloudinaryService.uploadImage(image, folder || 'uni-canteen/products');
    return res.json({
      success: true,
      message: 'Tải ảnh lên Cloudinary thành công',
      data: result,
      url: result?.url || result?.secureUrl,
    });
  } catch (err: any) {
    console.error('[Upload Base64 Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi tải ảnh lên Cloudinary',
    });
  }
});

// 2. Upload Avatar (File)
router.post('/avatar', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tệp hình ảnh để tải lên' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'uni-canteen/avatars');

    return res.json({
      success: true,
      message: 'Tải ảnh đại diện thành công',
      url: result.secure_url,
      publicId: result.public_id,
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (error: any) {
    console.error('[Upload Avatar Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Tải ảnh đại diện thất bại: ' + (error.message || 'Lỗi hệ thống'),
    });
  }
});

// 3. Upload ảnh Món ăn (File)
router.post('/product', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tệp ảnh món ăn' });
    }

    const productId = req.body.productId || req.query.productId || `prod-${Date.now()}`;
    const folder = `uni-canteen/products/${productId}`;

    const result = await uploadToCloudinary(req.file.buffer, folder);

    return res.json({
      success: true,
      message: 'Tải ảnh món ăn lên Cloudinary thành công',
      url: result.secure_url,
      publicId: result.public_id,
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (error: any) {
    console.error('[Upload Product Image Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Tải ảnh món ăn thất bại: ' + (error.message || 'Lỗi hệ thống'),
    });
  }
});

export default router;
