import { Request, Response } from 'express';
import { searchService } from '../../services/shared/search.service';

export class SearchController {
  public async search(req: Request, res: Response) {
    try {
      const q = (req.query.q || req.query.query || req.query.search || '') as string;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '3', 10);
      const sortBy = req.query.sortBy as string;
      const promoOnly = req.query.promoOnly === 'true';
      const under30k = req.query.under30k === 'true';
      const categoryId = req.query.categoryId as string;
      const type = req.query.type as string;

      const result = await searchService.executeSearch({
        q,
        page,
        limit,
        sortBy,
        promoOnly,
        under30k,
        categoryId,
        type,
      });

      return res.json(result);
    } catch (error: any) {
      console.error('[SearchController Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi trong quá trình tìm kiếm món ăn từ máy chủ',
        error: error.message,
      });
    }
  }

  public async getHistory(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || 'user-guest';
      const history = await searchService.getHistory(userId);
      return res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('[SearchController getHistory Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải lịch sử tìm kiếm từ máy chủ',
        error: error.message,
      });
    }
  }

  public async addHistory(req: Request, res: Response) {
    try {
      const query = (req.body?.query || req.query?.query || '') as string;
      const userId = (req.body?.userId || req.query?.userId || 'user-guest') as string;
      if (!query.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Từ khóa tìm kiếm không được để trống',
        });
      }
      const history = await searchService.addHistory(query, userId);
      return res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('[SearchController addHistory Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lưu lịch sử tìm kiếm',
        error: error.message,
      });
    }
  }

  public async removeHistory(req: Request, res: Response) {
    try {
      const query = (req.params.query || req.query.query || '') as string;
      const userId = (req.query.userId || 'user-guest') as string;
      const history = await searchService.removeHistory(query, userId);
      return res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('[SearchController removeHistory Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa từ khóa tìm kiếm',
        error: error.message,
      });
    }
  }

  public async clearHistory(req: Request, res: Response) {
    try {
      const userId = (req.query.userId || 'user-guest') as string;
      await searchService.clearHistory(userId);
      return res.json({
        success: true,
        message: 'Đã xóa toàn bộ lịch sử tìm kiếm',
        data: [],
      });
    } catch (error: any) {
      console.error('[SearchController clearHistory Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa toàn bộ lịch sử tìm kiếm',
        error: error.message,
      });
    }
  }
}

export const searchController = new SearchController();
