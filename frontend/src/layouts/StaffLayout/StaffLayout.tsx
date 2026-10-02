import React, { useState, useEffect, useRef } from 'react';
import { StaffSidebar } from './StaffSidebar';
import { StaffTopbar } from './StaffTopbar';
import { PickupVerificationModal } from '../../components/staff/PickupVerificationModal';
import { staffService } from '../../services/api';
import { getSocket } from '../../services/socket.client';
import { useApp } from '../../store/AppContext';

interface StaffLayoutProps {
  initialTab?: string;
  children?: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({
  initialTab = 'dashboard',
  children,
  activeTab: propActiveTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState(propActiveTab || initialTab);
  const activeTab = propActiveTab || internalTab;

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { currentUser, navigateTo } = useApp();

  // Handle Tab Switch
  const handleSelectTab = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
      // Map to view route
      navigateTo(`staff-${tab}`);
    }
  };

  // Play audio chime synthesized with Web Audio API (no external file dependency needed)
  const playNewOrderChime = () => {
    if (!isSoundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Chime sequence: Note 1 (E5), Note 2 (G#5), Note 3 (B5)
      const freqs = [659.25, 830.61, 987.77];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.3, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  };

  // Load initial pending count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await staffService.getOrders({ status: 'PENDING', limit: 1 });
        if (res.success) {
          setPendingOrdersCount(res.total);
        }
      } catch (err) {
        // Silently catch
      }
    };
    fetchPendingCount();
  }, [activeTab]);

  // Listen to real-time events via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewOrder = (data: any) => {
      setPendingOrdersCount((prev) => prev + 1);
      setUnreadNotifsCount((prev) => prev + 1);
      playNewOrderChime();
    };

    const handleStatusUpdated = (orderData: any) => {
      if (orderData.status === 'READY') {
        // Kitchen just finished cooking! Alert staff on duty to serve/deliver
        playNewOrderChime();
        setUnreadNotifsCount((prev) => prev + 1);
      }
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:status_updated', handleStatusUpdated);
    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status_updated', handleStatusUpdated);
    };
  }, [isSoundEnabled]);

  // Tab Titles dictionary
  const tabTitles: Record<string, string> = {
    dashboard: 'Tổng quan Vận hành Căn tin',
    orders: 'Quản lý Đơn hàng',
    foods: 'Quản lý Món ăn & Thực đơn',
    categories: 'Quản lý Danh mục món',
    tables: 'Quản lý Bàn ăn & Mã QR',
    'pickup-slots': 'Quản lý Khung giờ nhận (Pickup)',
    promotions: 'Quản lý Mã giảm giá & Ưu đãi',
    reviews: 'Đánh giá & Phản hồi Khách hàng',
    notifications: 'Thông báo Bếp & Vận hành',
    statistics: 'Báo cáo & Phân tích Doanh thu',
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Sidebar */}
      <StaffSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        pendingOrdersCount={pendingOrdersCount}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-950">
        {/* Topbar */}
        <StaffTopbar
          activeTabTitle={tabTitles[activeTab] || 'Quản trị Căn tin'}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
          onOpenPickupModal={() => setIsPickupModalOpen(true)}
          onSelectTab={handleSelectTab}
          unreadNotifsCount={unreadNotifsCount}
          canteenName="Căng Tin A - Giảng Đường Trung Tâm A2"
        />

        {/* Dynamic Content View with independent smooth scroll */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950 text-slate-100 scrollbar-thin scrollbar-thumb-slate-800">
          {children}
        </main>
      </div>

      {/* Global Pickup Verification Modal */}
      <PickupVerificationModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        canteenId="cant-a"
        onSuccess={() => {
          // Play confirmation chime
          playNewOrderChime();
        }}
      />
    </div>
  );
};
