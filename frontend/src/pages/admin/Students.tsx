import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Edit3,
  Eye,
  UserCheck,
  UserX,
  X,
  Building,
  Home,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { User } from '../../types';

interface StudentRecord {
  id: string;
  studentId: string;
  name: string;
  className: string;
  faculty: string;
  email: string;
  phone: string;
  ktxAddress: string;
  status: 'ACTIVE' | 'BLOCKED';
  walletBalance: number;
}

export const AdminStudentsView: React.FC = () => {
  const { users, showToast } = useApp();

  // Initial student records derived from users with role STUDENT + demo university mock records
  const [students, setStudents] = useState<StudentRecord[]>(() => [
    {
      id: 'std-1',
      studentId: '20230012',
      name: 'Nguyễn Văn Minh',
      className: 'K68-CNTT1',
      faculty: 'Công nghệ thông tin',
      email: 'minh.nv230012@sis.edu.vn',
      phone: '0912 345 678',
      ktxAddress: 'KTX B2 - P.402',
      status: 'ACTIVE',
      walletBalance: 120000,
    },
    {
      id: 'std-2',
      studentId: '20230045',
      name: 'Trần Thị Mai',
      className: 'K68-KTPM2',
      faculty: 'Công nghệ thông tin',
      email: 'mai.tt230045@sis.edu.vn',
      phone: '0987 654 321',
      ktxAddress: 'KTX A1 - P.205',
      status: 'ACTIVE',
      walletBalance: 45000,
    },
    {
      id: 'std-3',
      studentId: '20220199',
      name: 'Lê Hoàng Nam',
      className: 'K67-QTKD1',
      faculty: 'Kinh tế & Quản lý',
      email: 'nam.lh220199@sis.edu.vn',
      phone: '0978 112 233',
      ktxAddress: 'KTX B1 - P.508',
      status: 'ACTIVE',
      walletBalance: 85000,
    },
    {
      id: 'std-4',
      studentId: '20240312',
      name: 'Phạm Quỳnh Anh',
      className: 'K69-NNA3',
      faculty: 'Ngoại ngữ',
      email: 'anh.pq240312@sis.edu.vn',
      phone: '0934 889 900',
      ktxAddress: 'KTX A2 - P.310',
      status: 'BLOCKED',
      walletBalance: 0,
    },
    {
      id: 'std-5',
      studentId: '20230556',
      name: 'Đỗ Quốc Bảo',
      className: 'K68-DTVT1',
      faculty: 'Điện - Điện tử',
      email: 'bao.dq230556@sis.edu.vn',
      phone: '0945 667 788',
      ktxAddress: 'KTX B2 - P.201',
      status: 'ACTIVE',
      walletBalance: 215000,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Modals
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formClassName, setFormClassName] = useState('');
  const [formFaculty, setFormFaculty] = useState('Công nghệ thông tin');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formKtxAddress, setFormKtxAddress] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'BLOCKED'>('ACTIVE');

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFaculty = facultyFilter === 'ALL' || s.faculty === facultyFilter;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchSearch && matchFaculty && matchStatus;
  });

  const handleOpenDetail = (st: StudentRecord) => {
    setSelectedStudent(st);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (st: StudentRecord) => {
    setSelectedStudent(st);
    setFormStudentId(st.studentId);
    setFormName(st.name);
    setFormClassName(st.className);
    setFormFaculty(st.faculty);
    setFormEmail(st.email);
    setFormPhone(st.phone);
    setFormKtxAddress(st.ktxAddress);
    setFormStatus(st.status);
    setIsEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormStudentId(`2026${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormClassName('K68-CNTT');
    setFormFaculty('Công nghệ thông tin');
    setFormEmail('');
    setFormPhone('');
    setFormKtxAddress('KTX B1 - P.301');
    setFormStatus('ACTIVE');
    setIsCreateModalOpen(true);
  };

  const handleToggleBlock = (st: StudentRecord) => {
    const newStatus = st.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setStudents((prev) =>
      prev.map((item) => (item.id === st.id ? { ...item, status: newStatus } : item))
    );
    showToast(
      `Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} sinh viên ${st.name} (MSSV: ${st.studentId})!`,
      newStatus === 'ACTIVE' ? 'success' : 'warning'
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setStudents((prev) =>
      prev.map((item) =>
        item.id === selectedStudent.id
          ? {
            ...item,
            studentId: formStudentId.trim(),
            name: formName.trim(),
            className: formClassName.trim(),
            faculty: formFaculty,
            email: formEmail.trim(),
            phone: formPhone.trim(),
            ktxAddress: formKtxAddress.trim(),
            status: formStatus,
          }
          : item
      )
    );
    setIsEditModalOpen(false);
    showToast(`Đã cập nhật thông tin sinh viên ${formName}!`, 'success');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId.trim() || !formName.trim() || !formEmail.trim()) {
      showToast('Vui lòng điền đủ MSSV, Họ tên và Email!', 'error');
      return;
    }

    const newStudent: StudentRecord = {
      id: `std-${Date.now()}`,
      studentId: formStudentId.trim(),
      name: formName.trim(),
      className: formClassName.trim(),
      faculty: formFaculty,
      email: formEmail.trim(),
      phone: formPhone.trim() || '0987654321',
      ktxAddress: formKtxAddress.trim() || 'KTX B1',
      status: formStatus,
      walletBalance: 50000,
    };

    setStudents((prev) => [newStudent, ...prev]);
    setIsCreateModalOpen(false);
    showToast(`Đã thêm sinh viên ${newStudent.name} vào hệ thống!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-cyan-400" />
              Quản Lý Danh Sách Sinh Viên Toàn Trường
            </h2>
            <p className="text-xs text-slate-400">
              Tra cứu mã sinh viên (MSSV), lớp, khoa phòng KTX phục vụ xác thực tài khoản và giao món tận phòng.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sinh Viên Mới</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo MSSV, tên, lớp..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả khoa / bộ môn</option>
            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
            <option value="Kinh tế & Quản lý">Kinh tế & Quản lý</option>
            <option value="Điện - Điện tử">Điện - Điện tử</option>
            <option value="Ngoại ngữ">Ngoại ngữ</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang học / Hoạt động (ACTIVE)</option>
            <option value="BLOCKED">Đã khóa / Tạm dừng (BLOCKED)</option>
          </select>
        </div>
      </div>

      {/* Student Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">MSSV</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Lớp / Khoa</th>
                <th className="py-3.5 px-4">Email & SĐT</th>
                <th className="py-3.5 px-4">Địa chỉ KTX</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy sinh viên nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-cyan-400">
                      {st.studentId}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-100">
                      {st.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{st.className}</div>
                      <div className="text-[11px] text-slate-400">{st.faculty}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{st.email}</div>
                      <div className="text-[11px] text-slate-500">{st.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        <Home className="w-3 h-3 text-amber-400" />
                        {st.ktxAddress}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${st.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                      >
                        {st.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(st)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Xem hồ sơ sinh viên"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Chỉnh sửa hồ sơ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleBlock(st)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${st.status === 'ACTIVE'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                            }`}
                          title={st.status === 'ACTIVE' ? 'Khóa quyền đặt món' : 'Mở khóa'}
                        >
                          {st.status === 'ACTIVE' ? (
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

      {/* Modal 1: Student Detail */}
      {isDetailModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Hồ Sơ Sinh Viên</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">MSSV:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedStudent.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Họ và tên:</span>
                <span className="font-bold text-slate-100">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lớp sinh hoạt:</span>
                <span className="font-bold text-slate-200">{selectedStudent.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Khoa / Bộ môn:</span>
                <span className="font-bold text-slate-200">{selectedStudent.faculty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email trường:</span>
                <span className="font-bold text-slate-200">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số điện thoại:</span>
                <span className="font-bold text-slate-200">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Địa chỉ KTX:</span>
                <span className="font-bold text-amber-400">{selectedStudent.ktxAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số dư ví Campus:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedStudent.walletBalance.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-slate-200">{selectedStudent.status}</span>
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

      {/* Modal 2: Edit Student */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Sửa Thông Tin Sinh Viên</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mã sinh viên (MSSV)</label>
                  <input
                    type="text"
                    required
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-cyan-400 font-mono font-bold outline-hidden"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lớp sinh hoạt</label>
                  <input
                    type="text"
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Khoa / Viện</label>
                  <select
                    value={formFaculty}
                    onChange={(e) => setFormFaculty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Kinh tế & Quản lý">Kinh tế & Quản lý</option>
                    <option value="Điện - Điện tử">Điện - Điện tử</option>
                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email trường</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-slate-400 font-semibold mb-1">Địa chỉ phòng KTX</label>
                  <input
                    type="text"
                    value={formKtxAddress}
                    onChange={(e) => setFormKtxAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 outline-hidden"
                  />
                </div>
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
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Create Student */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSaveCreate}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Thêm Sinh Viên Mới</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">MSSV</label>
                  <input
                    type="text"
                    required
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-cyan-400 font-mono font-bold outline-hidden"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lớp</label>
                  <input
                    type="text"
                    placeholder="K68-CNTT1"
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Khoa</label>
                  <select
                    value={formFaculty}
                    onChange={(e) => setFormFaculty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                  >
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Kinh tế & Quản lý">Kinh tế & Quản lý</option>
                    <option value="Điện - Điện tử">Điện - Điện tử</option>
                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email trường</label>
                <input
                  type="email"
                  required
                  placeholder="student@sis.edu.vn"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phòng KTX</label>
                  <input
                    type="text"
                    placeholder="KTX B2 - P.402"
                    value={formKtxAddress}
                    onChange={(e) => setFormKtxAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 outline-hidden"
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
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Thêm Sinh Viên
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
