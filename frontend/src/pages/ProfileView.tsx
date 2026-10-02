import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryAddress } from '../types';
import {
  User as UserIcon,
  Wallet,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  CreditCard,
  Tag,
  HelpCircle,
  ShieldCheck,
  FileText,
  Info,
  FileCheck,
  Globe,
  Receipt,
  LogOut,
  ChevronRight,
  X,
  Camera,
  Upload,
  UserCog,
  Store,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export const ProfileView: React.FC<{ onOpenWalletModal: () => void }> = ({ onOpenWalletModal }) => {
  const { currentUser, updateProfile, walletBalance, walletTransactions, showToast, logout, navigateTo, switchUserRole } = useApp();

  // Modals state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // New Address Form state inside Address Modal
  const [newBuilding, setNewBuilding] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newCampus, setNewCampus] = useState('Cơ sở 1 (Main Campus)');
  const [newNotes, setNewNotes] = useState('');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuilding || !newRoom) {
      showToast('Vui lòng nhập đầy đủ tòa nhà và số phòng!', 'error');
      return;
    }
    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      campus: newCampus,
      area: 'Ký túc xá',
      building: newBuilding,
      floor: '1',
      room: newRoom,
      phone: currentUser.phone,
      notes: newNotes,
      isDefault: (currentUser.savedAddresses || []).length === 0,
    };
    const updatedAddresses = [...(currentUser.savedAddresses || []), newAddr];
    updateProfile({ savedAddresses: updatedAddresses });
    setNewBuilding('');
    setNewRoom('');
    setNewNotes('');
    showToast('Đã thêm địa chỉ giao hàng mới thành công!', 'success');
  };

  const handleDeleteAddress = (id?: string) => {
    if (!id) return;
    const updatedAddresses = (currentUser.savedAddresses || []).filter((a) => a.id !== id);
    updateProfile({ savedAddresses: updatedAddresses });
    showToast('Đã xóa địa chỉ đã lưu', 'info');
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-16">
      {/* 1. Header Profile - ONLY Avatar with Camera badge, Name, and MSV (Navigates to Edit Page) */}
      <div
        onClick={() => navigateTo('edit-profile')}
        className="pt-2 pb-1 flex items-center justify-between gap-4 cursor-pointer group hover:opacity-95 transition-opacity"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover ring-2 ring-orange-500/30 shadow-xs"
            />
            <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 text-white p-1 rounded-full shadow-xs group-hover:scale-110 transition-transform">
              <Camera className="w-3 h-3" />
            </div>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
              {currentUser.name}
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              MSV: {currentUser.studentId || '2022601234'}
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
      </div>

      {/* 2. Compact Wallet Section (Ví sinh viên) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Số dư Ví Sinh Viên</span>
            <span className="text-lg sm:text-xl font-black text-orange-400">
              {walletBalance.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTxModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Lịch sử
          </button>
          <button
            onClick={onOpenWalletModal}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nạp tiền</span>
          </button>
        </div>
      </div>

      {/* 3. Tác vụ Section - Equal Size Buttons with Icon + Title Only */}
      <div className="space-y-2">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          Tác vụ
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => navigateTo('checkout')}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 shadow-2xs flex items-center gap-3 transition-all cursor-pointer text-left h-14"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-slate-900 text-xs truncate">Thanh toán</span>
          </button>

          <button
            onClick={() => navigateTo('menu')}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 shadow-2xs flex items-center gap-3 transition-all cursor-pointer text-left h-14"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Tag className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-slate-900 text-xs truncate">Mã khuyến mại</span>
          </button>

          <button
            onClick={() =>
              setInfoModalContent({
                title: 'Trung tâm hỗ trợ sinh viên',
                content: (
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-800">
                      Tổng đài hỗ trợ Căng tin UniEat: <span className="text-orange-600">1900 6868</span>
                    </p>
                    <p>Email tiếp nhận góp ý: hotro@unieat.university.edu.vn</p>
                    <p>Thời gian làm việc: 06:00 - 20:30 (Thứ 2 đến Chủ Nhật)</p>
                  </div>
                ),
              })
            }
            className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 shadow-2xs flex items-center gap-3 transition-all cursor-pointer text-left h-14"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-slate-900 text-xs truncate">Trung tâm hỗ trợ</span>
          </button>

          <button
            onClick={() =>
              setInfoModalContent({
                title: 'Bảo mật thông tin sinh viên',
                content: (
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <p>Tài khoản UniEat được bảo vệ bởi cổng xác thực SSO trường đại học.</p>
                    <p>Mọi dữ liệu giao dịch thanh toán qua Ví Sinh Viên được mã hóa 256-bit chuẩn ngân hàng.</p>
                  </div>
                ),
              })
            }
            className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 shadow-2xs flex items-center gap-3 transition-all cursor-pointer text-left h-14"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-slate-900 text-xs truncate">Bảo mật</span>
          </button>
        </div>
      </div>

      {/* 4. Hỗ trợ hợp tác Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          Hỗ trợ hợp tác
        </h2>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 text-xs font-semibold text-slate-800">
          <button
            onClick={() =>
              setInfoModalContent({
                title: 'Điều khoản & Chính sách dịch vụ',
                content: (
                  <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                    <p>1. Sinh viên chịu trách nhiệm giữ gìn mã QR đặt món và hóa đơn thanh toán.</p>
                    <p>2. Món ăn được phục vụ nóng hổi ngay tại quầy hoặc giao trong vòng 20 phút.</p>
                    <p>3. Trong trường hợp hủy đơn trước khi nhà bếp làm món, tiền sẽ tự động hoàn 100% vào Ví.</p>
                  </div>
                ),
              })
            }
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Điều khoản chính sách</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() =>
              setInfoModalContent({
                title: 'Thông tin ứng dụng UniEat',
                content: (
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed text-center py-2">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-2">
                      U
                    </div>
                    <p className="font-bold text-slate-900 text-sm">UniEat Campus Dining v2.4.0</p>
                    <p className="text-slate-400 text-[11px]">Hệ thống phục vụ ăn uống thông minh nhà trường</p>
                  </div>
                ),
              })
            }
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Thông tin app</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() =>
              setInfoModalContent({
                title: 'Hợp đồng sử dụng dịch vụ Căng tin',
                content: (
                  <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                    <p>Hợp đồng cung cấp suất ăn sinh viên giữa Ban Quản lý Căng tin và Sinh viên Trường Đại học.</p>
                    <p>Cam kết an toàn vệ sinh thực phẩm 100% kiểm định hàng ngày.</p>
                  </div>
                ),
              })
            }
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span>Hợp đồng sử dụng dịch vụ</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 5. Cài đặt chung Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          Cài đặt chung
        </h2>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 text-xs font-semibold text-slate-800">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Ngôn ngữ</span>
            </div>
            <span className="text-xs font-bold text-orange-600">Tiếng Việt (VN)</span>
          </div>

          <button
            onClick={() => setAddressModalOpen(true)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Địa chỉ đã lưu</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              {currentUser.savedAddresses?.length || 0} địa chỉ <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          <button
            onClick={() => navigateTo('history')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>Hóa đơn & Lịch sử mua</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 6. Chuyển đổi giao diện Demo (Chuyển vai trò Admin / Nhân viên / Sinh viên) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCog className="w-3.5 h-3.5 text-orange-500" />
            <span>Chuyển đổi giao diện Demo</span>
          </h2>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            Hiện tại: {currentUser.role === 'ADMIN' ? 'Quản trị viên' : currentUser.role === 'STAFF' ? 'Nhân viên' : 'Sinh viên'}
          </span>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Chuyển đổi nhanh vai trò để trình chiếu & demo giao diện quản lý hệ thống:
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => switchUserRole('STUDENT')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                currentUser.role === 'STUDENT'
                  ? 'bg-orange-500 border-orange-400 text-white font-extrabold shadow-sm scale-102'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 font-bold'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs">Sinh Viên</span>
            </button>

            <button
              onClick={() => switchUserRole('STAFF')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                currentUser.role === 'STAFF'
                  ? 'bg-amber-500 border-amber-400 text-white font-extrabold shadow-sm scale-102'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 font-bold'
              }`}
            >
              <Store className="w-5 h-5" />
              <span className="text-xs">Nhân Viên</span>
            </button>

            <button
              onClick={() => switchUserRole('ADMIN')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                currentUser.role === 'ADMIN'
                  ? 'bg-purple-600 border-purple-400 text-white font-extrabold shadow-sm scale-102'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 font-bold'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs">Quản Trị</span>
            </button>
          </div>

          {/* Màn hình Bếp KDS chuyên dụng */}
          <button
            type="button"
            onClick={() => navigateTo('kitchen-kds')}
            className="w-full mt-2 p-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 text-white font-black text-xs flex items-center justify-between shadow-lg hover:opacity-95 transition-all cursor-pointer border border-white/20 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-white/20">
                <Flame className="w-4 h-4 fill-white text-white" />
              </span>
              <div className="text-left">
                <div className="font-black text-xs text-white">Màn Hình Bếp - KDS Căng Tin</div>
                <div className="text-[10px] text-white/80 font-bold">Tối ưu cảm ứng ngang & máy tính bàn</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-white/20 text-[10px] font-black uppercase tracking-wider">
              Mở KDS →
            </span>
          </button>
        </div>
      </div>

      {/* 6. Logout Button */}
      <div className="pt-3">
        <button
          onClick={logout}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>

      {/* MODAL 2: Saved Addresses Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" /> Địa Chỉ Giao Hàng Đã Lưu
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Address List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(currentUser.savedAddresses || []).map((addr) => (
                <div
                  key={addr.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs bg-slate-50/50"
                >
                  <div>
                    <span className="font-bold text-slate-900">
                      Tòa {addr.building} - Phòng {addr.room}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{addr.campus}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Address Form */}
            <form onSubmit={handleAddAddress} className="bg-slate-50 p-4 rounded-2xl space-y-3 text-xs border border-slate-200">
              <h4 className="font-extrabold text-slate-900">Thêm Địa Chỉ Mới:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tòa nhà (VD: KTX B3):</label>
                  <input
                    type="text"
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    placeholder="KTX B3..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số phòng (VD: 402):</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Phòng 402..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold cursor-pointer"
              >
                + Thêm Địa Chỉ Mới
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Wallet Transactions Log Modal */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Lịch Sử Giao Dịch Ví
              </h3>
              <button
                onClick={() => setTxModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
              {walletTransactions.length === 0 ? (
                <p className="p-4 text-center text-slate-400">Chưa có giao dịch ví nào</p>
              ) : (
                walletTransactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'TOPUP' || tx.type === 'REFUND'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {tx.type === 'TOPUP' || tx.type === 'REFUND' ? (
                          <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </div>
                    </div>

                    <span
                      className={`font-black text-sm ${
                        tx.type === 'TOPUP' || tx.type === 'REFUND'
                          ? 'text-emerald-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'TOPUP' || tx.type === 'REFUND' ? '+' : '-'}
                      {tx.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Dynamic Info Content Modal */}
      {infoModalContent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">{infoModalContent.title}</h3>
              <button
                onClick={() => setInfoModalContent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2">{infoModalContent.content}</div>

            <button
              onClick={() => setInfoModalContent(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

