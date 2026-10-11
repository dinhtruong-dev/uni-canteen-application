import React, { useState } from 'react';
import {
  Bell,
  Send,
  Plus,
  Trash2,
  Users,
  Store,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Notification } from '../../types';
import { adminService } from '../../services/api';

export const AdminNotificationsView: React.FC = () => {
  const { notifications, showToast } = useApp();

  const [localNotifs, setLocalNotifs] = useState<Notification[]>(notifications);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formTarget, setFormTarget] = useState<'ALL' | 'STUDENTS' | 'STAFF'>('ALL');
  const [formType, setFormType] = useState<'SYSTEM' | 'PROMO' | 'WALLET'>('SYSTEM');
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!', 'error');
      return;
    }

    try {
      setIsSending(true);
      const res = await adminService.pushNotification({
        target: formTarget,
        title: formTitle.trim(),
        message: formMessage.trim(),
        type: formType,
      });

      if (res.success) {
        const notifData = res.data;
        const newNotif: Notification = {
          id: notifData.id,
          title: notifData.title,
          message: notifData.message,
          timestamp: 'Vừa xong',
          dateDisplay: 'Hôm nay',
          read: false,
          type: formType,
        };
        setLocalNotifs((prev) => [newNotif, ...prev]);
        setFormTitle('');
        setFormMessage('');

        showToast(
          `Đã lưu CSDL & phát Socket.IO thông báo "${newNotif.title}" tới ${formTarget === 'ALL'
            ? 'toàn bộ người dùng'
            : formTarget === 'STUDENTS'
              ? 'tất cả sinh viên'
              : 'đội ngũ nhân viên'
          }!`,
          'success'
        );
      }
    } catch (err: any) {
      showToast('Lỗi khi gửi thông báo: ' + (err.message || 'Không thể gửi'), 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = (id: string) => {
    setLocalNotifs((prev) => prev.filter((n) => n.id !== id));
    showToast('Đã xóa thông báo khỏi danh sách lưu trữ!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-400" />
            Phát Thông Báo Toàn Trường & Vận Hành
          </h2>
          <p className="text-xs text-slate-400">
            Gửi thông báo tức thì đến ứng dụng di động của sinh viên hoặc màn hình làm việc của nhân viên quầy căn tin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Compose Notification */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 h-fit shadow-md">
          <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-400" />
            Soạn Thông Báo Mới
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Đối tượng nhận tin</label>
              <select
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden font-medium"
              >
                <option value="ALL">Toàn Trường (Sinh viên & Nhân viên)</option>
                <option value="STUDENTS">Chỉ Sinh viên (Customer Mobile)</option>
                <option value="STAFF">Chỉ Nhân viên Căn tin (Staff)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Loại thông báo</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
              >
                <option value="SYSTEM">Hệ thống & Vận hành (SYSTEM)</option>
                <option value="PROMO">Khuyến mãi & Voucher (PROMO)</option>
                <option value="WALLET">Ví sinh viên & Hoàn tiền (WALLET)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tiêu đề thông báo *</label>
              <input
                type="text"
                required
                placeholder="VD: Căn tin A2 mở thêm quầy phục vụ trưa"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nội dung chi tiết *</label>
              <textarea
                rows={4}
                required
                placeholder="Nhập nội dung thông điệp gửi đến người dùng..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-hidden resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Phát Thông Báo Ngay</span>
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Lịch Sử Thông Báo Đã Phát ({localNotifs.length})
            </h3>
            <span className="text-xs text-slate-400">Được đồng bộ thời gian thực</span>
          </div>

          <div className="space-y-3">
            {localNotifs.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${n.type === 'PROMO'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : n.type === 'WALLET'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                    >
                      {n.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {n.dateDisplay || n.timestamp}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                </div>

                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer shrink-0"
                  title="Xóa thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
