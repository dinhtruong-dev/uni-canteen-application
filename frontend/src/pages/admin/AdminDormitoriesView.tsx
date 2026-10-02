import React, { useState } from 'react';
import {
  MapPin,
  Building,
  Plus,
  Power,
  Edit3,
  Trash2,
  X,
  Truck,
  CheckCircle2,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface DormitoryRecord {
  id: string;
  name: string;
  code: string;
  floorsCount: number;
  roomsCount: number;
  deliveryFee: number;
  isDeliveryActive: boolean;
  notes?: string;
}

export const AdminDormitoriesView: React.FC = () => {
  const { showToast } = useApp();

  const [dormitories, setDormitories] = useState<DormitoryRecord[]>([
    {
      id: 'dorm-1',
      name: 'Ký Túc Xá A1 (Nam Sinh Viên)',
      code: 'KTX-A1',
      floorsCount: 5,
      roomsCount: 80,
      deliveryFee: 5000,
      isDeliveryActive: true,
      notes: 'Giao tận cửa phòng, shipper có thẻ thang máy',
    },
    {
      id: 'dorm-2',
      name: 'Ký Túc Xá A2 (Nữ Sinh Viên)',
      code: 'KTX-A2',
      floorsCount: 5,
      roomsCount: 80,
      deliveryFee: 5000,
      isDeliveryActive: true,
      notes: 'Giao sảnh lễ tân tầng 1 hoặc phòng theo quy định',
    },
    {
      id: 'dorm-3',
      name: 'Ký Túc Xá B1 (Khu Mới Cao Tầng)',
      code: 'KTX-B1',
      floorsCount: 9,
      roomsCount: 160,
      deliveryFee: 7000,
      isDeliveryActive: true,
      notes: 'Khoảng cách xa hơn khu Giảng đường 400m',
    },
    {
      id: 'dorm-4',
      name: 'Ký Túc Xá B2 (Khu Mới Cao Tầng)',
      code: 'KTX-B2',
      floorsCount: 9,
      roomsCount: 160,
      deliveryFee: 7000,
      isDeliveryActive: true,
      notes: 'Khu tập trung đông sinh viên năm 1 và 2',
    },
    {
      id: 'dorm-5',
      name: 'Ký Túc Xá C1 (Lưu Học Sinh Quốc Tế)',
      code: 'KTX-C1',
      floorsCount: 6,
      roomsCount: 72,
      deliveryFee: 6000,
      isDeliveryActive: false, // temporarily paused
      notes: 'Tạm dừng do đang sửa chữa hệ thống PCCC tầng 3',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDorm, setEditingDorm] = useState<DormitoryRecord | null>(null);

  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formFloors, setFormFloors] = useState<number>(5);
  const [formRooms, setFormRooms] = useState<number>(80);
  const [formDeliveryFee, setFormDeliveryFee] = useState<number>(5000);
  const [formNotes, setFormNotes] = useState('');

  const handleToggle = (id: string) => {
    setDormitories((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isDeliveryActive: !d.isDeliveryActive } : d))
    );
    showToast('Đã cập nhật trạng thái nhận giao hàng của toà KTX!', 'success');
  };

  const handleOpenCreate = () => {
    setEditingDorm(null);
    setFormName('');
    setFormCode(`KTX-B${dormitories.length + 1}`);
    setFormFloors(5);
    setFormRooms(80);
    setFormDeliveryFee(5000);
    setFormNotes('Giao tận cửa phòng sinh viên');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: DormitoryRecord) => {
    setEditingDorm(d);
    setFormName(d.name);
    setFormCode(d.code);
    setFormFloors(d.floorsCount);
    setFormRooms(d.roomsCount);
    setFormDeliveryFee(d.deliveryFee);
    setFormNotes(d.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingDorm) {
      setDormitories((prev) =>
        prev.map((d) =>
          d.id === editingDorm.id
            ? {
                ...d,
                name: formName.trim(),
                code: formCode.trim(),
                floorsCount: Number(formFloors) || 5,
                roomsCount: Number(formRooms) || 80,
                deliveryFee: Number(formDeliveryFee) || 5000,
                notes: formNotes.trim(),
              }
            : d
        )
      );
      showToast(`Đã cập nhật toà nhà ${formName}!`, 'success');
    } else {
      const newDorm: DormitoryRecord = {
        id: `dorm-${Date.now()}`,
        name: formName.trim(),
        code: formCode.trim() || `KTX-${Date.now()}`,
        floorsCount: Number(formFloors) || 5,
        roomsCount: Number(formRooms) || 80,
        deliveryFee: Number(formDeliveryFee) || 5000,
        isDeliveryActive: true,
        notes: formNotes.trim(),
      };
      setDormitories((prev) => [...prev, newDorm]);
      showToast(`Đã thêm toà KTX mới ${newDorm.name}!`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa toà KTX này?')) {
      setDormitories((prev) => prev.filter((d) => d.id !== id));
      showToast('Đã xóa toà KTX!', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-400" />
              Quản Lý Khu Vực Ký Túc Xá & Điểm Giao Hàng
            </h2>
            <p className="text-xs text-slate-400">
              Quản lý các toà nhà KTX trong khuôn viên trường, cấu hình biểu phí ship tận phòng và bật/tắt nhận giao hàng.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Toà KTX Mới</span>
          </button>
        </div>
      </div>

      {/* Dormitories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dormitories.map((dorm) => (
          <div
            key={dorm.id}
            className={`bg-slate-900/90 border rounded-3xl p-6 transition-all shadow-md flex flex-col justify-between ${
              dorm.isDeliveryActive
                ? 'border-slate-800 hover:border-emerald-500/40'
                : 'border-rose-900/40 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-base shadow-inner">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base">{dorm.name}</h3>
                    <span className="text-[10px] font-mono text-purple-400 font-bold">
                      MÃ: {dorm.code}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    dorm.isDeliveryActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {dorm.isDeliveryActive ? 'NHẬN GIAO' : 'TẠM NGỪNG'}
                </span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Quy mô phòng
                  </span>
                  <span className="font-bold text-slate-200 mt-0.5 block">
                    {dorm.floorsCount} tầng • {dorm.roomsCount} phòng
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Phí giao phòng
                  </span>
                  <span className="font-bold text-amber-400 font-mono mt-0.5 block">
                    {dorm.deliveryFee.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {dorm.notes && (
                <p className="text-[11px] text-slate-400 mt-3 italic line-clamp-2">
                  Ghi chú: {dorm.notes}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggle(dorm.id)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  dorm.isDeliveryActive
                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{dorm.isDeliveryActive ? 'Tạm Dừng Giao' : 'Mở Giao Hàng'}</span>
              </button>

              <button
                onClick={() => handleOpenEdit(dorm)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Sửa thông tin"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDelete(dorm.id)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                title="Xóa toà nhà"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create or Edit Dormitory */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">
                {editingDorm ? 'Chỉnh Sửa Toà KTX' : 'Thêm Toà KTX Mới'}
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
                <label className="block text-slate-400 font-semibold mb-1">Tên toà KTX *</label>
                <input
                  type="text"
                  required
                  placeholder="Ký Túc Xá A3"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-medium outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mã toà nhà *</label>
                  <input
                    type="text"
                    required
                    placeholder="KTX-A3"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phí ship (VNĐ)</label>
                  <input
                    type="number"
                    step={1000}
                    value={formDeliveryFee}
                    onChange={(e) => setFormDeliveryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số tầng</label>
                  <input
                    type="number"
                    min={1}
                    value={formFloors}
                    onChange={(e) => setFormFloors(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ước tính số phòng</label>
                  <input
                    type="number"
                    min={1}
                    value={formRooms}
                    onChange={(e) => setFormRooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ghi chú hướng dẫn giao</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
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
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                {editingDorm ? 'Lưu Thay Đổi' : 'Thêm Toà KTX'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
