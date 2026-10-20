import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Tag,
  CheckCircle2,
  CircleHelp,
} from 'lucide-react';
import { staffCategoryService } from '../../services/api/staff/category.service';
import { useApp } from '../../store/AppContext';
import { Category } from '../../types/shared/categories.types';

export const StaffCategoriesView: React.FC = () => {
  const { showToast } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🍲',
    displayOrder: 1,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await staffCategoryService.getCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      showToast('Không thể tải danh sách danh mục', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '🍲',
      displayOrder: categories.length + 1,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      icon: cat.icon || '🍲',
      displayOrder: cat.displayOrder || 1,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên danh mục');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        displayOrder: Number(formData.displayOrder) || 1,
      };

      if (editingCategory) {
        const res = await staffCategoryService.updateCategory(editingCategory.id, payload);
        if (!res.success) throw new Error(res.message);
        showToast(`Đã cập nhật danh mục "${payload.name}" thành công!`, 'success');
      } else {
        const res = await staffCategoryService.createCategory(payload);
        if (!res.success) throw new Error(res.message);
        showToast(`Đã tạo danh mục "${payload.name}" thành công!`, 'success');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err?.message || 'Lỗi khi lưu danh mục');
      showToast(err?.message || 'Lỗi khi lưu danh mục', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      const res = await staffCategoryService.deleteCategory(deletingCategory.id);
      if (res.success) {
        showToast(`Đã xóa danh mục "${deletingCategory.name}"`, 'success');
        setDeletingCategory(null);
        fetchCategories();
      } else {
        showToast(res.message || 'Không thể xóa danh mục', 'error');
      }
    } catch (err: any) {
      console.error('Delete category error:', err);
      showToast(err?.message || 'Lỗi khi xóa danh mục', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PHÂN LOẠI MÓN
            </span>
            <span className="text-xs text-slate-400">{categories.length} danh mục</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">Danh Mục Món Ăn</h2>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Biểu tượng</th>
                <th className="py-3.5 px-4">Tên danh mục</th>
                <th className="py-3.5 px-4">Mô tả</th>
                <th className="py-3.5 px-4 text-center">Thứ tự hiển thị</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh mục...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    Chưa có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xl">{cat.icon || '🍲'}</td>
                    <td className="py-3.5 px-4 font-bold text-sm text-slate-100">{cat.name}</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {cat.description || 'Không có mô tả'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-mono font-bold">
                        #{cat.sortOrder || 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Sửa danh mục"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Danh mục */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">
                {editingCategory ? `Chỉnh sửa: ${editingCategory.name}` : 'Thêm danh mục mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên danh mục (*):</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Món Ăn Trưa Sinh Viên"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Biểu tượng (Emoji):</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🍲 hoặc 🥤 hoặc 🥗"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-center text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Thứ tự hiển thị:</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mô tả ngắn:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả nhóm món cho sinh viên dễ tìm..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  {formLoading ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>Xóa danh mục này?</span>
            </h3>
            <p className="text-xs text-slate-400">
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <span className="font-bold text-slate-200">"{deletingCategory.name}"</span>?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
