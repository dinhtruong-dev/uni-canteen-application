import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Phone,
  Truck,
  DollarSign,
  Power,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const AdminSettingsView: React.FC = () => {
  const { showToast } = useApp();

  const [systemName, setSystemName] = useState('Uni Canteen - Hệ Thống Đặt Món Trực Tuyến');
  const [supportPhone, setSupportPhone] = useState('024 3869 1234');
  const [supportEmail, setSupportEmail] = useState('canteen.support@university.edu.vn');
  const [orderStartTime, setOrderStartTime] = useState('06:30');
  const [orderEndTime, setOrderEndTime] = useState('20:30');
  const [defaultShippingFee, setDefaultShippingFee] = useState<number>(5000);
  const [cancelTimeoutMinutes, setCancelTimeoutMinutes] = useState<number>(3);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [autoRefundWallet, setAutoRefundWallet] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu thành công cấu hình hệ thống Uni Canteen!', 'success');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Khôi phục toàn bộ thiết lập về giá trị mặc định ban đầu?')) {
      setSystemName('Uni Canteen - Hệ Thống Đặt Món Trực Tuyến');
      setSupportPhone('024 3869 1234');
      setSupportEmail('canteen.support@university.edu.vn');
      setOrderStartTime('06:30');
      setOrderEndTime('20:30');
      setDefaultShippingFee(5000);
      setCancelTimeoutMinutes(3);
      setIsMaintenanceMode(false);
      setAutoRefundWallet(true);
      showToast('Đã khôi phục thiết lập mặc định!', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            Cấu Hình Hệ Thống Uni Canteen Toàn Trường
          </h2>
          <p className="text-xs text-slate-400">
            Thiết lập thông số vận hành chung, chính sách hoàn tiền ví, biểu phí ship KTX và chế độ bảo trì hệ thống.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: General Info */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Thông Tin Nhận Diện & Hỗ Trợ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tên hệ thống hiển thị</label>
              <input
                type="text"
                required
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Hotline hỗ trợ sinh viên</label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email tiếp nhận khiếu nại</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Giờ mở đặt món</label>
                <input
                  type="text"
                  value={orderStartTime}
                  onChange={(e) => setOrderStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Giờ đóng đặt món</label>
                <input
                  type="text"
                  value={orderEndTime}
                  onChange={(e) => setOrderEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Policies & Shipping */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            Biểu Phí Giao Hàng & Chính Sách Hủy Đơn
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Phí giao tận phòng KTX mặc định (VNĐ)
              </label>
              <input
                type="number"
                step={1000}
                value={defaultShippingFee}
                onChange={(e) => setDefaultShippingFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-1">Áp dụng khi toà nhà không có cấu hình phí riêng</p>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Thời gian cho phép khách tự hủy đơn (phút)
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={cancelTimeoutMinutes}
                onChange={(e) => setCancelTimeoutMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-1">Sau thời gian này, chỉ nhân viên quầy mới có quyền hủy</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefundWallet}
                onChange={(e) => setAutoRefundWallet(e.target.checked)}
                className="rounded text-purple-600 focus:ring-0"
              />
              <span className="font-semibold">
                Tự động hoàn tiền 100% vào Ví Sinh Viên khi đơn bị hủy bởi căn tin hoặc hết món
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: System Mode */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
            <Power className="w-4 h-4 text-rose-400" />
            Chế Độ Bảo Trì Toàn Hệ Thống
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="font-bold text-slate-200 text-xs">Kích hoạt chế độ bảo trì (Maintenance)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Khi bật, sinh viên sẽ không thể tạo đơn mới. Nhân viên và Admin vẫn có thể đăng nhập tra cứu số liệu.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMaintenanceMode(!isMaintenanceMode);
                showToast(
                  `Đã ${!isMaintenanceMode ? 'BẬT' : 'TẮT'} chế độ bảo trì hệ thống!`,
                  !isMaintenanceMode ? 'warning' : 'success'
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isMaintenanceMode
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isMaintenanceMode ? 'Đang BẢO TRÌ (Bật)' : 'Đang HOẠT ĐỘNG (Tắt)'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Cấu Hình Hệ Thống</span>
          </button>
        </div>
      </form>
    </div>
  );
};
