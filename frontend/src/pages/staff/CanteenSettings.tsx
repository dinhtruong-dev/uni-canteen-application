import React, { useState, useEffect } from 'react';
import {
  Store,
  Clock,
  Phone,
  MapPin,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Tag,
  Truck,
  Image as ImageIcon,
} from 'lucide-react';
import { staffCanteenService } from '../../services/api/client';
import { useApp } from '../../store/AppContext';
import { StaffCanteenInfo } from '../../types/staff';

export const StaffCanteenSettingsView: React.FC = () => {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canteen, setCanteen] = useState<StaffCanteenInfo | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    location: '',
    openingHours: '',
    phone: '',
    isOpen: true,
    voucher: '',
    freeship: '',
  });

  const fetchCanteenInfo = async () => {
    try {
      setLoading(true);
      const res = await staffCanteenService.getCanteenInfo('cant-a');
      if (res.success && res.data) {
        setCanteen(res.data);
        setFormData({
          displayName: res.data.displayName || res.data.name || '',
          location: res.data.location || '',
          openingHours: res.data.openingHours || '06:30 - 21:00',
          phone: res.data.phone || '',
          isOpen: Boolean(res.data.isOpen),
          voucher: res.data.voucher || '',
          freeship: res.data.freeship || '',
        });
      }
    } catch (err: any) {
      console.error('Lỗi tải thông tin căn tin:', err);
      showToast('Không thể tải thông tin căn tin', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanteenInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canteen) return;

    try {
      setSaving(true);
      const res = await staffCanteenService.updateCanteenInfo(canteen.id, formData);
      if (res.success) {
        showToast('Đã lưu thông tin cấu hình căn tin thành công!', 'success');
        fetchCanteenInfo();
      } else {
        showToast(res.message || 'Lỗi khi lưu thông tin', 'error');
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật căn tin:', err);
      showToast(err?.message || 'Lỗi khi cập nhật căn tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 max-w-4xl mx-auto">
        <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Đang tải thông tin căn tin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              CẤU HÌNH CĂN TIN
            </span>
            <span className="text-xs text-slate-400">Mã: {canteen?.code || 'CANT-A'}</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 mt-1">Thông Tin & Trạng Thái Hoạt Động</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bật tắt nhận đơn, giờ phục vụ và thông tin liên hệ hiển thị cho khách hàng.
          </p>
        </div>

        <button
          onClick={fetchCanteenInfo}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer self-start md:self-auto"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {/* Toggle Trạng Thái Đóng / Mở Cửa */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${formData.isOpen
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
            >
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">
                Trạng thái hoạt động: {formData.isOpen ? 'Đang mở cửa' : 'Tạm đóng cửa'}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {formData.isOpen
                  ? 'Căn tin đang mở nhận đơn đặt món từ sinh viên'
                  : 'Đang tạm dừng nhận đơn (hết ca hoặc bảo trì quầy)'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isOpen}
              onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Thông tin Căn tin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-orange-400" />
              <span>Tên hiển thị quầy căn tin</span>
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Khung giờ mở cửa phục vụ</span>
            </label>
            <input
              type="text"
              required
              placeholder="06:30 - 21:00"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Vị trí / Địa chỉ trong trường</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Hotline / Số điện thoại quầy</span>
            </label>
            <input
              type="text"
              placeholder="024 3869 1234"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-orange-400" />
              <span>Banner Voucher nổi bật</span>
            </label>
            <input
              type="text"
              placeholder="Voucher 15K"
              value={formData.voucher}
              onChange={(e) => setFormData({ ...formData, voucher: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-orange-400" />
              <span>Chính sách Freeship nội khu</span>
            </label>
            <input
              type="text"
              placeholder="Freeship KTX"
              value={formData.freeship}
              onChange={(e) => setFormData({ ...formData, freeship: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Nút lưu */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Đang lưu CSDL...' : 'Lưu Thay Đổi Cấu Hình'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
