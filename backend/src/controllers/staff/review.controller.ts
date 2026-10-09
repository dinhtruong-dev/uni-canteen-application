import { Request, Response } from 'express';
import { staffService } from '../../services/staff.service';

export class ReviewController {
    public async getReviews(req: Request, res: Response) {
        try {
            const { rating, canteenId } = req.query;
            const reviews = await staffService.getReviews(
                canteenId as string,
                rating as string
            );
            return res.json({ success: true, total: reviews.length, data: reviews });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi tải đánh giá',
                error: err.message,
            });
        }
    }

    public async replyReview(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { replyText } = req.body;

            if (!replyText || !replyText.trim()) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Nội dung phản hồi không được để trống' });
            }

            const ok = await staffService.replyReview(id, replyText.trim());
            if (!ok) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Không tìm thấy đánh giá' });
            }

            return res.json({
                success: true,
                message: 'Đã gửi phản hồi đánh giá thành công',
                data: { id, reply: replyText.trim(), replyText: replyText.trim() },
            });
        } catch (err: any) {
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi gửi phản hồi đánh giá' });
        }
    }
}

export const reviewController = new ReviewController();