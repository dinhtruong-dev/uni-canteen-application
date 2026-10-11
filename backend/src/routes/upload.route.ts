import express from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/avatar', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh' });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'uni-canteen/avatars');

        res.json({
            success: true,
            message: 'Upload thành công',
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error: any) {
        console.error('Lỗi upload Cloudinary:', error);
        res.status(500).json({ success: false, message: 'Upload thất bại', error: error.message });
    }
});

export default router;