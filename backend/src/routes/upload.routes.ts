import { Router, Request, Response } from 'express';
import { cloudinaryService } from '../services/cloudinary.service';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/image', authMiddleware, async (req: Request, res: Response) => {
  const { image, folder } = req.body;

  if (!image) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh (image)' });
  }

  try {
    const result = await cloudinaryService.uploadImage(image, folder || 'foods');
    res.json({
      success: true,
      message: 'Tải ảnh lên Cloudinary thành công',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi tải ảnh lên Cloudinary' });
  }
});

export default router;
