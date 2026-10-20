import React, { useState, useEffect } from 'react';
import {
  TicketPercent,
  Plus,
  Search,
  Power,
  Edit3,
  Trash2,
  X,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Promotion } from '../../types';
import { apiClient } from '../../services/api/client/apiClient';

export const AdminPromotionsView: React.FC = () => {
  const { promotions, showToast, refreshData } = useApp();

  const [localPromotions, setLocalPromotions] = useState<Promotion[]>(promotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PERCENT' | 'FIXED'>('ALL');

  useEffect(() => {
    setLocalPromotions(promotions);
  }, [promotions]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(20);
  const [formMinOrderValue, setFormMinOrderValue] = useState<number>(50000);
  const [formMaxDiscount, setFormMaxDiscount] = useState<number | ''>(20000);
  const [formStartDate, setFormStartDate] = useState('2026-09-01');
  const [formEndDate, setFormEndDate] = useState('2026-12-31');
  const [formUsageLimit, setFormUsageLimit] = useState<number>(500);

  const filteredPromos = localPromotions.filter((p) => {
    const matchSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'ALL' || p.discountType === typeFilter;
    return matchSearch && matchType;
  });

  const handleToggle = async (id: string) => {
    const target = localPromotions.find((p) => p.id === id);
    if (!target) return;
    try {
      await apiClient.put(`/staff/promotions/${id}`, {
        isActive: !target.isAvailable,
      });
      showToast(`Đã thay đổi trạng thái kích hoạt mã ${target.code}!`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi thay đổi trạng thái mã', 'error');
    }
  };

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormCode('UNIEAT20');
    setFormTitle('Giảm 20% Đơn Cơm Trưa Sinh Viên');
    setFormDescription('Áp dụng cho tất cả sinh viên đặt món qua ứng dụng Uni Canteen');
    setFormDiscountType('PERCENT');
    setFormDiscountValue(20);
    setFormMinOrderValue(40000);
    setFormMaxDiscount(25000);
    setFormStartDate('2026-09-01');
    setFormEndDate('2026-12-31');
    setFormUsageLimit(1000);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Promotion) => {
    setEditingPromo(p);
    setFormCode(p.code);
    setFormTitle(p.title);
    setFormDescription(p.description);
    setFormDiscountType(p.discountType === 'FIXED' ? 'FIXED' : 'PERCENT');
    setFormDiscountValue(p.discountValue);
    setFormMinOrderValue(p.minOrderValue);
    setFormMaxDiscount(p.maxDiscount || '');
    setFormStartDate(p.startDate);
    setFormEndDate(p.endDate);
    setFormUsageLimit(p.usageLimit);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formTitle.trim()) {
      showToast('Vui lòng nhập mã code và tiêu đề!', 'error');
      return;
    }

    try {
      if (editingPromo) {
        await apiClient.put(`/staff/promotions/${editingPromo.id}`, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          discountValue: Number(formDiscountValue),
          minOrderAmount: Number(formMinOrderValue),
          maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : null,
          usageLimit: Number(formUsageLimit),
        });
        showToast(`Đã cập nhật mã "${formCode.toUpperCase()}" vào CSDL!`, 'success');
      } else {
        await apiClient.post('/staff/promotions', {
          code: formCode.trim().toUpperCase(),
          title: formTitle.trim(),
          description: formDescription.trim(),
          discountType: formDiscountType === 'PERCENT' ? 'PERCENTAGE' : 'FIXED',
          discountValue: Number(formDiscountValue),
          minOrderAmount: Number(formMinOrderValue),
          maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : null,
          usageLimit: Number(formUsageLimit),
        });
        showToast(`Đã phát hành mã khuyến mãi mới "${formCode.toUpperCase()}" vào CSDL!`, 'success');
      }
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu mã khuyến mãi', 'error');
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã khuyến mãi này khỏi CSDL?')) return;
    try {
      await apiClient.delete(`/staff/promotions/${id}`);
      showToast('Đã xóa mã khuyến mãi khỏi CSDL!', 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa mã khuyến mãi', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <TicketPercent className="w-6 h-6 text-orange-400" />
              Quản Lý Khuyến Mãi & Voucher Toàn Trường
            </h2>
            <p className="text-xs text-slate-400">
              Thiết lập mã giảm giá, hỗ trợ tân sinh viên, miễn phí vận chuyển KTX và giám sát số lượng sử dụng.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Voucher Mới</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã code, tiêu đề..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-orange-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả loại giảm giá</option>
            <option value="PERCENT">Giảm theo phần trăm (%)</option>
            <option value="FIXED">Giảm số tiền cố định (VNĐ)</option>
          </select>
        </div>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromos.map((promo) => {
          const usagePercent = Math.min(100, Math.round((promo.usedCount / promo.usageLimit) * 100));

          return (
            <div
              key={promo.id}
              className={`bg-slate-900/90 border rounded-3xl p-6 transition-all shadow-md flex flex-col justify-between ${promo.isAvailable
                ? 'border-slate-800 hover:border-orange-500/40'
                : 'border-rose-900/40 opacity-75'
                }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 font-mono font-black text-orange-400 text-sm tracking-wider inline-block">
                      {promo.code}
                    </span>
                    <h3 className="font-extrabold text-slate-100 text-sm mt-2">{promo.title}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${promo.isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                  >
                    {promo.isAvailable ? 'ĐANG CHẠY' : 'TẠM KHÓA'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {promo.description}
                </p>

                {/* Voucher Specs */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Mức giảm
                    </span>
                    <span className="font-bold text-amber-400 font-mono mt-0.5 block">
                      {promo.discountType === 'PERCENT'
                        ? `Giảm ${promo.discountValue}%`
                        : `Giảm ${promo.discountValue.toLocaleString('vi-VN')}đ`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Đơn tối thiểu
                    </span>
                    <span className="font-bold text-slate-200 font-mono mt-0.5 block">
                      {promo.minOrderValue.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Usage progress */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Đã dùng:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {promo.usedCount} / {promo.usageLimit} lượt
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggle(promo.id)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${promo.isAvailable
                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{promo.isAvailable ? 'Tạm Dừng Mã' : 'Kích Hoạt Lại'}</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(promo)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Sửa voucher"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(promo.id)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                  title="Xóa voucher"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Promotion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">
                {editingPromo ? 'Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
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
                <label className="block text-slate-400 font-semibold mb-1">Mã Code Voucher *</label>
                <input
                  type="text"
                  required
                  placeholder="CHAOTAN2026"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-orange-400 font-mono font-bold text-sm uppercase outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tiêu đề chương trình *</label>
                <input
                  type="text"
                  required
                  placeholder="Giảm 20% cho tân sinh viên"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hình thức giảm</label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Giá trị ({formDiscountType === 'PERCENT' ? '%' : 'VNĐ'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    step={1000}
                    value={formMinOrderValue}
                    onChange={(e) => setFormMinOrderValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    step={1000}
                    placeholder="Không giới hạn"
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Giới hạn số lượt dùng</label>
                <input
                  type="number"
                  min={1}
                  value={formUsageLimit}
                  onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Mô tả chi tiết</label>
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
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                {editingPromo ? 'Lưu Thay Đổi' : 'Tạo Voucher'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
