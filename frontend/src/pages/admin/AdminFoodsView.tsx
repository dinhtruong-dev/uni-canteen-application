import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Power,
  X,
  Star,
  Leaf,
  Clock,
  Store,
  FolderTree,
  Upload,
  CheckCircle2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { FoodItem } from '../../types';

export const AdminFoodsView: React.FC = () => {
  const {
    foods,
    canteens,
    categories,
    addFood,
    updateFood,
    deleteFood,
    toggleFoodAvailability,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [canteenFilter, setCanteenFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCanteenId, setFormCanteenId] = useState(canteens[0]?.id || 'cant-a');
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [formPrice, setFormPrice] = useState<number>(35000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | ''>(40000);
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formPrepTime, setFormPrepTime] = useState<number>(10);
  const [formIsVegetarian, setFormIsVegetarian] = useState(false);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  // Preset image picker
  const imagePresets = [
    { label: 'Cơm Gà Xối Mỡ', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600' },
    { label: 'Cơm Tấm Sườn Bì Chả', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600' },
    { label: 'Phở Bò Tái Nạm', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=600' },
    { label: 'Mì Quảng / Hủ Tiếu', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600' },
    { label: 'Bánh Mì Kẹp Thịt', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
    { label: 'Trà Sữa Trân Châu', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600' },
    { label: 'Salad Rau Củ Chay', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600' },
  ];

  const filteredFoods = foods.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.canteenName && f.canteenName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCanteen = canteenFilter === 'ALL' || f.canteenId === canteenFilter;
    const matchCategory = categoryFilter === 'ALL' || f.categoryId === categoryFilter;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'AVAILABLE' && f.isAvailable) ||
      (statusFilter === 'UNAVAILABLE' && !f.isAvailable);

    return matchSearch && matchCanteen && matchCategory && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingFood(null);
    setFormName('');
    setFormCanteenId(canteens[0]?.id || 'cant-a');
    setFormCategoryId(categories[0]?.id || 'cat-1');
    setFormPrice(35000);
    setFormOriginalPrice(40000);
    setFormImage(imagePresets[0].url);
    setFormDescription('Được chế biến tươi nóng trong ngày tại căn tin, đảm bảo vệ sinh ATTP.');
    setFormIngredients('Nguyên liệu tươi sạch, gia vị vừa ăn');
    setFormPrepTime(10);
    setFormIsVegetarian(false);
    setFormIsBestSeller(false);
    setFormIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (food: FoodItem) => {
    setEditingFood(food);
    setFormName(food.name);
    setFormCanteenId(food.canteenId);
    setFormCategoryId(food.categoryId);
    setFormPrice(food.price);
    setFormOriginalPrice(food.originalPrice || '');
    setFormImage(food.image);
    setFormDescription(food.description || '');
    setFormIngredients(Array.isArray(food.ingredients) ? food.ingredients.join(', ') : food.ingredients || '');
    setFormPrepTime(food.preparationTime || 10);
    setFormIsVegetarian(!!food.isVegetarian);
    setFormIsBestSeller(!!food.isBestSeller);
    setFormIsAvailable(food.isAvailable);
    setIsModalOpen(true);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Vui lòng nhập tên món ăn!', 'error');
      return;
    }
    if (formPrice <= 0) {
      showToast('Giá món ăn phải lớn hơn 0đ!', 'error');
      return;
    }

    const matchedCanteen = canteens.find((c) => c.id === formCanteenId);
    const matchedCategory = categories.find((cat) => cat.id === formCategoryId);

    const ingredientsArray = formIngredients
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const foodData = {
      name: formName.trim(),
      canteenId: formCanteenId,
      canteenName: matchedCanteen ? matchedCanteen.name : 'Căn tin Campus',
      categoryId: formCategoryId,
      categoryName: matchedCategory ? matchedCategory.name : 'Đồ Ăn',
      price: Number(formPrice),
      originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
      image: formImage.trim() || imagePresets[0].url,
      description: formDescription.trim(),
      ingredients: ingredientsArray,
      preparationTime: Number(formPrepTime) || 10,
      isVegetarian: formIsVegetarian,
      isBestSeller: formIsBestSeller,
      isAvailable: formIsAvailable,
    };

    if (editingFood) {
      updateFood(editingFood.id, foodData);
      showToast(`Đã cập nhật món ăn "${formName}"!`, 'success');
    } else {
      addFood(foodData);
      showToast(`Đã thêm món ăn mới "${formName}" vào toàn hệ thống!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (food: FoodItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA món "${food.name}" khỏi thực đơn toàn trường?`)) {
      deleteFood(food.id);
      showToast(`Đã xóa món "${food.name}"!`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-amber-400" />
              Quản Lý Món Ăn & Thực Đơn Toàn Hệ Thống
            </h2>
            <p className="text-xs text-slate-400">
              Kiểm soát danh mục món của tất cả các quầy căn tin, giá niêm yết, tình trạng mở bán hoặc tạm hết hàng.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm Món Mới</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên món, mô tả..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={canteenFilter}
            onChange={(e) => setCanteenFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả Căn tin ({canteens.length})</option>
            {canteens.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả Danh Mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả Trạng Thái</option>
            <option value="AVAILABLE">Đang phục vụ (Còn hàng)</option>
            <option value="UNAVAILABLE">Tạm hết hàng</option>
          </select>
        </div>
      </div>

      {/* Foods Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Ảnh & Tên món</th>
                <th className="py-3.5 px-4">Căn tin</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Giá bán</th>
                <th className="py-3.5 px-4">Đặc điểm</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy món ăn nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredFoods.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={f.image}
                          alt={f.name}
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-700"
                        />
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-100 truncate max-w-[200px]">
                            {f.name}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[250px]">
                            {f.description || 'Không có mô tả'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{f.canteenName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        {f.categoryName || 'Món ăn'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-black text-amber-400 text-sm">
                        {f.price.toLocaleString('vi-VN')}đ
                      </span>
                      {f.originalPrice && f.originalPrice > f.price && (
                        <span className="text-[10px] text-slate-500 line-through block">
                          {f.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        {f.isBestSeller && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            BEST SELLER
                          </span>
                        )}
                        {f.isVegetarian && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            CHAY
                          </span>
                        )}
                        {!f.isBestSeller && !f.isVegetarian && (
                          <span className="text-slate-500 text-[11px]">--</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                          f.isAvailable
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {f.isAvailable ? 'Còn hàng' : 'Tạm hết'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleFoodAvailability(f.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            f.isAvailable
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                          title={f.isAvailable ? 'Đánh dấu tạm hết' : 'Đánh dấu còn hàng'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Sửa món ăn"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(f)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                          title="Xóa món ăn"
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

      {/* Modal: Add or Edit Food */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveFood}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">
                {editingFood ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Toàn Hệ Thống'}
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
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  required
                  placeholder="Cơm Sườn Nướng Mật Ong"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Căn tin phụ trách *</label>
                  <select
                    value={formCanteenId}
                    onChange={(e) => setFormCanteenId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    {canteens.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Danh mục món *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Giá gốc (gạch ngang)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 font-mono outline-hidden"
                  />
                </div>
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">URL Hình ảnh món ăn</label>
                <input
                  type="text"
                  required
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-hidden text-[11px]"
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 py-0.5">
                    Chọn nhanh:
                  </span>
                  {imagePresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImage(p.url)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700 cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Mô tả món ăn</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Thời gian chuẩn bị (phút)</label>
                  <input
                    type="number"
                    min={1}
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>

                <div className="flex flex-col justify-end gap-2 pb-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBestSeller}
                      onChange={(e) => setFormIsBestSeller(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span>Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsVegetarian}
                      onChange={(e) => setFormIsVegetarian(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-0"
                    />
                    <span>Món Chay</span>
                  </label>
                </div>
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
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-md"
              >
                {editingFood ? 'Lưu Thay Đổi' : 'Tạo Món Ăn'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
