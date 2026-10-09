import { Request, Response } from 'express';
import { staffService } from '../../services/staff.service';
import { menuService } from '../../services/menu.service';
import { toPlainList } from '../../utils/serialize';

export class CategoryController {
    public async getCategories(_req: Request, res: Response) {
        try {
            const categories = await menuService.getAllCategories();
            const data = toPlainList(categories);
            return res.json({ success: true, total: data.length, data });
        } catch (err: any) {
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi tải danh mục', error: err.message });
        }
    }

    public async createCategory(req: Request, res: Response) {
        try {
            const { name, description, icon, image, displayOrder, slug } = req.body;
            if (!name) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Vui lòng nhập tên danh mục' });
            }
            const cat = await staffService.createCategory({
                name,
                description,
                icon,
                image,
                displayOrder,
                slug,
            });
            return res.status(201).json({
                success: true,
                message: `Đã tạo danh mục "${cat.name}"`,
                data: toPlainList([cat])[0],
            });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: 'Lỗi tạo danh mục' });
        }
    }

    public async updateCategory(req: Request, res: Response) {
        try {
            const cat = await staffService.updateCategory(req.params.id, req.body);
            if (!cat) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
            }
            return res.json({
                success: true,
                message: `Đã cập nhật danh mục "${req.body.name || cat.name}"`,
            });
        } catch (err: any) {
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi cập nhật danh mục', error: err.message });
        }
    }

    public async deleteCategory(req: Request, res: Response) {
        try {
            const cat = await staffService.deleteCategory(req.params.id);
            if (!cat) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
            }
            return res.json({ success: true, message: `Đã xóa danh mục "${cat.name}"` });
        } catch (err: any) {
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi xóa danh mục', error: err.message });
        }
    }
}

export const categoryController = new CategoryController();