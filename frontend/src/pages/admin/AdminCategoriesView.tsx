import React, { useState, useEffect } from 'react';
import {
  FolderTree, Plus, Search, Edit3, Trash2, X, CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Category } from '../../types';
import { apiClient } from '../../services/api/apiClient';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminCategoriesView: React.FC = () => {
  const { categories, foods, showToast, refreshData } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('🍛');

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const removeVietnameseTones = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || isSaving) return;

    const slug =
      formSlug.trim() ||
      removeVietnameseTones(formName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    setIsSaving(true);
    try {
      if (editingCategory) {
        await apiClient.put(`/staff/categories/${editingCategory.id}`, {
          name: formName.trim(),
          slug,
          description: formDescription.trim(),
          icon: formIcon.trim() || '🍱',
        });
        showToast(`Đã cập nhật danh mục "${formName}"!`, 'success');
      } else {
        await apiClient.post('/staff/categories', {
          name: formName.trim(),
          slug,
          description: formDescription.trim(),
          icon: formIcon.trim() || '🍱',
        });
        showToast(`Đã thêm danh mục "${formName}"!`, 'success');
      }
      await refreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu danh mục', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDelete = (cat: Category) => {
    setDeleteTarget(cat);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/staff/categories/${deleteTarget.id}`);
      showToast(`Đã xóa danh mục "${deleteTarget.name}"!`, 'info');
      await refreshData();
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa danh mục', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteTargetFoodCount = deleteTarget
    ? foods.filter((f) => f.categoryId === deleteTarget.id).length
    : 0;

  return (
    <div className="space-y-6">
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16">
          <FolderTree className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">
            {searchTerm
              ? `Không tìm thấy danh mục nào khớp "${searchTerm}"`
              : 'Chưa có danh mục nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const catFoods = foods.filter((f) => f.categoryId === cat.id);
            return (
              <div key={cat.id} className="...">
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button onClick={() => handleOpenEdit(cat)} className="...">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleRequestDelete(cat)}
                    className="..."
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xóa danh mục?"
        message={
          deleteTarget
            ? deleteTargetFoodCount > 0
              ? `Danh mục "${deleteTarget.name}" hiện đang có ${deleteTargetFoodCount} món ăn liên kết.\nBạn có chắc chắn muốn xóa không?`
              : `Bạn có chắc chắn muốn xóa danh mục "${deleteTarget.name}"?`
            : ''
        }
        confirmText="Xóa danh mục"
        cancelText="Hủy"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  );
};