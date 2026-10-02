import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Wallet,
  Shield,
  Edit3,
  Eye,
  Plus,
  X,
  Lock,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { User, Role } from '../../types';

export const AdminUsersView: React.FC = () => {
  const { users, currentUser, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState<number>(50000);

  // Edit / Create Form States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<Role>('STUDENT');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'BLOCKED'>('ACTIVE');
  const [formDepartment, setFormDepartment] = useState('');
  const [formStudentId, setFormStudentId] = useState('');

  // Local user list state to support immediate CRUD operations
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  // Filtered List
  const filteredUsers = localUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      (u.studentId && u.studentId.includes(searchTerm));

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormDepartment(user.department || '');
    setFormStudentId(user.studentId || '');
    setIsEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('STUDENT');
    setFormStatus('ACTIVE');
    setFormDepartment('Công Nghệ Thông Tin');
    setFormStudentId('');
    setIsCreateModalOpen(true);
  };

  const handleOpenCredit = (user: User) => {
    setSelectedUser(user);
    setCreditAmount(50000);
    setIsCreditModalOpen(true);
  };

  const handleToggleBlock = (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    showToast(
      `Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản ${user.name}!`,
      newStatus === 'ACTIVE' ? 'success' : 'warning'
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLocalUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: formName.trim(),
              email: formEmail.trim(),
              phone: formPhone.trim(),
              role: formRole,
              status: formStatus,
              department: formDepartment.trim(),
              studentId: formStudentId.trim() || undefined,
            }
          : u
      )
    );
    setIsEditModalOpen(false);
    showToast(`Đã cập nhật thông tin tài khoản ${formName}!`, 'success');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Vui lòng nhập đầy đủ tên và email!', 'error');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '0987654321',
      role: formRole,
      status: formStatus,
      department: formDepartment.trim() || undefined,
      studentId: formStudentId.trim() || undefined,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300`,
      walletBalance: 0,
      savedAddresses: [],
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setLocalUsers((prev) => [newUser, ...prev]);
    setIsCreateModalOpen(false);
    showToast(`Đã tạo thành công tài khoản ${newUser.name}!`, 'success');
  };

  const handleConfirmCredit = () => {
    if (!selectedUser) return;
    setLocalUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, walletBalance: (u.walletBalance || 0) + Number(creditAmount) }
          : u
      )
    );
    setIsCreditModalOpen(false);
    showToast(
      `Đã cấp +${Number(creditAmount).toLocaleString('vi-VN')}đ vào ví cho ${selectedUser.name}!`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Quản Lý Người Dùng & Phân Quyền Hệ Thống
            </h2>
            <p className="text-xs text-slate-400">
              Tra cứu thông tin, quản lý vai trò sinh viên, nhân viên căn tin và quản trị viên toàn trường.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Người Dùng</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT, MSSV..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả vai trò (CUSTOMER / STAFF / ADMIN)</option>
            <option value="STUDENT">Sinh viên (Customer)</option>
            <option value="STAFF">Nhân viên Căn tin (Staff)</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái (ACTIVE / BLOCKED)</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="BLOCKED">Bị khóa (BLOCKED)</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Người dùng</th>
                <th className="py-3.5 px-4">Email & SĐT</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Số dư Ví</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-700"
                        />
                        <div>
                          <p className="font-extrabold text-slate-100">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ID: {u.id} {u.studentId ? `• MSSV: ${u.studentId}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-500">{u.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : u.role === 'STAFF'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {u.role === 'STUDENT' ? 'SINH VIÊN' : u.role === 'STAFF' ? 'NHÂN VIÊN' : 'ADMIN'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {(u.walletBalance || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Hoạt động
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" /> Đã khóa
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {u.createdAt || '01/09/2026'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Grant Credit */}
                        <button
                          onClick={() => handleOpenCredit(u)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                          title="Cấp vốn ví sinh viên"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                        </button>

                        {/* View Detail */}
                        <button
                          onClick={() => handleOpenDetail(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Lock / Unlock */}
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                          title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {u.status === 'ACTIVE' ? (
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

      {/* Modal 1: User Detail */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Hồ Sơ Chi Tiết Người Dùng</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
              />
              <div>
                <p className="font-black text-lg text-slate-100">{selectedUser.name}</p>
                <p className="text-xs text-purple-400 font-semibold">{selectedUser.role}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedUser.id}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-slate-200">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số điện thoại:</span>
                <span className="font-bold text-slate-200">{selectedUser.phone}</span>
              </div>
              {selectedUser.studentId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã sinh viên:</span>
                  <span className="font-bold text-slate-200">{selectedUser.studentId}</span>
                </div>
              )}
              {selectedUser.department && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Khoa / Bộ môn:</span>
                  <span className="font-bold text-slate-200">{selectedUser.department}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Số dư ví Campus:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {(selectedUser.walletBalance || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-slate-200">{selectedUser.status}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2 mt-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" /> Mật khẩu:
                </span>
                <span className="text-slate-500 font-mono italic">•••••••• (Bcrypt hash)</span>
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

      {/* Modal 2: Edit User */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Chỉnh Sửa Người Dùng</h3>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vai trò</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    <option value="STUDENT">Sinh viên (Customer)</option>
                    <option value="STAFF">Nhân viên (Staff)</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Trạng thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="BLOCKED">Khóa (BLOCKED)</option>
                  </select>
                </div>
              </div>

              {formRole === 'STUDENT' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mã sinh viên (MSSV)</label>
                  <input
                    type="text"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
              )}
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
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Create User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveCreate}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Thêm Người Dùng Mới</h3>
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
                <label className="block text-slate-400 font-semibold mb-1">Họ và tên</label>
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
                <label className="block text-slate-400 font-semibold mb-1">Email trường</label>
                <input
                  type="email"
                  required
                  placeholder="student@st.university.edu.vn"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="0912 345 678"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phân quyền</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    <option value="STUDENT">Sinh viên (Customer)</option>
                    <option value="STAFF">Nhân viên (Staff)</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Trạng thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="BLOCKED">Tạm khóa (BLOCKED)</option>
                  </select>
                </div>
              </div>

              {formRole === 'STUDENT' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mã sinh viên (MSSV)</label>
                  <input
                    type="text"
                    placeholder="20261234"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
              )}
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
                Tạo Tài Khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 4: Grant Wallet Credit */}
      {isCreditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Cấp Vốn Ví Sinh Viên
              </h3>
              <button
                onClick={() => setIsCreditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-slate-300">
                Cấp số dư học bổng / hỗ trợ căn tin cho tài khoản:
              </p>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="font-bold text-slate-100">{selectedUser.name}</p>
                <p className="text-slate-400">{selectedUser.email}</p>
                <p className="text-emerald-400 font-mono mt-1">
                  Số dư hiện tại: {(selectedUser.walletBalance || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Số tiền cấp (VNĐ)</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCreditAmount(amt)}
                      className={`py-1.5 rounded-xl font-mono text-xs font-bold border cursor-pointer ${
                        creditAmount === amt
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      +{amt / 1000}k
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmCredit}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Xác Nhận Cấp Vốn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
