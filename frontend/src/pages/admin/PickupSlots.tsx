import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Power,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  Store,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface PickupSlotRecord {
  id: string;
  timeRange: string;
  canteenId: string;
  canteenName: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export const AdminPickupSlotsView: React.FC = () => {
  const { canteens, showToast } = useApp();

  const [slots, setSlots] = useState<PickupSlotRecord[]>([
    {
      id: 'slot-1',
      timeRange: '11:00 - 11:15',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      capacity: 30,
      bookedCount: 18,
      isAvailable: true,
    },
    {
      id: 'slot-2',
      timeRange: '11:15 - 11:30',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      capacity: 30,
      bookedCount: 28,
      isAvailable: true,
    },
    {
      id: 'slot-3',
      timeRange: '11:30 - 11:45',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      capacity: 35,
      bookedCount: 35,
      isAvailable: false, // full capacity
    },
    {
      id: 'slot-4',
      timeRange: '11:45 - 12:00',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      capacity: 35,
      bookedCount: 22,
      isAvailable: true,
    },
    {
      id: 'slot-5',
      timeRange: '12:00 - 12:15',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      capacity: 30,
      bookedCount: 14,
      isAvailable: true,
    },
    {
      id: 'slot-6',
      timeRange: '11:30 - 11:45',
      canteenId: 'cant-b',
      canteenName: 'Căng Tin B - Nhà Bếp Ký Túc Xá B5',
      capacity: 25,
      bookedCount: 12,
      isAvailable: true,
    },
  ]);

  const [canteenFilter, setCanteenFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTimeRange, setFormTimeRange] = useState('12:15 - 12:30');
  const [formCanteenId, setFormCanteenId] = useState(canteens[0]?.id || 'cant-a');
  const [formCapacity, setFormCapacity] = useState<number>(30);

  const filteredSlots = slots.filter(
    (s) => canteenFilter === 'ALL' || s.canteenId === canteenFilter
  );

  const handleToggle = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isAvailable: !s.isAvailable } : s))
    );
    showToast('Đã cập nhật trạng thái mở nhận đơn của khung giờ!', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa khung giờ này?')) {
      setSlots((prev) => prev.filter((s) => s.id !== id));
      showToast('Đã xóa khung giờ!', 'info');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTimeRange.trim()) return;

    const matchedCanteen = canteens.find((c) => c.id === formCanteenId);
    const newSlot: PickupSlotRecord = {
      id: `slot-${Date.now()}`,
      timeRange: formTimeRange.trim(),
      canteenId: formCanteenId,
      canteenName: matchedCanteen?.name || 'Căn tin Campus',
      capacity: Number(formCapacity) || 30,
      bookedCount: 0,
      isAvailable: true,
    };

    setSlots((prev) => [...prev, newSlot]);
    setIsModalOpen(false);
    showToast(`Đã thêm khung giờ nhận món ${newSlot.timeRange}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              Cấu Hình Khung Giờ Nhận Món (Pickup Slots)
            </h2>
            <p className="text-xs text-slate-400">
              Điều phối lưu lượng sinh viên tới quầy nhận món, giới hạn công suất đơn/slot tránh nghẽn bếp giờ cao điểm.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Khung Giờ Mới</span>
          </button>
        </div>

        {/* Filter */}
        <div className="pt-3 border-t border-slate-800 max-w-sm">
          <select
            value={canteenFilter}
            onChange={(e) => setCanteenFilter(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả Căn tin ({canteens.length})</option>
            {canteens.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.map((slot) => {
          const percent = Math.min(100, Math.round((slot.bookedCount / slot.capacity) * 100));
          const isFull = slot.bookedCount >= slot.capacity;

          return (
            <div
              key={slot.id}
              className={`bg-slate-900/90 border rounded-3xl p-5 transition-all shadow-md space-y-4 ${slot.isAvailable && !isFull
                ? 'border-slate-800 hover:border-blue-500/40'
                : 'border-rose-900/40 opacity-80'
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-slate-100 text-lg font-mono">{slot.timeRange}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[180px]">{slot.canteenName}</span>
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isFull
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : slot.isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                    }`}
                >
                  {isFull ? 'ĐÃ KÍN CHỖ' : slot.isAvailable ? 'ĐANG MỞ' : 'TẠM KHÓA'}
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Đã đặt trước:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {slot.bookedCount} / {slot.capacity} đơn
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${percent > 80 ? 'bg-rose-500' : percent > 50 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggle(slot.id)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${slot.isAvailable
                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{slot.isAvailable ? 'Tạm Khóa Slot' : 'Mở Lại Slot'}</span>
                </button>

                <button
                  onClick={() => handleDelete(slot.id)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                  title="Xóa slot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Slot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleCreate}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Thêm Khung Giờ Pickup Mới</h3>
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
                <label className="block text-slate-400 font-semibold mb-1">Khung giờ (Từ - Đến) *</label>
                <input
                  type="text"
                  required
                  placeholder="12:30 - 12:45"
                  value={formTimeRange}
                  onChange={(e) => setFormTimeRange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono font-bold outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Căn tin áp dụng *</label>
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
                <label className="block text-slate-400 font-semibold mb-1">Giới hạn số đơn tối đa *</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold outline-hidden"
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
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Tạo Khung Giờ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
