import { Request, Response } from 'express';
import { menuService } from '../../services/menu.service';
import { toPlain, toPlainList } from '../../utils/serialize';

export class FoodController {
    public async getFoods(req: Request, res: Response) {
        try {
            const { canteenId, categoryId, search, isAvailable } = req.query;
            const products = await menuService.getProducts({
                canteenId: canteenId as string,
                categoryId: categoryId as string,
                search: search as string,
            });

            let list = products;
            if (isAvailable !== undefined && isAvailable !== 'ALL') {
                const avail = isAvailable === 'true';
                list = list.filter((p) => p.isAvailable === avail);
            }

            return res.json({
                success: true,
                total: list.length,
                data: toPlainList(list),
            });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi tải danh sách món ăn',
                error: err.message,
            });
        }
    }

    public async createFood(req: Request, res: Response) {
        try {
            const {
                name,
                price,
                originalPrice,
                categoryId,
                canteenId = 'cant-a',
                image,
                description,
                preparationTime = 10,
                calories = 500,
                isAvailable = true,
            } = req.body;

            if (!name || price === undefined || !categoryId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đủ Tên món, Giá bán và Danh mục',
                });
            }

            const prod = await menuService.createProduct({
                name,
                price: Number(price),
                originalPrice: originalPrice ? Number(originalPrice) : undefined,
                categoryId,
                canteenId,
                image,
                description,
                preparationTime: Number(preparationTime) || 10,
                calories: Number(calories) || 500,
                isAvailable: isAvailable !== false,
            });

            return res.status(201).json({
                success: true,
                message: `Đã thêm món "${prod.name}" vào menu`,
                data: toPlain(prod),
            });
        } catch (err: any) {
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi thêm món ăn mới: ' + err.message });
        }
    }

    public async updateFood(req: Request, res: Response) {
        try {
            const prod = await menuService.updateProduct(req.params.id, req.body);
            if (!prod) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
            }
            return res.json({
                success: true,
                message: `Đã cập nhật món "${prod.name}"`,
                data: toPlain(prod),
            });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: 'Lỗi cập nhật món ăn' });
        }
    }

    public async deleteFood(req: Request, res: Response) {
        try {
            const ok = await menuService.deleteProduct(req.params.id);
            if (!ok) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
            }
            return res.json({ success: true, message: 'Đã xóa món ăn khỏi thực đơn' });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: 'Lỗi xóa món ăn' });
        }
    }
}

export const foodController = new FoodController();