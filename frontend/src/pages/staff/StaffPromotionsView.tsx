import React, { useState, useEffect } from 'react';
import {
  TicketPercent,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  DollarSign,
  Percent,
  Sparkles,
} from 'lucide-react';
import { staffService } from '../../services/api';

export const StaffPromotionsView: React.FC = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 30000,
    maxDiscount: 15000,
    usageLimit: 100,
    endDate: '2026-12-31',
    status: 'ACTIVE',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await staffService.getPromotions();
      if (res.success) {
        setPromotions(res.data);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPromotion(null);
    setFormData({
      code: 'UNIEAT10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 30000,
      maxDiscount: 15000,
      usageLimit: 100,
      endDate: '2026-12-31',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: any) => {
    setEditingPromotion(promo);
    setFormData({
      code: promo.code || '',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: promo.discountValue || 10,
      minOrderAmount: promo.minOrderAmount || 30000,
      maxDiscount: promo.maxDiscount || 15000,
      usageLimit: promo.usageLimit || 100,
      endDate: promo.endDate ? promo.endDate.split('T')[0] : '2026-12-31',
      status: promo.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscount: Number(formData.maxDiscount),
        usageLimit: Number(formData.usageLimit),
        endDate: formData.endDate,
        status: formData.status,
      };

      if (editingPromotion) {
        await staffService.updatePromotion(editingPromotion.id, payload);
      } else {
        await staffService.createPromotion(payload);
      }

      setIsModalOpen(false);
      fetchPromotions();
    } catch (err) {
      console.error('Error saving promotion:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã ưu đãi này?')) return;
    try {
      await staffService.deletePromotion(id);
      fetchPromotions();
    } catch (err) {
      console.error('Delete promotion error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              CHƯƠNG TRÌNH KHUYẾN MÃI
            </span>
            <span className="text-xs text-slate-400">{promotions.length} mã giảm giá</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">
            Quản lý Mã Giảm Giá & Ưu Đãi Sinh Viên
          </h2>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mã ưu đãi mới</span>
        </button>
      </div>

      {/* Promotions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã Voucher</th>
                <th className="py-3.5 px-4">Mức giảm</th>
                <th className="py-3.5 px-4">Đơn tối thiểu</th>
                <th className="py-3.5 px-4">Lượt dùng / Giới hạn</th>
                <th className="py-3.5 px-4">Hạn sử dụng</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải mã khuyến mãi...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    Chưa có mã khuyến mãi nào
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-sm text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {promo.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {promo.discountType === 'PERCENTAGE'
                        ? `Giảm ${promo.discountValue}% (Tối đa ${promo.maxDiscount?.toLocaleString('vi-VN')}đ)`
                        : `Giảm ${promo.discountValue?.toLocaleString('vi-VN')}đ`}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      Từ {promo.minOrderAmount?.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {promo.usedCount || 0} / {promo.usageLimit || 100}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          promo.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {promo.status === 'ACTIVE' ? 'Đang áp dụng' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(promo)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
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

      {/* Modal Thêm / Sửa Voucher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">
                {editingPromotion ? `Sửa mã: ${editingPromotion.code}` : 'Tạo mã giảm giá mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromotion} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mã Code (*):</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ví dụ: KTX10K hoặc COMTRUA20"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Loại giảm giá:</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PERCENTAGE">Theo phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mức giảm (*):</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Đơn tối thiểu (đ):</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giảm tối đa (đ):</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lượt dùng tối đa:</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ngày kết thúc:</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  {formLoading ? 'Đang lưu...' : editingPromotion ? 'Cập nhật' : 'Tạo mã'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
