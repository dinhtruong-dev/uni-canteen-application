import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { getSocket } from '../../services/socket.client';
import {
  kdsService,
  KDSOrder,
  KDSProduct,
  KDSSummary,
} from '../../services/api';
import {
  Volume2,
  VolumeX,
  Clock,
  Maximize,
  Minimize,
  RefreshCw,
  Utensils,
  MapPin,
  ShoppingBag,
  Flame,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  ChevronDown,
  ArrowLeft,
  Check,
  History,
  Megaphone,
  MessageSquare,
  Sparkles,
  Phone,
  Truck,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { OrderChatModal } from '../../components/OrderChatModal';

export const KitchenKDSView: React.FC = () => {
  const { navigateTo } = useApp();

  // Selected canteen
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>('cant-a');
  const [canteenName, setCanteenName] = useState<string>('Căng Tin A - Giảng Đường Trung Tâm A2');

  // Orders list from backend
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [summary, setSummary] = useState<KDSSummary>({
    newCount: 0,
    cookingCount: 0,
    readyCount: 0,
    completedCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Digital clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Audio notification
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Compact density toggle ("cho mấy cái box đơn kia bé lại")
  const [isCompact, setIsCompact] = useState<boolean>(true);

  // Quick out of stock modal
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [stockProducts, setStockProducts] = useState<KDSProduct[]>([]);
  const [stockSearchQuery, setStockSearchQuery] = useState<string>('');
  const [isLoadingStock, setIsLoadingStock] = useState<boolean>(false);

  // History of completed orders modal ("lịch sử")
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [historyOrders, setHistoryOrders] = useState<KDSOrder[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Call customer active state
  const [callingOrderId, setCallingOrderId] = useState<string | null>(null);

  // Chat with customer state
  const [chatOrder, setChatOrder] = useState<KDSOrder | null>(null);

  const prevOrderCountRef = useRef<number>(0);

  // Web Audio chime
  const playSound = (type: 'new' | 'action' | 'call') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'new') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'call') {
        // Double ding for counter calling
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(784, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio allowed upon interaction
    }
  };

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch KDS orders
  const fetchOrders = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await kdsService.getKDSOrders(selectedCanteenId);
      const orderList = Array.isArray(res) ? res : res.orders || [];

      if (prevOrderCountRef.current > 0 && orderList.length > prevOrderCountRef.current) {
        playSound('new');
      }
      prevOrderCountRef.current = orderList.length;
      setOrders(orderList);

      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.warn('Error fetching KDS orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Socket.IO realtime listener
  useEffect(() => {
    fetchOrders();

    const socket = getSocket();
    if (socket) {
      socket.emit('kds:join', { canteenId: selectedCanteenId });

      const handleNewOrder = (orderData: any) => {
        // POS Bếp chỉ nhận đơn SAU KHI nhân viên đã duyệt (CONFIRMED)
        if (orderData.status === 'CONFIRMED') {
          fetchOrders();
          playSound('new');
        }
      };

      const handleStatusUpdated = (orderData: any) => {
        // Khi nhân viên duyệt đơn (CONFIRMED): đơn lập tức xuất hiện tại Cột 1 của POS bếp
        if (orderData.status === 'CONFIRMED') {
          fetchOrders();
          playSound('new');
          return;
        }

        // Khi bếp nấu xong (READY) hoặc hoàn tất/hủy: gỡ khỏi 2 cột của POS bếp
        if (
          orderData.status === 'READY' ||
          orderData.status === 'WAITING_PICKUP' ||
          orderData.status === 'DELIVERING' ||
          orderData.status === 'COMPLETED' ||
          orderData.status === 'CANCELLED'
        ) {
          setOrders((prev) => prev.filter((o) => o.id !== orderData.id && o.orderCode !== orderData.orderCode));
          setSummary((prev) => ({
            ...prev,
            completedCount: prev.completedCount + 1,
          }));
          return;
        }

        // Cập nhật trạng thái đang nấu (PREPARING)
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderData.id || o.orderCode === orderData.orderCode
              ? { ...o, status: orderData.status }
              : o
          )
        );
      };

      const handleOrderCancelled = (data: any) => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === data.orderId || o.orderCode === data.orderCode
              ? { ...o, status: 'CANCELLED' }
              : o
          )
        );
      };

      socket.on('order:new', handleNewOrder);
      socket.on('order:status_updated', handleStatusUpdated);
      socket.on('order:cancelled', handleOrderCancelled);

      return () => {
        socket.off('order:new', handleNewOrder);
        socket.off('order:status_updated', handleStatusUpdated);
        socket.off('order:cancelled', handleOrderCancelled);
      };
    }

    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 15000);
    return () => clearInterval(pollInterval);
  }, [selectedCanteenId]);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Move order status
  const handleMoveOrder = async (
    orderId: string,
    nextStatus: 'PREPARING' | 'READY' | 'DELIVERING' | 'COMPLETED'
  ) => {
    playSound('action');

    setOrders((prev) => {
      // Khi nấu xong (READY) hoặc hoàn tất: đơn rời khỏi bếp và chuyển về nhân viên xử lý tiếp
      if (nextStatus === 'READY' || nextStatus === 'COMPLETED') {
        return prev.filter((o) => o.id !== orderId);
      }
      return prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    });

    if (nextStatus === 'READY' || nextStatus === 'COMPLETED') {
      setSummary((prev) => ({
        ...prev,
        cookingCount: Math.max(0, prev.cookingCount - 1),
        completedCount: prev.completedCount + 1,
      }));
    }

    try {
      await kdsService.updateKDSStatus(orderId, nextStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
      fetchOrders();
    }
  };

  // Call customer (Phát loa / Gửi thông báo rung điện thoại khách hàng)
  const handleCallCustomer = async (e: React.MouseEvent, order: KDSOrder) => {
    e.stopPropagation();
    setCallingOrderId(order.id);
    playSound('call');
    try {
      await kdsService.callCustomer(order.id);
    } catch (err) {
      console.error('Call customer failed:', err);
    } finally {
      setTimeout(() => {
        setCallingOrderId(null);
      }, 2500);
    }
  };

  // Load completed orders history
  const handleOpenHistoryModal = async () => {
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const hist = await kdsService.getKDSHistory(selectedCanteenId);
      setHistoryOrders(hist);
    } catch (err) {
      console.error('Failed to load history orders:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Stock modal handlers
  const handleOpenStockModal = async () => {
    setIsStockModalOpen(true);
    setIsLoadingStock(true);
    try {
      const prods = await kdsService.getProducts(selectedCanteenId);
      setStockProducts(prods);
    } catch (err) {
      console.error('Failed to load products for stock modal:', err);
    } finally {
      setIsLoadingStock(false);
    }
  };

  const handleToggleProductStock = async (product: KDSProduct) => {
    playSound('action');
    const newStatus = !product.isAvailable;
    setStockProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isAvailable: newStatus } : p))
    );
    try {
      await kdsService.toggleProductAvailability(product.id, newStatus);
    } catch (err) {
      console.error('Failed to toggle product stock:', err);
      setStockProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isAvailable: !newStatus } : p))
      );
    }
  };

  const filteredStockProducts = useMemo(() => {
    const q = stockSearchQuery.trim().toLowerCase();
    if (!q) return stockProducts;
    return stockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
  }, [stockProducts, stockSearchQuery]);

  const filteredHistoryOrders = useMemo(() => {
    const q = historySearchQuery.trim().toLowerCase();
    if (!q) return historyOrders;
    return historyOrders.filter(
      (o) =>
        o.orderCode.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        (o.userPhone && o.userPhone.includes(q)) ||
        o.orderDetails.some((d) => d.productName.toLowerCase().includes(q))
    );
  }, [historyOrders, historySearchQuery]);

  // Group orders into 2 kitchen cooking columns
  // POS Bếp chỉ nhận đơn SAU KHI NHÂN VIÊN ĐÃ DUYỆT ('CONFIRMED')
  const readyToCookOrders = useMemo(
    () => orders.filter((o) => o.status === 'CONFIRMED'),
    [orders]
  );
  const cookingOrders = useMemo(() => orders.filter((o) => o.status === 'PREPARING'), [orders]);

  // Helper formatting for order type badge (compact)
  const renderOrderTypeBadge = (order: KDSOrder) => {
    if (order.orderType === 'DINE_IN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs">
          <Utensils className="w-3 h-3" />
          <span>Bàn {order.tableNumber || 'Ăn tại chỗ'}</span>
        </span>
      );
    }
    if (order.orderType === 'DELIVERY') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-700 text-white shadow-xs">
          <MapPin className="w-3 h-3" />
          <span>Giao KTX {order.deliveryAddressText ? `: ${order.deliveryAddressText}` : ''}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-600 text-white shadow-xs">
        <ShoppingBag className="w-3 h-3" />
        <span>Mang đi (Quầy)</span>
      </span>
    );
  };

  // Elapsed time display
  const getOrderTimeDisplay = (order: KDSOrder) => {
    const d = new Date(order.createdAt);
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const elapsed = order.elapsedMinutes ?? Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
    const isUrgent = elapsed >= 15;

    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-mono text-slate-400 font-semibold">{timeStr}</span>
        <span
          className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
            isUrgent ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {elapsed}p
        </span>
      </div>
    );
  };

  const canteenOptions = [
    { id: 'cant-a', name: 'Căng Tin A - Giảng Đường Trung Tâm A2' },
    { id: 'cant-b', name: 'Căng Tin B - Ký Túc Xá Sinh Viên A1' },
    { id: 'cant-c', name: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4' },
    { id: 'cant-d', name: 'Căng Tin D - Khu Thể Thao & Sân Bóng' },
    { id: 'ALL', name: 'Tất cả căng tin (Tổng hợp)' },
  ];

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* =========================================================================
          1. HEADER CHÍNH (TOP BAR)
          - Căn tin, Đồng hồ to, Bật/Tắt âm báo, Báo hết món, Làm mới, Toàn màn hình
         ========================================================================= */}
      <header className="h-14 px-3 sm:px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        {/* Left: Tên Căn tin & Quay lại */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigateTo('staff-orders')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold"
            title="Về cổng nhân viên"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quản lý</span>
          </button>

          <div className="relative">
            <select
              value={selectedCanteenId}
              onChange={(e) => {
                const selected = canteenOptions.find((c) => c.id === e.target.value);
                setSelectedCanteenId(e.target.value);
                if (selected) setCanteenName(selected.name);
              }}
              className="appearance-none bg-slate-800 hover:bg-slate-750 text-white font-black text-xs sm:text-sm pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-[#22c3d3] cursor-pointer max-w-[200px] sm:max-w-xs truncate"
            >
              {canteenOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                  {opt.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            MÀN HÌNH BẾP LIVE
          </span>
        </div>

        {/* Center: Đồng hồ thời gian thực chữ to */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider drop-shadow-sm tabular-nums">
            {currentTimeStr || '12:00:00'}
          </span>
        </div>

        {/* Right: Điều khiển & Cài đặt */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle Thẻ bé lại (Compact Mode) */}
          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all border ${
              isCompact
                ? 'bg-[#22c3d3]/20 text-[#22c3d3] border-[#22c3d3]/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
            title="Bật/Tắt chế độ thẻ nhỏ gọn để nhìn được nhiều đơn cùng lúc"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isCompact ? 'Thẻ: Nhỏ gọn' : 'Thẻ: Thường'}</span>
          </button>

          {/* Âm báo */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all border ${
              soundEnabled
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/50'
            }`}
            title="Bật/Tắt âm thanh chuông báo"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Chuông BẬT</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Chuông TẮT</span>
              </>
            )}
          </button>

          {/* Báo Hết Món Nhanh */}
          <button
            type="button"
            onClick={handleOpenStockModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all shadow-xs border border-rose-400"
            title="Khóa/mở món ăn khi nguyên liệu hết"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Báo Hết Món</span>
          </button>

          {/* Làm mới */}
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors border border-slate-700"
            title="Tải lại danh sách đơn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors border border-slate-700"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. THANH THÔNG TIN TỔNG HỢP TRÊN ĐẦU (METRIC SUMMARY BAR):
          - Chuẩn bị nấu (Đỏ)
          - Đang nấu (Vàng)
          - Lịch sử đã nấu xong hôm nay (Xanh cyan / Modal)
         ========================================================================= */}
      <section className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 shadow-sm scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3 flex-nowrap min-w-max">
          {/* Card 1: Chờ bắt đầu nấu */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-semibold">1. Chờ bắt đầu nấu (Đã duyệt):</span>
            <span className="font-mono text-base font-black text-rose-200">
              {readyToCookOrders.length}
            </span>
          </div>

          {/* Card 2: Đang nấu */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold">2. Đang nấu trong bếp:</span>
            <span className="font-mono text-base font-black text-amber-200">
              {cookingOrders.length}
            </span>
          </div>
        </div>

        {/* Right side of summary bar: Nút xem Lịch sử đơn đã nấu xong */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenHistoryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22c3d3]/15 hover:bg-[#22c3d3]/25 text-[#22c3d3] border border-[#22c3d3]/30 font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
            title="Xem danh sách các đơn đã hoàn thành hôm nay"
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử đã nấu xong:</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#22c3d3] text-slate-950 font-black font-mono">
              {summary.completedCount || 0}
            </span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          3. NỘI DUNG CHÍNH (2 CỘT KANBAN BẾP - RỘNG RÃI, TRỰC QUAN):
          - Cột 1: BẮT ĐẦU NẤU (Chỉ nhận đơn nhân viên đã duyệt) -> Bấm 'Bắt đầu nấu' -> Sang Cột 2
          - Cột 2: NẤU XONG (Đang nấu) -> Bấm 'Nấu xong' -> Hoàn tất nấu, đẩy về nhân viên
         ========================================================================= */}
      <main className="flex-1 grid grid-cols-2 gap-3 p-3 overflow-hidden bg-slate-950">
        {/* =====================================================================
            CỘT 1: 'BẮT ĐẦU NẤU' (Đã duyệt)
           ===================================================================== */}
        <section className="flex flex-col h-full rounded-2xl bg-rose-50/95 border-2 border-rose-300 overflow-hidden shadow-lg">
          {/* Header Cột 1 */}
          <div className="h-10 px-3 bg-rose-600 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <h2 className="text-sm font-black uppercase tracking-wider">
                1. Bắt Đầu Nấu ({readyToCookOrders.length})
              </h2>
            </div>
            <span className="text-[11px] font-bold text-rose-100">Đã duyệt • Bấm bắt đầu nấu</span>
          </div>

          {/* Danh sách thẻ Cột 1 */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-rose-800 font-bold animate-pulse text-sm">
                Đang tải đơn hàng...
              </div>
            ) : readyToCookOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-rose-900/60 p-4 text-center">
                <CheckCircle2 className="w-8 h-8 mb-1.5 text-rose-400 stroke-[1.5]" />
                <p className="font-bold text-sm">Chưa có đơn chờ nấu</p>
                <p className="text-[11px] text-rose-800/80">
                  Khi nhân viên duyệt đơn mới, đơn sẽ tự động chuyển sang đây
                </p>
              </div>
            ) : (
              readyToCookOrders.map((order) => (
                <article
                  key={order.id}
                  className={`bg-white rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between transition-all ${
                    isCompact ? 'p-2' : 'p-3'
                  }`}
                >
                  {/* Dòng 1: Mã đơn, Loại nhận, Thời gian */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                        #{order.orderCode}
                      </span>
                      {renderOrderTypeBadge(order)}
                    </div>
                    {getOrderTimeDisplay(order)}
                  </div>

                  {/* Dòng 2: Tên khách hàng & Nút nhắn tin */}
                  <div className="pt-1 pb-1 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 truncate max-w-[130px]">
                      {order.userName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChatOrder(order)}
                      className="flex items-center gap-1 text-[11px] text-[#0891b2] font-semibold hover:underline cursor-pointer"
                      title="Nhắn tin với khách"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </button>
                  </div>

                  {/* Danh sách món ăn - Nhỏ gọn, hiển thị rõ số lượng */}
                  <div className="py-1 space-y-1">
                    {order.orderDetails.map((item) => (
                      <div key={item.id} className="text-slate-900 text-xs">
                        <div className="flex items-baseline gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 text-white font-mono text-[11px] font-black shrink-0">
                            {item.quantity}x
                          </span>
                          <span className="font-extrabold text-xs text-slate-900 leading-snug">
                            {item.productName}
                          </span>
                        </div>

                        {/* Topping */}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="pl-6 pt-0.5 space-y-0.5">
                            {item.selectedOptions.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="text-[10px] font-semibold text-rose-700 flex items-center gap-1"
                              >
                                <span className="text-rose-400 font-mono">↳</span>
                                <span>{opt.itemName}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ghi chú món */}
                        {item.notes && (
                          <div className="pl-6 text-[10px] font-medium text-amber-800 italic">
                            Ghi chú: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Ghi chú chung */}
                    {order.notes && (
                      <div className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                        ⚠️ Khách dặn: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Nút hành động Cột 1: Bắt đầu nấu */}
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(order.id, 'PREPARING')}
                    className="w-full mt-1.5 py-1.5 px-2.5 rounded-lg font-bold text-xs uppercase bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>BẮT ĐẦU NẤU</span>
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        {/* =====================================================================
            CỘT 2: 'ĐANG NẤU'
           ===================================================================== */}
        <section className="flex flex-col h-full rounded-2xl bg-amber-50/95 border-2 border-amber-300 overflow-hidden shadow-lg">
          {/* Header Cột 2 */}
          <div className="h-10 px-3 bg-amber-500 text-slate-950 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-slate-950" />
              <h2 className="text-sm font-black uppercase tracking-wider">
                2. Nấu Xong ({cookingOrders.length})
              </h2>
            </div>
            <span className="text-[11px] font-bold text-amber-950">Đang nấu • Nấu xong đẩy về nhân viên</span>
          </div>

          {/* Danh sách thẻ Cột 2 */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {cookingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-amber-900/60 p-4 text-center">
                <Flame className="w-8 h-8 mb-1.5 text-amber-400 stroke-[1.5]" />
                <p className="font-bold text-sm">Bếp đang trống</p>
                <p className="text-[11px] text-amber-800/80">
                  Bấm 'Bắt đầu nấu' ở Cột 1 để nhận đơn vào nấu
                </p>
              </div>
            ) : (
              cookingOrders.map((order) => (
                <article
                  key={order.id}
                  className={`bg-white rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between transition-all ${
                    isCompact ? 'p-2' : 'p-3'
                  }`}
                >
                  {/* Dòng 1: Mã đơn, Loại nhận, Thời gian */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                        #{order.orderCode}
                      </span>
                      {renderOrderTypeBadge(order)}
                    </div>
                    {getOrderTimeDisplay(order)}
                  </div>

                  {/* Dòng 2: Tên khách hàng & Chat */}
                  <div className="pt-1 pb-1 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 truncate max-w-[130px]">
                      {order.userName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChatOrder(order)}
                      className="flex items-center gap-1 text-[11px] text-[#0891b2] font-semibold hover:underline cursor-pointer"
                      title="Nhắn tin với khách"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </button>
                  </div>

                  {/* Danh sách món ăn */}
                  <div className="py-1 space-y-1">
                    {order.orderDetails.map((item) => (
                      <div key={item.id} className="text-slate-900 text-xs">
                        <div className="flex items-baseline gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-mono text-[11px] font-black shrink-0">
                            {item.quantity}x
                          </span>
                          <span className="font-extrabold text-xs text-slate-900 leading-snug">
                            {item.productName}
                          </span>
                        </div>

                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="pl-6 pt-0.5 space-y-0.5">
                            {item.selectedOptions.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="text-[10px] font-semibold text-amber-800 flex items-center gap-1"
                              >
                                <span className="text-amber-600 font-mono">↳</span>
                                <span>{opt.itemName}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <div className="pl-6 text-[10px] font-medium text-amber-800 italic">
                            Ghi chú: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}

                    {order.notes && (
                      <div className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                        ⚠️ Khách dặn: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Nút hành động Cột 2: Nấu xong (Đẩy về nhân viên) */}
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(order.id, 'READY')}
                    className="w-full mt-1.5 py-2 px-2.5 rounded-lg font-black text-xs uppercase bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>NẤU XONG (ĐẨY VỀ NHÂN VIÊN)</span>
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {/* =========================================================================
          4. MODAL: LỊCH SỬ ĐƠN HÀNG ĐÃ HOÀN THÀNH HÔM NAY
         ========================================================================= */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 px-6 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <History className="w-6 h-6 text-[#22c3d3]" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Lịch Sử Đơn Hàng Đã Xong Hôm Nay
                  </h3>
                  <p className="text-xs text-slate-400">
                    {canteenName} • Tổng cộng {historyOrders.length} đơn hoàn thành
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn (#ORD), tên khách hàng, tên món..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-xl border border-slate-700 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#22c3d3]"
                />
              </div>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-400 font-bold animate-pulse text-sm">
                  Đang tải lịch sử đơn hàng từ máy chủ...
                </div>
              ) : filteredHistoryOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-bold text-sm">
                  Không tìm thấy đơn hàng hoàn thành phù hợp
                </div>
              ) : (
                filteredHistoryOrders.map((order) => {
                  const d = new Date(order.createdAt);
                  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                  return (
                    <div
                      key={order.id}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-[#22c3d3]">
                            #{order.orderCode}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">{timeStr}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Đã hoàn thành
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          Khách: <strong className="text-white">{order.userName}</strong>
                          {order.userPhone ? ` • ${order.userPhone}` : ''}
                        </p>
                        <div className="text-xs text-slate-400">
                          {order.orderDetails
                            .map((it) => `${it.quantity}x ${it.productName}`)
                            .join(', ')}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-white">
                          {(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')}đ
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {order.orderType === 'DINE_IN'
                            ? `Bàn ${order.tableNumber || ''}`
                            : order.orderType === 'DELIVERY'
                            ? 'Giao KTX'
                            : 'Mang đi'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-6 bg-slate-850 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                Hiển thị tối đa 50 đơn hoàn thành gần nhất
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MODAL: BÁO HẾT MÓN NHANH
         ========================================================================= */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 px-6 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">Báo Hết Món Nhanh</h3>
                  <p className="text-xs text-slate-400">
                    {canteenName} • Chạm để khóa/mở món tức thì cho sinh viên
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm nhanh tên món ăn cần báo hết..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-xl border border-slate-700 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#22c3d3]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingStock ? (
                <div className="py-12 text-center text-slate-400 font-bold animate-pulse text-sm">
                  Đang tải danh sách món ăn...
                </div>
              ) : filteredStockProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-bold text-sm">
                  Không tìm thấy món ăn phù hợp
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredStockProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleToggleProductStock(prod)}
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all active:scale-95 ${
                        prod.isAvailable
                          ? 'bg-slate-800/80 border-slate-700 hover:border-emerald-500/50'
                          : 'bg-rose-950/40 border-rose-600/70 hover:border-rose-500'
                      }`}
                    >
                      <div className="pr-2 truncate">
                        <h4
                          className={`font-black text-xs sm:text-sm truncate ${
                            prod.isAvailable ? 'text-white' : 'text-rose-300 line-through'
                          }`}
                        >
                          {prod.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          {prod.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`px-2.5 py-1 rounded-lg font-black text-xs shrink-0 transition-all ${
                          prod.isAvailable
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-rose-600 text-white hover:bg-rose-500'
                        }`}
                      >
                        {prod.isAvailable ? 'CÒN MÓN' : 'ĐÃ HẾT'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 px-6 bg-slate-850 border-t border-slate-800 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: LIVE CHAT VỚI KHÁCH HÀNG (REALTIME SOCKET)
         ========================================================================= */}
      {chatOrder && (
        <OrderChatModal
          isOpen={Boolean(chatOrder)}
          onClose={() => setChatOrder(null)}
          orderId={chatOrder.id}
          orderCode={chatOrder.orderCode}
          currentUserRole="STAFF"
          currentUserName="Nhân viên Căn tin"
          currentUserId="kds-staff"
          targetUserName={chatOrder.userName || 'Khách hàng'}
          canteenName={canteenName}
        />
      )}
    </div>
  );
};
