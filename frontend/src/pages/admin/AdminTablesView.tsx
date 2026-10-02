import React, { useState } from 'react';
import {
  QrCode,
  Plus,
  Search,
  Filter,
  Store,
  Edit3,
  Trash2,
  X,
  Printer,
  Download,
  CheckCircle2,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface TableRecord {
  id: string;
  tableNumber: string;
  canteenId: string;
  canteenName: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  qrCodeValue: string;
}

export const AdminTablesView: React.FC = () => {
  const { canteens, showToast } = useApp();

  const [tables, setTables] = useState<TableRecord[]>([
    {
      id: 'tbl-1',
      tableNumber: 'BÀN A01',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      capacity: 4,
      status: 'AVAILABLE',
      qrCodeValue: 'https://unieat.campus.edu.vn/?canteen=cant-a&table=A01',
    },
    {
      id: 'tbl-2',
      tableNumber: 'BÀN A02',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      capacity: 4,
      status: 'OCCUPIED',
      qrCodeValue: 'https://unieat.campus.edu.vn/?canteen=cant-a&table=A02',
    },
    {
      id: 'tbl-3',
      tableNumber: 'BÀN A03',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      capacity: 6,
      status: 'AVAILABLE',
      qrCodeValue: 'https://unieat.campus.edu.vn/?canteen=cant-a&table=A03',
    },
    {
      id: 'tbl-4',
      tableNumber: 'BÀN B01',
      canteenId: 'cant-b',
      canteenName: 'Căng Tin B - Nhà Bếp Ký Túc Xá B5',
      capacity: 4,
      status: 'AVAILABLE',
      qrCodeValue: 'https://unieat.campus.edu.vn/?canteen=cant-b&table=B01',
    },
    {
      id: 'tbl-5',
      tableNumber: 'BÀN B02',
      canteenId: 'cant-b',
      canteenName: 'Căng Tin B - Nhà Bếp Ký Túc Xá B5',
      capacity: 8,
      status: 'OCCUPIED',
      qrCodeValue: 'https://unieat.campus.edu.vn/?canteen=cant-b&table=B02',
    },
  ]);

  const [canteenFilter, setCanteenFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedTable, setSelectedTable] = useState<TableRecord | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [formNumber, setFormNumber] = useState('');
  const [formCanteenId, setFormCanteenId] = useState(canteens[0]?.id || 'cant-a');
  const [formCapacity, setFormCapacity] = useState<number>(4);

  const filteredTables = tables.filter((t) => {
    const matchSearch =
      t.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.canteenName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCanteen = canteenFilter === 'ALL' || t.canteenId === canteenFilter;
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchSearch && matchCanteen && matchStatus;
  });

  const handleOpenQR = (table: TableRecord) => {
    setSelectedTable(table);
    setIsQRModalOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber.trim()) {
      showToast('Vui lòng nhập số hiệu bàn!', 'error');
      return;
    }

    const matchedCanteen = canteens.find((c) => c.id === formCanteenId);
    const newTable: TableRecord = {
      id: `tbl-${Date.now()}`,
      tableNumber: formNumber.trim().toUpperCase(),
      canteenId: formCanteenId,
      canteenName: matchedCanteen?.name || 'Căn tin Campus',
      capacity: Number(formCapacity) || 4,
      status: 'AVAILABLE',
      qrCodeValue: `https://unieat.campus.edu.vn/?canteen=${formCanteenId}&table=${encodeURIComponent(
        formNumber.trim()
      )}`,
    };

    setTables((prev) => [...prev, newTable]);
    setIsCreateModalOpen(false);
    showToast(`Đã thêm bàn ${newTable.tableNumber} và tự động sinh mã QR!`, 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bàn này khỏi danh sách?')) {
      setTables((prev) => prev.filter((t) => t.id !== id));
      showToast('Đã xóa bàn!', 'info');
    }
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-purple-400" />
              Quản Lý Bàn Ăn & Mã QR Toàn Hệ Thống
            </h2>
            <p className="text-xs text-slate-400">
              Quản lý vị trí bàn ăn cho sinh viên quét mã đặt món trực tiếp tại chỗ, in ấn thẻ QR Code dán bàn.
            </p>
          </div>

          <button
            onClick={() => {
              setFormNumber(`BÀN ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}0${tables.length + 1}`);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Bàn Ăn Mới</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo số bàn..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 outline-hidden"
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Bàn trống (Sẵn sàng)</option>
            <option value="OCCUPIED">Đang có khách ngồi</option>
          </select>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTables.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 p-5 rounded-3xl transition-all shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black text-sm shadow-inner">
                    {t.tableNumber.replace('BÀN ', '')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base">{t.tableNumber}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{t.canteenName}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    t.status === 'AVAILABLE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {t.status === 'AVAILABLE' ? 'Bàn trống' : 'Đang phục vụ'}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Sức chứa: <strong className="text-slate-200">{t.capacity} chỗ ngồi</strong>
                </span>
                <span className="text-[10px] font-mono text-purple-400">QR Code: Active</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenQR(t)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/20 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Xem & In Mã QR</span>
              </button>

              <button
                onClick={() => handleDelete(t.id)}
                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                title="Xóa bàn"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: QR Code Preview & Print */}
      {isQRModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-sm">Thẻ Mã QR Bàn Ăn Sinh Viên</h3>
              <button
                onClick={() => setIsQRModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Card Area */}
            <div className="p-6 bg-white text-slate-950 rounded-2xl shadow-inner space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-purple-700 uppercase tracking-wider">
                <span>UNI CANTEEN CAMPUS</span>
              </div>
              <h2 className="text-2xl font-black">{selectedTable.tableNumber}</h2>
              <p className="text-[11px] text-slate-600 font-semibold">{selectedTable.canteenName}</p>

              {/* QR Image Graphic Simulated */}
              <div className="w-44 h-44 mx-auto bg-slate-100 border-2 border-slate-950 p-2 rounded-2xl flex items-center justify-center shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    selectedTable.qrCodeValue
                  )}`}
                  alt="QR Code Bàn"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                Quét mã để gọi món & thanh toán tại bàn
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handlePrintQR}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Thẻ Bàn</span>
              </button>
              <button
                onClick={() => setIsQRModalOpen(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create Table */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveCreate}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Thêm Bàn Ăn Mới</h3>
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
                <label className="block text-slate-400 font-semibold mb-1">Số hiệu bàn *</label>
                <input
                  type="text"
                  required
                  placeholder="BÀN A05"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Căn tin bố trí *</label>
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
                <label className="block text-slate-400 font-semibold mb-1">Số chỗ ngồi</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
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
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Tạo Bàn & Mã QR
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
