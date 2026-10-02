import React, { useState } from 'react';
import {
  Store,
  Plus,
  Search,
  Power,
  Edit3,
  Eye,
  Trash2,
  X,
  MapPin,
  Clock,
  Phone,
  UtensilsCrossed,
  Users,
  QrCode,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Canteen } from '../../types';

export const AdminCanteensView: React.FC = () => {
  const { canteens, toggleCanteenStatus, foods, orders, diningTables, showToast } = useApp();

  const [localCanteens, setLocalCanteens] = useState<Canteen[]>(canteens);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  // Modals
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOpeningHours, setFormOpeningHours] = useState('06:30 - 20:30');
  const [formTotalTables, setFormTotalTables] = useState<number>(30);
  const [formImage, setFormImage] = useState('');

  const filteredCanteens = localCanteens.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OPEN' && c.isOpen) ||
      (statusFilter === 'CLOSED' && !c.isOpen);

    return matchSearch && matchStatus;
  });

  const handleToggle = (canteenId: string) => {
    setLocalCanteens((prev) =>
      prev.map((c) => (c.id === canteenId ? { ...c, isOpen: !c.isOpen } : c))
    );
    toggleCanteenStatus(canteenId);
  };

  const handleOpenDetail = (c: Canteen) => {
    setSelectedCanteen(c);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (c: Canteen) => {
    setSelectedCanteen(c);
    setFormName(c.name);
    setFormCode(c.code);
    setFormLocation(c.location);
    setFormPhone(c.phone);
    setFormOpeningHours(c.openingHours);
    setFormTotalTables(c.totalTables);
    setFormImage(c.image);
    setIsEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormCode(`CANT-${String.fromCharCode(65 + localCanteens.length)}`);
    setFormLocation('Khuôn viên trung tâm Campus');
    setFormPhone('024 3869 1234');
    setFormOpeningHours('06:30 - 20:30');
    setFormTotalTables(25);
    setFormImage('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600');
    setIsCreateModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCanteen) return;

    setLocalCanteens((prev) =>
      prev.map((c) =>
        c.id === selectedCanteen.id
          ? {
              ...c,
              name: formName.trim(),
              code: formCode.trim(),
              location: formLocation.trim(),
              phone: formPhone.trim(),
              openingHours: formOpeningHours.trim(),
              totalTables: Number(formTotalTables) || 20,
              image: formImage.trim() || c.image,
            }
          : c
      )
    );
    setIsEditModalOpen(false);
    showToast(`Đã cập nhật thông tin ${formName}!`, 'success');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Vui lòng nhập tên căn tin!', 'error');
      return;
    }

    const newCanteen: Canteen = {
      id: `cant-${Date.now()}`,
      name: formName.trim(),
      code: formCode.trim() || `CANT-${Date.now()}`,
      location: formLocation.trim(),
      phone: formPhone.trim() || '024 3869 1234',
      openingHours: formOpeningHours.trim(),
      totalTables: Number(formTotalTables) || 20,
      isOpen: true,
      rating: 5.0,
      reviewCount: 0,
      image: formImage.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    };

    setLocalCanteens((prev) => [...prev, newCanteen]);
    setIsCreateModalOpen(false);
    showToast(`Đã thêm mới căn tin ${newCanteen.name}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Store className="w-6 h-6 text-emerald-400" />
              Quản Lý Hệ Thống Căn Tin Toàn Trường
            </h2>
            <p className="text-xs text-slate-400">
              Quản trị danh sách các quầy căng tin, giờ phục vụ, sức chứa số bàn và giám sát hoạt động thời gian thực.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Căn Tin Mới</span>
          </button>
        </div>

        {/* Filter and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên quầy, mã căn tin, địa điểm..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái hoạt động</option>
            <option value="OPEN">Đang mở cửa phục vụ</option>
            <option value="CLOSED">Tạm đóng cửa / Bảo trì</option>
          </select>
        </div>
      </div>

      {/* Canteen Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCanteens.map((cant) => {
          const canteenFoods = foods.filter((f) => f.canteenId === cant.id);
          const canteenOrders = orders.filter((o) => o.canteenId === cant.id);

          return (
            <div
              key={cant.id}
              className={`bg-slate-900/90 border rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-all ${
                cant.isOpen ? 'border-slate-800 hover:border-emerald-500/40' : 'border-rose-900/40 opacity-80'
              }`}
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-44 bg-slate-800 overflow-hidden">
                  <img
                    src={cant.image}
                    alt={cant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-200 border border-slate-700">
                      MÃ: {cant.code}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md ${
                        cant.isOpen
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {cant.isOpen ? 'Đang mở cửa' : 'Tạm đóng'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-base truncate">{cant.name}</h3>
                    <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {cant.location}
                    </p>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Giờ mở cửa
                      </span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {cant.openingHours}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Sức chứa bàn
                      </span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                        <QrCode className="w-3.5 h-3.5 text-blue-400" />
                        {cant.totalTables} bàn QR
                      </span>
                    </div>
                  </div>

                  {/* Connected Stats */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400">Thực đơn phục vụ:</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {canteenFoods.length} món ăn
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400">Hotline quầy:</span>
                    <span className="font-bold text-slate-200">{cant.phone}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-0 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggle(cant.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cant.isOpen
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{cant.isOpen ? 'Đang Hoạt Động' : 'Đang Tạm Dừng'}</span>
                </button>

                <button
                  onClick={() => handleOpenDetail(cant)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title="Xem chi tiết các liên kết"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenEdit(cant)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title="Chỉnh sửa thông tin"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Canteen Detail */}
      {isDetailModalOpen && selectedCanteen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Chi Tiết Cơ Sở Căn Tin</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCanteen.image}
                  alt={selectedCanteen.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <p className="font-black text-slate-100 text-base">{selectedCanteen.name}</p>
                  <p className="text-slate-400">{selectedCanteen.location}</p>
                  <p className="text-purple-400 font-mono mt-0.5">Mã: {selectedCanteen.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Giờ hoạt động:</span>
                  <p className="font-bold text-slate-200">{selectedCanteen.openingHours}</p>
                </div>
                <div>
                  <span className="text-slate-400">Sức chứa bàn:</span>
                  <p className="font-bold text-slate-200">{selectedCanteen.totalTables} bàn</p>
                </div>
                <div>
                  <span className="text-slate-400">Số điện thoại:</span>
                  <p className="font-bold text-slate-200">{selectedCanteen.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Trạng thái:</span>
                  <p className="font-bold text-emerald-400">
                    {selectedCanteen.isOpen ? 'Đang mở cửa' : 'Tạm dừng'}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                  Tài Nguyên Liên Kết Trực Thuộc
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-center">
                    <span className="font-mono font-black text-amber-400 block text-base">
                      {foods.filter((f) => f.canteenId === selectedCanteen.id).length}
                    </span>
                    <span className="text-[10px] text-slate-400">Món ăn</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800 text-center">
                    <span className="font-mono font-black text-cyan-400 block text-base">
                      {selectedCanteen.totalTables}
                    </span>
                    <span className="text-[10px] text-slate-400">Bàn QR</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800 text-center">
                    <span className="font-mono font-black text-purple-400 block text-base">
                      {orders.filter((o) => o.canteenId === selectedCanteen.id).length}
                    </span>
                    <span className="text-[10px] text-slate-400">Đơn hàng</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Canteen */}
      {isEditModalOpen && selectedCanteen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Sửa Thông Tin Căn Tin</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tên căn tin</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mã căn tin</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Địa chỉ / Vị trí</label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    value={formOpeningHours}
                    onChange={(e) => setFormOpeningHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sức chứa số bàn</label>
                  <input
                    type="number"
                    value={formTotalTables}
                    onChange={(e) => setFormTotalTables(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">URL Ảnh đại diện</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Create Canteen */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveCreate}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Thêm Căn Tin Mới</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tên căn tin</label>
                <input
                  type="text"
                  required
                  placeholder="Căng Tin D - Nhà Thi Đấu Đa Năng"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mã căn tin</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Địa chỉ khuôn viên</label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    value={formOpeningHours}
                    onChange={(e) => setFormOpeningHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sức chứa số bàn</label>
                  <input
                    type="number"
                    value={formTotalTables}
                    onChange={(e) => setFormTotalTables(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Tạo Căn Tin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
