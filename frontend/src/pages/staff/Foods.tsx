import React, { useState, useEffect, useRef } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  Flame,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Percent,
} from 'lucide-react';
import { staffFoodService, staffCategoryService } from '../../services/api/client';
import { useApp } from '../../store/AppContext';
import { FoodItem } from '../../types/shared/food.types';
import { Category } from '../../types/shared/categories.types';


export const StaffFoodsView: React.FC = () => {
  const { showToast } = useApp();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Form Fields
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

  // Image Upload State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirm Modal
  const [deletingFood, setDeletingFood] = useState<FoodItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const [foodsRes, catsRes] = await Promise.all([
        staffFoodService.getFoods({
          canteenId: 'cant-a',
          categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
          isAvailable: availabilityFilter === 'ALL' ? undefined : availabilityFilter === 'AVAILABLE',
          search: search.trim() || undefined,
        }),
        staffCategoryService.getCategories(),
      ]);

      if (foodsRes.success && Array.isArray(foodsRes.data)) {
        setFoods(foodsRes.data);
      }
      if (catsRes.success && Array.isArray(catsRes.data)) {
        setCategories(catsRes.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách món ăn:', err);
      showToast('Không thể tải danh sách món ăn. Vui lòng thử lại!', 'error');
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
  const handleToggleStock = async (food: FoodItem) => {
    try {
      const nextState = !food.isAvailable;
      const res = await staffFoodService.toggleFoodStock(food.id, nextState);
      if (res.success) {
        setFoods((prev) =>
          prev.map((f) => (f.id === food.id ? { ...f, isAvailable: nextState } : f))
        );
        showToast(
          `Đã chuyển trạng thái món "${food.name}": ${nextState ? 'Còn hàng' : 'Tạm hết món'}`,
          'success'
        );
      } else {
        showToast(res.message || 'Không thể cập nhật trạng thái món', 'error');
      }
    } catch (err) {
      console.error('Toggle stock error:', err);
      showToast('Lỗi khi đổi trạng thái món ăn', 'error');
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
      calories: '500',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      isAvailable: true,
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food: FoodItem) => {
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
    setSelectedImageFile(null);
    setImagePreviewUrl(food.image || null);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Xử lý chọn file ảnh từ máy và tạo preview tức thời
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Vui lòng chỉ chọn tệp hình ảnh (jpg, png, webp, jpeg)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Dung lượng ảnh không được vượt quá 5MB!');
      return;
    }

    setSelectedImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    setFormError(null);
  };

  // Xóa ảnh xem trước
  const handleRemoveImagePreview = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên món ăn');
      return;
    }
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Giá bán phải là số hợp lệ lớn hơn 0');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Vui lòng chọn danh mục cho món ăn');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      let finalImageUrl = formData.image;

      // 1. Upload ảnh lên Cloudinary nếu có chọn file mới
      if (selectedImageFile) {
        setUploadingImage(true);
        const uploadRes = await staffFoodService.uploadProductImage(
          selectedImageFile,
          editingFood ? editingFood.id : undefined
        );
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          throw new Error(uploadRes.message || 'Không thể upload ảnh lên Cloudinary');
        }
      }

      if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
      }

      const payload: Partial<FoodItem> = {
        name: formData.name.trim(),
        price: priceNum,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        categoryId: formData.categoryId,
        description: formData.description.trim(),
        preparationTime: Number(formData.preparationTime) || 10,
        calories: Number(formData.calories) || 500,
        image: finalImageUrl,
        isAvailable: formData.isAvailable,
        canteenId: 'cant-a',
      };

      if (editingFood) {
        const res = await staffFoodService.updateFood(editingFood.id, payload);
        if (!res.success) throw new Error(res.message);
        showToast(`Đã cập nhật món "${payload.name}" thành công!`, 'success');
      } else {
        const res = await staffFoodService.createFood(payload);
        if (!res.success) throw new Error(res.message);
        showToast(`Đã thêm món "${payload.name}" vào thực đơn!`, 'success');
      }

      setIsModalOpen(false);
      fetchFoods();
    } catch (err: any) {
      setFormError(err?.message || 'Lỗi khi lưu món ăn');
      showToast(err?.message || 'Lỗi khi lưu món ăn', 'error');
    } finally {
      setFormLoading(false);
      setUploadingImage(false);
    }
  };

  const handleDeleteFood = async () => {
    if (!deletingFood) return;
    try {
      setIsDeleting(true);
      const res = await staffFoodService.deleteFood(deletingFood.id);
      if (res.success) {
        showToast(`Đã xóa món "${deletingFood.name}" khỏi thực đơn`, 'success');
        setDeletingFood(null);
        fetchFoods();
      } else {
        showToast(res.message || 'Không thể xóa món ăn', 'error');
      }
    } catch (err: any) {
      console.error('Delete food error:', err);
      showToast(err?.message || 'Lỗi khi xóa món ăn', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Header & Bộ điều khiển */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              THỰC ĐƠN CĂN TIN
            </span>
            <span className="text-xs text-slate-400">{foods.length} món ăn đang quản lý</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 mt-1">Quản Lý Danh Sách Món Ăn</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Thêm mới, cập nhật giá bán, hình ảnh và bật tắt trạng thái còn hàng/hết hàng tức thời.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFoods}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Món Mới</span>
          </button>
        </div>
      </div>

      {/* 2. Bộ lọc & Tìm kiếm */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên món ăn hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Lọc Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Lọc Trạng thái kho */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Đang phục vụ</option>
            <option value="UNAVAILABLE">Tạm hết món</option>
          </select>
        </div>
      </div>

      {/* 3. Danh sách Món ăn */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Đang tải danh sách món ăn từ cơ sở dữ liệu...</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <UtensilsCrossed className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Không tìm thấy món ăn nào</h3>
          <p className="text-xs text-slate-500 mt-1">Hãy thử đổi từ khóa tìm kiếm hoặc bấm Thêm Món Mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => {
            const hasDiscount = food.originalPrice && food.originalPrice > food.price;
            return (
              <div
                key={food.id}
                className="group relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
              >
                {/* Phần ảnh món */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/80 backdrop-blur text-slate-200 border border-slate-700/60">
                      {food.categoryName || 'Món chính'}
                    </span>
                    {hasDiscount && (
                      <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-black bg-rose-500 text-white flex items-center gap-0.5 shadow">
                        <Percent className="w-2.5 h-2.5" />
                        Giảm giá
                      </span>
                    )}
                  </div>

                  {/* Nút bật/tắt Còn hàng */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleStock(food)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${food.isAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur hover:bg-rose-500/30'
                        }`}
                      title="Nhấn để đổi trạng thái Còn hàng / Tạm hết"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${food.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                          }`}
                      />
                      <span>{food.isAvailable ? 'Đang bán' : 'Hết món'}</span>
                    </button>
                  </div>

                  {/* Giá bán góc dưới ảnh */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <div className="text-base font-black text-orange-400 drop-shadow">
                        {formatVND(food.price)}
                      </div>
                      {hasDiscount && (
                        <div className="text-[11px] text-slate-400 line-through">
                          {formatVND(food.originalPrice!)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-300 bg-slate-900/70 backdrop-blur px-2 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{food.preparationTime || 10}p</span>
                    </div>
                  </div>
                </div>

                {/* Nội dung thông tin món */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">
                      {food.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {food.description || 'Chưa có mô tả chi tiết cho món ăn này.'}
                    </p>
                  </div>

                  {/* Footer Thao tác: Sửa, Xóa */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Đã bán: <strong className="text-slate-300">{food.soldCount || 0}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(food)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Chỉnh sửa món ăn"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingFood(food)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20 cursor-pointer"
                        title="Xóa món ăn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL THÊM / SỬA MÓN ĂN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-100">
                  {editingFood ? `Chỉnh Sửa: ${editingFood.name}` : 'Thêm Món Ăn Mới'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hình ảnh sẽ được upload tự động lên Cloudinary thư mục uni-canteen
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveFood} className="p-5 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tên món */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tên món ăn <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cơm Tấm Sườn Bì Chả Đặc Biệt"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Giá bán & Giá gốc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Giá bán thực tế (VND) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    placeholder="35000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Giá gốc niêm yết (nếu có giảm giá)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    placeholder="40000"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Danh mục món ăn <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload ảnh & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Hình ảnh món ăn</label>

                {imagePreviewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 h-44 mb-2">
                    <img
                      src={imagePreviewUrl}
                      alt="Xem trước ảnh món"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImagePreview}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow"
                      title="Gỡ ảnh này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-200">
                      Ảnh xem trước
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-950/50 mb-2"
                  >
                    <Upload className="w-6 h-6 text-orange-400 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-200">Bấm để tải ảnh lên từ máy tính</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP tối đa 5MB</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Hoặc nhập URL ảnh trực tiếp */}
                <input
                  type="text"
                  placeholder="Hoặc dán URL ảnh trực tiếp nếu không upload file..."
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreviewUrl(e.target.value || null);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Thời gian chuẩn bị & Calories */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Thời gian nấu (phút)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Năng lượng (Calories)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Mô tả món */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả món ăn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nguyên liệu, hương vị đặc sắc..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {/* Checkbox Còn hàng */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailableCheckbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
                <label htmlFor="isAvailableCheckbox" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Mở bán ngay (Còn hàng phục vụ khách)
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={formLoading || uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {(formLoading || uploadingImage) && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  )}
                  <span>
                    {uploadingImage
                      ? 'Đang upload ảnh Cloudinary...'
                      : formLoading
                        ? 'Đang lưu vào CSDL...'
                        : editingFood
                          ? 'Lưu Thay Đổi'
                          : 'Tạo Món Mới'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL XÁC NHẬN XÓA MÓN */}
      {deletingFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-100">Xóa Món Ăn Này?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa món <strong className="text-rose-400">"{deletingFood.name}"</strong>?
                Hành động này sẽ xóa vĩnh viễn khỏi menu căn tin.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFood(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteFood}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
