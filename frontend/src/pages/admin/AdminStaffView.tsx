import React, { useState } from 'react';
import {
  Briefcase,
  Store,
  Search,
  Plus,
  Edit3,
  Eye,
  UserCheck,
  UserX,
  X,
  Shield,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { User, Canteen } from '../../types';

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  canteenId: string;
  canteenName: string;
  position: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

export const AdminStaffView: React.FC = () => {
  const { canteens, showToast } = useApp();

  const [staffList, setStaffList] = useState<StaffRecord[]>([
    {
      id: 'stf-1',
      name: 'Nguyễn Văn An',
      email: 'staff.a@canteen.edu.vn',
      phone: '0901 234 567',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      position: 'Trưởng ca Quầy & Thu ngân',
      status: 'ACTIVE',
      createdAt: '15/08/2026',
    },
    {
      id: 'stf-2',
      name: 'Lê Thị Thu',
      email: 'staff.b@canteen.edu.vn',
      phone: '0902 345 678',
      canteenId: 'cant-b',
      canteenName: 'Căng Tin B - Nhà Bếp Ký Túc Xá B5',
      position: 'Bếp trưởng chế biến',
      status: 'ACTIVE',
      createdAt: '20/08/2026',
    },
    {
      id: 'stf-3',
      name: 'Phạm Đức Huy',
      email: 'staff.c@canteen.edu.vn',
      phone: '0903 456 789',
      canteenId: 'cant-c',
      canteenName: 'Căng Tin C - Khu Thể Thao & Dịch Vụ',
      position: 'Nhân viên phục vụ & Giao món',
      status: 'ACTIVE',
      createdAt: '01/09/2026',
    },
    {
      id: 'stf-4',
      name: 'Trần Văn Hoàng',
      email: 'hoang.tv@canteen.edu.vn',
      phone: '0904 567 890',
      canteenId: 'cant-a',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      position: 'Nhân viên phụ bếp',
      status: 'BLOCKED',
      createdAt: '05/09/2026',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [canteenFilter, setCanteenFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Modals
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCanteenId, setFormCanteenId] = useState(canteens[0]?.id || 'cant-a');
  const [formPosition, setFormPosition] = useState('Nhân viên quầy thu ngân');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'BLOCKED'>('ACTIVE');

  const filteredStaff = staffList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);

    const matchCanteen = canteenFilter === 'ALL' || s.canteenId === canteenFilter;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchSearch && matchCanteen && matchStatus;
  });

  const handleOpenDetail = (s: StaffRecord) => {
    setSelectedStaff(s);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (s: StaffRecord) => {
    setSelectedStaff(s);
    setFormName(s.name);
    setFormEmail(s.email);
    setFormPhone(s.phone);
    setFormCanteenId(s.canteenId);
    setFormPosition(s.position);
    setFormStatus(s.status);
    setIsEditModalOpen(true);
  };

  const handleOpenAssign = (s: StaffRecord) => {
    setSelectedStaff(s);
    setFormCanteenId(s.canteenId);
    setIsAssignModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCanteenId(canteens[0]?.id || 'cant-a');
    setFormPosition('Nhân viên Quầy & Thu ngân');
    setFormStatus('ACTIVE');
    setIsCreateModalOpen(true);
  };

  const handleToggleBlock = (s: StaffRecord) => {
    const newStatus = s.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setStaffList((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, status: newStatus } : item))
    );
    showToast(
      `Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản nhân viên ${s.name}!`,
      newStatus === 'ACTIVE' ? 'success' : 'warning'
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const matchedCanteen = canteens.find((c) => c.id === formCanteenId);

    setStaffList((prev) =>
      prev.map((item) =>
        item.id === selectedStaff.id
          ? {
              ...item,
              name: formName.trim(),
              email: formEmail.trim(),
              phone: formPhone.trim(),
              canteenId: formCanteenId,
              canteenName: matchedCanteen?.name || item.canteenName,
              position: formPosition.trim(),
              status: formStatus,
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    showToast(`Đã cập nhật thông tin nhân viên ${formName}!`, 'success');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Vui lòng điền đủ Họ tên và Email nhân viên!', 'error');
      return;
    }

    const matchedCanteen = canteens.find((c) => c.id === formCanteenId);

    const newStaff: StaffRecord = {
      id: `stf-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '0901234567',
      canteenId: formCanteenId,
      canteenName: matchedCanteen?.name || 'Căn tin Campus',
      position: formPosition.trim(),
      status: formStatus,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setStaffList((prev) => [newStaff, ...prev]);
    setIsCreateModalOpen(false);
    showToast(`Đã tạo tài khoản nhân viên ${newStaff.name}!`, 'success');
  };

  const handleConfirmAssign = () => {
    if (!selectedStaff) return;
    const matchedCanteen = canteens.find((c) => c.id === formCanteenId);

    setStaffList((prev) =>
      prev.map((item) =>
        item.id === selectedStaff.id
          ? {
              ...item,
              canteenId: formCanteenId,
              canteenName: matchedCanteen?.name || item.canteenName,
            }
          : item
      )
    );
    setIsAssignModalOpen(false);
    showToast(
      `Đã chuyển phân công ${selectedStaff.name} sang ${matchedCanteen?.name}!`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-orange-400" />
              Quản Lý Nhân Viên & Phân Bổ Căn Tin
            </h2>
            <p className="text-xs text-slate-400">
              Quản lý tài khoản thu ngân, đầu bếp, phân quyền quản lý từng cơ sở căn tin trong khuôn viên trường.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Nhân Viên</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT nhân viên..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-orange-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={canteenFilter}
            onChange={(e) => setCanteenFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả căn tin ({canteens.length})</option>
            {canteens.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang làm việc (ACTIVE)</option>
            <option value="BLOCKED">Tạm khóa tài khoản (BLOCKED)</option>
          </select>
        </div>
      </div>

      {/* Staff Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Tên nhân viên</th>
                <th className="py-3.5 px-4">Email & SĐT</th>
                <th className="py-3.5 px-4">Căn tin phụ trách</th>
                <th className="py-3.5 px-4">Vị trí / Chức vụ</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-100">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {s.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{s.email}</div>
                      <div className="text-[11px] text-slate-500">{s.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                        <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{s.canteenName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
                        {s.position}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {s.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAssign(s)}
                          className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[11px] font-bold transition-colors cursor-pointer"
                          title="Gán sang căn tin khác"
                        >
                          Gán Căn tin
                        </button>

                        <button
                          onClick={() => handleOpenDetail(s)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleBlock(s)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            s.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                          title={s.status === 'ACTIVE' ? 'Khóa nhân viên' : 'Mở khóa'}
                        >
                          {s.status === 'ACTIVE' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
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

      {/* Modal 1: Staff Detail */}
      {isDetailModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Thông Tin Nhân Viên Căn Tin</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Họ và tên:</span>
                <span className="font-bold text-slate-100">{selectedStaff.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-slate-200">{selectedStaff.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số điện thoại:</span>
                <span className="font-bold text-slate-200">{selectedStaff.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Căn tin phụ trách:</span>
                <span className="font-bold text-emerald-400">{selectedStaff.canteenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vị trí đảm nhiệm:</span>
                <span className="font-bold text-slate-200">{selectedStaff.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quyền hạn hệ thống:</span>
                <span className="font-bold text-purple-300">ROLE STAFF (Phạm vi Căn tin)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-slate-200">{selectedStaff.status}</span>
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

      {/* Modal 2: Assign Staff to Canteen */}
      {isAssignModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Phân Bổ Căn Tin Phụ Trách</h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-slate-300">
                Gán nhân viên <span className="font-bold text-slate-100">{selectedStaff.name}</span> sang quản lý hoạt động tại căn tin:
              </p>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Chọn Căn tin</label>
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

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                Nhân viên này sau khi gán sẽ chỉ có quyền xem đơn hàng, thực đơn và số liệu của căn tin được chỉ định.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Xác Nhận Phân Bổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Create Staff */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveCreate}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Thêm Nhân Viên Căn Tin Mới</h3>
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
                <label className="block text-slate-400 font-semibold mb-1">Họ và tên nhân viên</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email đăng nhập</label>
                <input
                  type="email"
                  required
                  placeholder="staff.name@canteen.edu.vn"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="0901 234 567"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Căn tin phụ trách</label>
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
                <label className="block text-slate-400 font-semibold mb-1">Chức vụ</label>
                <input
                  type="text"
                  placeholder="Trưởng quầy / Đầu bếp / Thu ngân"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
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
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Tạo Nhân Viên
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 4: Edit Staff */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Chỉnh Sửa Nhân Viên</h3>
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
                <label className="block text-slate-400 font-semibold mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
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

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Chức vụ</label>
                <input
                  type="text"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
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
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
