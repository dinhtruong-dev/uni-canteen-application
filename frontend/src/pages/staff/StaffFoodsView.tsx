import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { staffService } from '../../services/api';

export const StaffFoodsView: React.FC = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    description: '',
    preparationTime: '10',
    calories: '500',
    image: '',
    isAvailable: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirm Modal
  const [deletingFood, setDeletingFood] = useState<any | null>(null);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const [foodsRes, catsRes] = await Promise.all([
        staffService.getFoods({
          canteenId: 'cant-a',
          categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
          isAvailable: availabilityFilter === 'ALL' ? undefined : availabilityFilter === 'AVAILABLE',
          search: search.trim() || undefined,
        }),
        staffService.getCategories(),
      ]);

      if (foodsRes.success) setFoods(foodsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [selectedCategory, availabilityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFoods();
  };

  // Toggle availability switch
  const handleToggleStock = async (food: any) => {
    try {
      const nextState = !food.isAvailable;
      const res = await staffService.toggleFoodStock(food.id, nextState);
      if (res.success) {
        setFoods((prev) =>
          prev.map((f) => (f.id === food.id ? { ...f, isAvailable: nextState } : f))
        );
      }
    } catch (err) {
      console.error('Toggle stock error:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      categoryId: categories[0]?.id || 'cat-1',
      description: '',
      preparationTime: '10',
      calories: '450',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      isAvailable: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food: any) => {
    setEditingFood(food);
    setFormData({
      name: food.name || '',
      price: String(food.price || ''),
      originalPrice: food.originalPrice ? String(food.originalPrice) : '',
      categoryId: food.categoryId || categories[0]?.id || 'cat-1',
      description: food.description || '',
      preparationTime: String(food.preparationTime || 10),
      calories: String(food.calories || 500),
      image: food.image || '',
      isAvailable: food.isAvailable !== false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        setUploadingImage(true);
        const res = await staffService.uploadImage(base64);
        if (res.success && res.data?.url) {
          setFormData((prev) => ({ ...prev, image: res.data!.url }));
        } else {
          // Fallback to base64 data url directly
          setFormData((prev) => ({ ...prev, image: base64 }));
        }
      } catch (err) {
        setFormData((prev) => ({ ...prev, image: base64 }));
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      setFormError('Vui lòng điền đủ Tên món, Giá bán và Danh mục');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        categoryId: formData.categoryId,
        description: formData.description.trim(),
        preparationTime: Number(formData.preparationTime) || 10,
        calories: Number(formData.calories) || 500,
        image: formData.image,
        isAvailable: formData.isAvailable,
        canteenId: 'cant-a',
      };

      if (editingFood) {
        const res = await staffService.updateFood(editingFood.id, payload);
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await staffService.createFood(payload);
        if (!res.success) throw new Error(res.message);
      }

      setIsModalOpen(false);
      fetchFoods();
    } catch (err: any) {
      setFormError(err?.message || 'Lỗi khi lưu món ăn');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteFood = async () => {
    if (!deletingFood) return;
    try {
      const res = await staffService.deleteFood(deletingFood.id);
      if (res.success) {
        setDeletingFood(null);
        fetchFoods();
      }
    } catch (err) {
      console.error('Delete food error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              THỰC ĐƠN CĂN TIN
            </span>
            <span className="text-xs text-slate-400">{foods.length} món ăn đang quản lý</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">Quản lý Món Ăn & Thực Đơn</h2>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm món ăn mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên món ăn..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          {/* Availability Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Trạng thái:</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="AVAILABLE">Còn món (Đang bán)</option>
              <option value="OUT_OF_STOCK">Đã hết món</option>
            </select>
          </div>
        </div>
      </div>

      {/* Foods Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Ảnh & Tên món</th>
                <th className="py-3.5 px-4">Đơn giá</th>
                <th className="py-3.5 px-4">Chuẩn bị / Calo</th>
                <th className="py-3.5 px-4 text-center">Báo còn / hết món</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải thực đơn món ăn...
                  </td>
                </tr>
              ) : foods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    Không tìm thấy món ăn nào phù hợp
                  </td>
                </tr>
              ) : (
                foods.map((food) => (
                  <tr key={food.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            food.image ||
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
                          }
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-100">{food.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {food.description || 'Món ăn căn tin sinh viên'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-sm text-emerald-400">
                        {food.price?.toLocaleString('vi-VN')}đ
                      </div>
                      {food.originalPrice && food.originalPrice > food.price && (
                        <div className="text-[11px] text-slate-500 line-through font-mono">
                          {food.originalPrice?.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {food.preparationTime || 10}p
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          {food.calories || 500} kcal
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStock(food)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          food.isAvailable
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                        title="Bấm để chuyển đổi Còn món / Báo hết món"
                      >
                        {food.isAvailable ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Còn món</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span>Đã hết món</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(food)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Sửa món"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingFood(food)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Xóa món"
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

      {/* Modal Thêm / Sửa món ăn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">
                {editingFood ? `Chỉnh sửa món: ${editingFood.name}` : 'Thêm món ăn mới vào thực đơn'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  {formError}
                </div>
              )}

              {/* Tên món */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên món ăn (*):</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Cơm Gà Sốt Nấm Đông Cô"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Danh mục & Trạng thái */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Danh mục món (*):</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trạng thái bán:</label>
                  <select
                    value={formData.isAvailable ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.value === 'true' })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="true">Còn món (Mở bán)</option>
                    <option value="false">Hết món (Khóa tạm thời)</option>
                  </select>
                </div>
              </div>

              {/* Giá bán & Giá gốc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giá bán (VNĐ) (*):</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="35000"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giá gốc (gạch ngang nếu giảm):
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="40000 (tùy chọn)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Thời gian nấu & Calories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Thời gian nấu (phút):</label>
                  <input
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lượng Calories (kcal):</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Ảnh món ăn (URL hoặc Upload) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hình ảnh món ăn:</label>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      formData.image ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
                    }
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Nhập đường link ảnh hoặc tải tệp..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{uploadingImage ? 'Đang tải lên Cloudinary...' : 'Tải ảnh từ máy'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mô tả món ăn:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Thành phần, hương vị đặc sắc, khuyến nghị dùng kèm..."
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
                  disabled={formLoading || uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  {formLoading ? 'Đang lưu...' : editingFood ? 'Cập nhật món' : 'Thêm vào thực đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFood && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>Xóa món ăn khỏi thực đơn?</span>
            </h3>
            <p className="text-xs text-slate-400">
              Bạn có chắc chắn muốn xóa món{' '}
              <span className="font-bold text-slate-200">"{deletingFood.name}"</span>? Món ăn này
              sẽ không còn hiển thị cho sinh viên đặt nữa.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFood(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteFood}
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
