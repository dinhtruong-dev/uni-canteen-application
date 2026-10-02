import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
  Flame,
  PackageCheck,
} from 'lucide-react';
import { staffService } from '../../services/api';

export const StaffPickupSlotsView: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    timeRange: '',
    maxOrders: 20,
    status: 'ACTIVE',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await staffService.getPickupSlots('cant-a');
      if (res.success) {
        setSlots(res.data);
      }
    } catch (err) {
      console.error('Error fetching pickup slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSlot(null);
    setFormData({
      timeRange: '11:45 - 12:00',
      maxOrders: 20,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot: any) => {
    setEditingSlot(slot);
    setFormData({
      timeRange: slot.timeRange || '',
      maxOrders: slot.maxOrders || 20,
      status: slot.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        timeRange: formData.timeRange.trim(),
        maxOrders: Number(formData.maxOrders) || 20,
        status: formData.status,
        canteenId: 'cant-a',
      };

      if (editingSlot) {
        await staffService.updatePickupSlot(editingSlot.id, payload);
      } else {
        await staffService.createPickupSlot(payload);
      }

      setIsModalOpen(false);
      fetchSlots();
    } catch (err) {
      console.error('Error saving slot:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (slot: any) => {
    const nextStatus = slot.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await staffService.updatePickupSlot(slot.id, { status: nextStatus });
      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      console.error('Toggle slot error:', err);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) return;
    try {
      await staffService.deletePickupSlot(id);
      fetchSlots();
    } catch (err) {
      console.error('Delete slot error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ĐIỀU TIẾT GIỜ CAO ĐIỂM
            </span>
            <span className="text-xs text-slate-400">{slots.length} khung giờ hẹn lấy món</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">
            Quản lý Khung Giờ Nhận Món (Pickup)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Giới hạn số đơn theo từng khoảng 15 phút để bếp không bị quá tải khi sinh viên tan học
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khung giờ mới</span>
        </button>
      </div>

      {/* Slots List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Đang tải danh sách khung giờ...
          </div>
        ) : slots.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            Chưa thiết lập khung giờ nào
          </div>
        ) : (
          slots.map((slot) => {
            const current = slot.currentOrders || 0;
            const max = slot.maxOrders || 20;
            const percentage = Math.min(100, Math.round((current / max) * 100));
            const isFull = slot.status === 'FULL' || current >= max;
            const isDisabled = slot.status === 'DISABLED';

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-3xl bg-slate-900 border transition-all flex flex-col justify-between ${
                  isDisabled
                    ? 'border-slate-800 opacity-60'
                    : isFull
                    ? 'border-rose-500/40 shadow-rose-950/20'
                    : 'border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono font-black text-base text-slate-100">
                        {slot.timeRange}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(slot)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isDisabled
                          ? 'bg-slate-800 text-slate-400'
                          : isFull
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isDisabled ? 'Tạm khóa' : isFull ? 'Đã kín chỗ' : 'Đang mở'}
                    </button>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Đơn đã đặt:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {current} / {max} đơn
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentage >= 100
                            ? 'bg-rose-500'
                            : percentage >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Công suất bếp: <span className="font-bold text-slate-300">{percentage}%</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(slot)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Sửa khung giờ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Thêm / Sửa Khung Giờ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">
                {editingSlot ? `Sửa khung giờ: ${editingSlot.timeRange}` : 'Thêm khung giờ nhận món'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Khoảng thời gian (Giờ:Phút) (*):
                </label>
                <input
                  type="text"
                  value={formData.timeRange}
                  onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
                  placeholder="Ví dụ: 11:30 - 11:45"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số đơn tối đa (Giới hạn bếp):
                  </label>
                  <input
                    type="number"
                    value={formData.maxOrders}
                    onChange={(e) => setFormData({ ...formData, maxOrders: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trạng thái:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">Đang mở nhận đơn</option>
                    <option value="DISABLED">Tạm khóa ca này</option>
                  </select>
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
                  {formLoading ? 'Đang lưu...' : editingSlot ? 'Cập nhật' : 'Tạo khung giờ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
