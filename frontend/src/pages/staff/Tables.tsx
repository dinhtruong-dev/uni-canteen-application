import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Plus,
  Edit2,
  Trash2,
  Printer,
  X,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import { staffTableService } from '../../services/api/client';
import { TableQRScannerModal } from '../../components/staff/TableQRScannerModal';
import { getSocket } from '../../services/socket.client';
import { useApp } from '../../store/AppContext';
import type { DiningTable } from '../../types/shared/table.types';

export const StaffTablesView: React.FC = () => {
  const { showToast } = useApp();
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    area: 'Khu vực Trung tâm A2',
    status: 'AVAILABLE',
  });
  const [formLoading, setFormLoading] = useState(false);

  // QR Print Modal
  const [previewQrTable, setPreviewQrTable] = useState<DiningTable | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await staffTableService.getTables('cant-a');
      if (res.success && Array.isArray(res.data)) {
        setTables(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      showToast('Lỗi khi tải danh sách bàn ăn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [cleaningId, setCleaningId] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
    const socket = getSocket();
    if (socket) {
      socket.emit('join:staff', 'cant-a');
      const handleTableChange = () => fetchTables();
      socket.on('table:occupied', handleTableChange);
      socket.on('table:released', handleTableChange);
      socket.on('order:status_updated', handleTableChange);
      return () => {
        socket.off('table:occupied', handleTableChange);
        socket.off('table:released', handleTableChange);
        socket.off('order:status_updated', handleTableChange);
      };
    }
  }, []);

  const handleCleanTable = async (tableId: string, tableNumber?: string) => {
    try {
      setCleaningId(tableId);
      const res = await staffTableService.cleanTable(tableId);
      if (res.success) {
        showToast(`Đã dọn dẹp ${tableNumber || 'bàn'} sạch sẽ và sẵn sàng đón khách mới!`, 'success');
      }
      await fetchTables();
    } catch (err: any) {
      console.error('Clean table error:', err);
      showToast(err?.message || 'Lỗi khi làm sạch bàn', 'error');
    } finally {
      setCleaningId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTable(null);
    const nextNum = (tables.length + 1).toString().padStart(2, '0');
    setFormData({
      tableNumber: `Bàn ${nextNum}`,
      capacity: 4,
      area: 'Khu vực Trung tâm A2',
      status: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (table: DiningTable) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber || '',
      capacity: table.capacity || 4,
      area: table.area || 'Khu vực Trung tâm A2',
      status: table.status || 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        tableNumber: formData.tableNumber.trim(),
        capacity: Number(formData.capacity) || 4,
        area: formData.area.trim(),
        status: formData.status,
        canteenId: 'cant-a',
      };

      if (editingTable) {
        const res = await staffTableService.updateTable(editingTable.id, payload);
        if (res.success) {
          showToast(`Đã cập nhật ${payload.tableNumber} thành công!`, 'success');
        }
      } else {
        const res = await staffTableService.createTable(payload);
        if (res.success) {
          showToast(`Đã tạo ${payload.tableNumber} thành công!`, 'success');
        }
      }

      setIsModalOpen(false);
      fetchTables();
    } catch (err: any) {
      console.error('Error saving table:', err);
      showToast(err?.message || 'Lỗi khi lưu bàn ăn', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleQuickStatusChange = async (table: DiningTable, nextStatus: string) => {
    try {
      const res = await staffTableService.updateTable(table.id, { status: nextStatus });
      if (res.success) {
        showToast(`Đã chuyển trạng thái ${table.tableNumber} sang ${nextStatus}`, 'success');
        setTables((prev) =>
          prev.map((t) => (t.id === table.id ? { ...t, status: nextStatus as any } : t))
        );
      }
    } catch (err: any) {
      console.error('Update table status error:', err);
      showToast('Lỗi khi đổi trạng thái bàn', 'error');
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bàn ăn này?')) return;
    try {
      await staffTableService.deleteTable(id);
      fetchTables();
    } catch (err) {
      console.error('Delete table error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SƠ ĐỒ BÀN ĂN
            </span>
            <span className="text-xs text-slate-400">{tables.length} bàn ăn tại Căng tin A</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">Quản lý Bàn Ăn & Mã QR Đặt Món</h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Quét Mã QR Bàn</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bàn ăn mới</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Đang tải sơ đồ bàn ăn...
          </div>
        ) : tables.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            Chưa có bàn ăn nào được tạo
          </div>
        ) : (
          tables.map((t) => {
            const isOccupied = t.status === 'OCCUPIED';
            const isReserved = t.status === 'RESERVED';
            const isCompletedOrder = isOccupied && t.orderStatus === 'COMPLETED';

            return (
              <div
                key={t.id}
                className={`p-4 rounded-3xl bg-slate-900 border transition-all flex flex-col justify-between group shadow-lg ${isCompletedOrder
                  ? 'border-amber-500/50 shadow-amber-950/30 ring-1 ring-amber-500/30'
                  : isOccupied
                    ? 'border-rose-500/40 shadow-rose-950/20'
                    : isReserved
                      ? 'border-amber-500/40 shadow-amber-950/20'
                      : 'border-slate-800 hover:border-emerald-500/40'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-100 font-mono">
                      {t.tableNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCompletedOrder
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : isOccupied
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isReserved
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                    >
                      {isCompletedOrder
                        ? 'Cần làm sạch'
                        : isOccupied
                          ? 'Có khách ngồi ăn'
                          : isReserved
                            ? 'Đã đặt'
                            : 'Còn trống'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{t.area || 'Khu vực chung'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sức chứa: {t.capacity || 4} chỗ</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Quick Card */}
                <div className="my-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://unieat.edu.vn/table/${t.tableNumber?.replace(/\s+/g, '')}`}
                        alt="QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-200">Mã QR bàn</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Quét để gọi món</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewQrTable(t)}
                    className="p-1.5 rounded-xl bg-slate-700/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                    title="Xem & in decal dán bàn"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                {/* Nút Làm Sạch Bàn khi có khách hoặc sau khi khách hoàn thành bữa ăn */}
                {isOccupied && (
                  <button
                    onClick={() => handleCleanTable(t.id)}
                    disabled={cleaningId === t.id}
                    className={`mb-3 w-full py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-98 cursor-pointer disabled:opacity-50 ${isCompletedOrder
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                      }`}
                    title="Khách dùng bữa xong - Dọn dẹp làm sạch bàn để đưa bàn về Còn trống"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {cleaningId === t.id
                        ? 'Đang làm sạch...'
                        : isCompletedOrder
                          ? 'Làm sạch (Đưa về Còn trống)'
                          : 'Làm sạch bàn (Đưa về Còn trống)'}
                    </span>
                  </button>
                )}

                {/* Status Switcher & Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <select
                    value={(t.status as string) === 'EMPTY' ? 'AVAILABLE' : (t.status || 'AVAILABLE')}
                    onChange={(e) => handleQuickStatusChange(t, e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="AVAILABLE">Còn trống</option>
                    <option value="OCCUPIED">Có khách</option>
                    <option value="RESERVED">Đã đặt</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Sửa bàn"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(t.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Xóa bàn"
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

      {/* Modal Thêm / Sửa Bàn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">
                {editingTable ? `Sửa thông tin: ${editingTable.tableNumber}` : 'Thêm bàn ăn mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên / Số bàn (*):</label>
                <input
                  type="text"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  placeholder="Ví dụ: Bàn 05"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sức chứa (chỗ ngồi):</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trạng thái bàn:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AVAILABLE">Còn trống</option>
                    <option value="OCCUPIED">Đang có khách</option>
                    <option value="RESERVED">Đã đặt trước</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Khu vực bàn:</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Ví dụ: Khu vực Cạnh Cửa Sổ Giảng Đường A2"
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
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  {formLoading ? 'Đang lưu...' : editingTable ? 'Cập nhật' : 'Tạo bàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Decal Printable Preview Modal */}
      {previewQrTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-6 shadow-2xl text-center space-y-4 relative">
            <button
              onClick={() => setPreviewQrTable(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Decal Card */}
            <div className="border-4 border-slate-900 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-xs">
                  U
                </div>
                <span className="font-extrabold text-sm tracking-tight">UNI CANTEEN</span>
              </div>

              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {previewQrTable.tableNumber?.toUpperCase()}
              </div>

              <div className="w-44 h-44 mx-auto border-2 border-slate-200 rounded-2xl p-2 bg-white flex items-center justify-center shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://unieat.edu.vn/table/${previewQrTable.tableNumber?.replace(/\s+/g, '')}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-800">
                  QUÉT MÃ ĐỂ ĐẶT MÓN & THANH TOÁN
                </div>
                <div className="text-[10px] text-slate-500">
                  Món ăn sẽ được quầy chế biến và phục vụ tận bàn cho bạn
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>In Decal Dán Bàn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table QR Scanner Modal */}
      <TableQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onTableUpdated={fetchTables}
      />
    </div>
  );
};
