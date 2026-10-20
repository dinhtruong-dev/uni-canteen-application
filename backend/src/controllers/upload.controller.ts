import { Request, Response } from 'express';
import { uploadService } from '../services/infrastructure/upload.service';
import { cloudinaryService } from '../services/infrastructure/cloudinary.service';

export class UploadController {
  // 1. Upload ảnh Base64
  public async uploadImage(req: Request, res: Response) {
    try {
      const { image, folder } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh (image)' });
      }

      const result = await cloudinaryService.uploadImage(image, folder || 'uni-canteen/products');
      return res.json({
        success: true,
        message: 'Tải ảnh lên Cloudinary thành công',
        data: result,
        url: result?.url || result?.secureUrl,
      });
    } catch (err: any) {
      console.error('[UploadController.uploadImage Error]:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi tải ảnh lên Cloudinary',
      });
    }
  }

  // 2. Upload Avatar (File)
  public async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn tệp hình ảnh để tải lên' });
      }

      const result = await uploadService.uploadBuffer(req.file.buffer, 'uni-canteen/avatars');
      return res.json({
        success: true,
        message: 'Tải ảnh đại diện thành công',
        url: result.secure_url,
        publicId: result.public_id,
        data: { url: result.secure_url, publicId: result.public_id },
      });
    } catch (err: any) {
      console.error('[UploadController.uploadAvatar Error]:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi tải ảnh đại diện lên Cloudinary',
      });
    }
  }

  // 3. Upload ảnh Món ăn (File)
  public async uploadProductImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn tệp ảnh món ăn' });
      }

      const result = await uploadService.uploadBuffer(req.file.buffer, 'uni-canteen/products');
      return res.json({
        success: true,
        message: 'Tải ảnh món ăn thành công',
        url: result.secure_url,
        publicId: result.public_id,
        data: { url: result.secure_url, publicId: result.public_id },
      });
    } catch (err: any) {
      console.error('[UploadController.uploadProductImage Error]:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi tải ảnh món ăn',
      });
    }
  }

  // 4. Xóa ảnh theo publicId
  public async deleteImage(req: Request, res: Response) {
    try {
      const { publicId } = req.body;
      if (!publicId) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp publicId của ảnh cần xóa' });
      }

      await uploadService.deleteImage(publicId);
      return res.json({ success: true, message: 'Đã xóa ảnh thành công' });
    } catch (err: any) {
      console.error('[UploadController.deleteImage Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi xóa ảnh khỏi Cloudinary' });
    }
  }

  // Aliases for route compatibility
  public uploadBase64 = this.uploadImage.bind(this);
  public uploadProduct = this.uploadProductImage.bind(this);
}

export const uploadController = new UploadController();
