import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Category } from '../../types';

export const AdminCategoriesView: React.FC = () => {
  const { categories, foods, showToast } = useApp();

  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('🍛');

  const filteredCategories = localCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('Các món ăn chất lượng phục vụ sinh viên & giảng viên');
    setFormIcon('🍜');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormIcon(cat.icon || '🍱');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Vui lòng nhập tên danh mục!', 'error');
      return;
    }

    const slug =
      formSlug.trim() ||
      formName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

    if (editingCategory) {
      setLocalCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName.trim(),
                slug,
                description: formDescription.trim(),
                icon: formIcon.trim() || '🍱',
              }
            : c
        )
      );
      showToast(`Đã cập nhật danh mục "${formName}"!`, 'success');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        slug,
        description: formDescription.trim(),
        icon: formIcon.trim() || '🍱',
      };
      setLocalCategories((prev) => [...prev, newCat]);
      showToast(`Đã thêm danh mục mới "${formName}"!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cat: Category) => {
    const foodCount = foods.filter((f) => f.categoryId === cat.id).length;
    if (foodCount > 0) {
      if (
        !window.confirm(
          `Danh mục "${cat.name}" hiện đang có ${foodCount} món ăn liên kết. Bạn có chắc chắn muốn xóa không?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) return;
    }

    setLocalCategories((prev) => prev.filter((c) => c.id !== cat.id));
    showToast(`Đã xóa danh mục "${cat.name}"!`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-purple-400" />
              Quản Lý Danh Mục Món Ăn Toàn Hệ Thống
            </h2>
            <p className="text-xs text-slate-400">
              Phân nhóm món ăn (Cơm, Mì, Bún, Đồ uống, Ăn vặt, Ăn sáng, Chay...) áp dụng thống nhất cho tất cả các căng tin.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Danh Mục Mới</span>
          </button>
        </div>

        {/* Search */}
        <div className="pt-3 border-t border-slate-800 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên danh mục, mã slug..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const catFoods = foods.filter((f) => f.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 p-5 rounded-3xl transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                      {cat.icon || '🍱'}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-base">{cat.name}</h3>
                      <p className="text-[11px] font-mono text-purple-400">slug: {cat.slug}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
                    {catFoods.length} món
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-2">
                  {cat.description || 'Danh mục món ăn sinh viên chuẩn vị an toàn vệ sinh.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>

                <button
                  onClick={() => handleDelete(cat)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">
                {editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-center text-lg outline-hidden"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-slate-400 font-semibold mb-1">Tên danh mục *</label>
                  <input
                    type="text"
                    required
                    placeholder="Món Cơm / Món Nước / Đồ Uống"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Mã định danh (Slug)</label>
                <input
                  type="text"
                  placeholder="mon-com (tự tạo nếu để trống)"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-purple-300 font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Mô tả danh mục</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                {editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
