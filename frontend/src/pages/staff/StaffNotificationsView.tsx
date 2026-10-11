import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Clock,
  Sparkles,
  Trash2,
  Eye,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const StaffNotificationsView: React.FC = () => {
  const { navigateTo } = useApp();
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Đơn hàng mới vào bếp',
      message: 'Đơn #ORD-8295 (Mang đi - Khung 11:45) đã thanh toán qua MoMo và chuyển vào bếp.',
      time: '2 phút trước',
      type: 'ORDER',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Cảnh báo công suất khung giờ',
      message: 'Khung giờ 11:30 - 11:45 đã đạt 18/20 đơn (90% công suất). Hệ thống sắp tự động khóa.',
      time: '12 phút trước',
      type: 'CAPACITY',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Món ăn đã được cập nhật',
      message: 'Món "Trà Sữa Thái Xanh" vừa được mở bán lại sau khi nhập bổ sung nguyên liệu.',
      time: '35 phút trước',
      type: 'MENU',
      isRead: true,
    },
    {
      id: 'notif-4',
      title: 'Đơn hàng hoàn tất giao KTX',
      message: 'Đơn #ORD-8288 giao tới Phòng 402 KTX A1 đã được khách ký nhận thành công.',
      time: '1 giờ trước',
      type: 'DELIVERY',
      isRead: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              TRUNG TÂM VẬN HÀNH
            </span>
            <span className="text-xs text-slate-400">
              {notifications.filter((n) => !n.isRead).length} thông báo chưa đọc
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">Thông Báo Bếp & Vận Hành</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Đánh dấu đã đọc tất cả
          </button>
          <button
            onClick={handleClearAll}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Xóa tất cả thông báo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
            Không có thông báo mới nào
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-3xl border transition-all flex items-start gap-4 ${n.isRead
                ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                : 'bg-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.type === 'ORDER'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : n.type === 'CAPACITY'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  }`}
              >
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
