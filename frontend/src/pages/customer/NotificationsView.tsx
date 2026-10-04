import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCheck,
  ArrowLeft,
  Ticket,
  ShoppingBag,
  Wallet,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

type NotifTab = 'ALL' | 'PROMO' | 'UPDATES';

export const NotificationsView: React.FC = () => {
  const { notifications, unreadNotifCount, markNotifAsRead, markAllNotifsAsRead, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<NotifTab>('ALL');

  // Filtered lists
  const promoNotifs = useMemo(() => {
    return notifications.filter((n) => n.type === 'PROMO');
  }, [notifications]);

  const updateNotifs = useMemo(() => {
    return notifications.filter((n) => n.type === 'ORDER' || n.type === 'WALLET' || n.type === 'SYSTEM');
  }, [notifications]);

  const displayNotifs = useMemo(() => {
    if (activeTab === 'PROMO') return promoNotifs;
    if (activeTab === 'UPDATES') return updateNotifs;
    return notifications;
  }, [activeTab, notifications, promoNotifs, updateNotifs]);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'PROMO':
        return <Ticket className="w-5 h-5 text-[#00a88f]" />;
      case 'ORDER':
        return <ShoppingBag className="w-5 h-5 text-[#008f7a]" />;
      case 'WALLET':
        return <Wallet className="w-5 h-5 text-[#008f7a]" />;
      case 'SYSTEM':
      default:
        return <Sparkles className="w-5 h-5 text-[#00a88f]" />;
    }
  };

  return (
    <div className="-mt-1 sm:-mt-2 max-w-2xl mx-auto space-y-3 pb-16 px-1 sm:px-0">
      {/* Sticky Header Container (Title + Category Tabs stay fixed on scroll) */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-slate-200/60 transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('home')}
              className="p-1 rounded-full hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Thông báo
            </h1>
          </div>

          {/* Mark All Read Button */}
          <button
            onClick={markAllNotifsAsRead}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              unreadNotifCount > 0
                ? 'text-cyan-600 hover:bg-cyan-50'
                : 'text-slate-300 hover:bg-slate-100'
            }`}
            title="Đánh dấu tất cả đã đọc"
            aria-label="Đánh dấu tất cả đã đọc"
          >
            <CheckCheck className="w-5 h-5 text-[#00bd9d]" />
          </button>
        </div>

        {/* Pill Filter Tabs (Tất cả, Ưu đãi, Cập nhật) */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#2f323a] text-white shadow-xs'
                : 'bg-[#f3f4f6] text-slate-700 hover:bg-slate-200 border border-slate-200/60'
            }`}
          >
            Tất cả
          </button>

          <button
            onClick={() => setActiveTab('PROMO')}
            className={`px-3.5 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'PROMO'
                ? 'bg-[#2f323a] text-white shadow-xs'
                : 'bg-[#f3f4f6] text-slate-700 hover:bg-slate-200 border border-slate-200/60'
            }`}
          >
            Ưu đãi
          </button>

          <button
            onClick={() => setActiveTab('UPDATES')}
            className={`px-3.5 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'UPDATES'
                ? 'bg-[#2f323a] text-white shadow-xs'
                : 'bg-[#f3f4f6] text-slate-700 hover:bg-slate-200 border border-slate-200/60'
            }`}
          >
            Cập nhật
          </button>
        </div>
      </div>

      {/* Notifications List Stream */}
      <div className="divide-y divide-slate-100 pt-1">
        {displayNotifs.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#e8f7f2] text-[#008f7a] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Không có thông báo</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {activeTab === 'PROMO'
                ? 'Chưa có thông báo ưu đãi nào.'
                : activeTab === 'UPDATES'
                ? 'Chưa có cập nhật mới nào.'
                : 'Danh sách thông báo trống.'}
            </p>
          </div>
        ) : (
          displayNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotifAsRead(item.id);
                if (item.linkOrderId) {
                  navigateTo('order-detail', { orderId: item.linkOrderId });
                }
              }}
              className="py-3.5 sm:py-4 px-1 flex items-start gap-3 sm:gap-3.5 transition-colors cursor-pointer group"
            >
              {/* Left Icon Container */}
              <div className="w-10 h-10 rounded-full bg-[#e8f7f2] flex items-center justify-center shrink-0 mt-0.5">
                {getNotifIcon(item.type)}
              </div>

              {/* Main Notification Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Title and Date Row */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug flex-1 group-hover:text-[#008f7a] transition-colors">
                    {item.iconEmoji && <span className="mr-1">{item.iconEmoji}</span>}
                    {item.title}
                  </h2>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.dateDisplay || item.timestamp}
                    </span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#00bd9d] shrink-0" />
                    )}
                  </div>
                </div>

                {/* Description Text */}
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.message}
                </p>

                {/* Optional Action Pill Button */}
                {(item.actionText || item.type === 'PROMO') && (
                  <div className="pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotifAsRead(item.id);
                        if (item.linkOrderId) {
                          navigateTo('order-detail', { orderId: item.linkOrderId });
                        } else {
                          navigateTo('menu');
                        }
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-lg bg-[#e6f7f3] text-[#008f7a] text-xs font-bold hover:bg-[#d5f3eb] transition-all cursor-pointer"
                    >
                      {item.actionText || 'Khám phá ngay!'}
                    </button>
                  </div>
                )}

                {/* Optional Full Width Promotional Image Banner */}
                {item.bannerImage && (
                  <div className="pt-1">
                    <div className="rounded-xl overflow-hidden max-w-md">
                      <img
                        src={item.bannerImage}
                        alt={item.title}
                        className="w-full h-28 sm:h-36 object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
