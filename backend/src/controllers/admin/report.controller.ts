import { Request, Response } from 'express';
import { interactionService } from '../../services/shared/interaction.service';

export class AdminReportController {
  public async getReviews(req: Request, res: Response) {
    try {
      const { canteenId, rating } = req.query;
      const reviews = await interactionService.getAllReviewsForAdmin(canteenId as string, rating as string);
      return res.json({ success: true, total: reviews.length, data: reviews });
    } catch (err: any) {
      console.error('[AdminReportController getReviews Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải danh sách đánh giá', error: err.message });
    }
  }

  public async toggleReviewVisibility(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const ok = await interactionService.toggleReviewVisibility(id, status);
      return res.json({ success: ok, message: ok ? 'Đã cập nhật trạng thái hiển thị đánh giá' : 'Không tìm thấy đánh giá' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật hiển thị đánh giá' });
    }
  }

  public async replyReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { replyText } = req.body;
      if (!replyText || !replyText.trim()) {
        return res.status(400).json({ success: false, message: 'Nội dung phản hồi không được để trống' });
      }
      const ok = await interactionService.replyReview(id, replyText.trim());
      return res.json({ success: ok, message: ok ? 'Đã gửi phản hồi đánh giá thành công' : 'Không tìm thấy đánh giá' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi gửi phản hồi đánh giá' });
    }
  }
}

export const adminReportController = new AdminReportController();
