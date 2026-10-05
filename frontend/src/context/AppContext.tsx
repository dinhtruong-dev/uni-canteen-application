import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Canteen,
  FoodItem,
  CartItem,
  Order,
  OrderType,
  OrderStatus,
  TableInfo,
  DeliveryAddress,
  Promotion,
  type Notification,
  WalletTransaction,
  FoodTopping,
  FoodSize,
  PaymentMethod,
  BannerItem,
  FlashSaleItem,
  Category,
} from '../types';
import { initSocket, getSocket, disconnectSocket } from '../services/socket.client';
import {
  menuService,
  marketingService,
  tableService,
  orderService,
  authService,
  canteenApiService,
  userService,
  cartApiService,
} from '../services/api';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Auth & User
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password?: string, redirectPath?: string) => Promise<boolean> | boolean;
  logout: () => void;
  register: (userData: Partial<User> & { password?: string }, redirectPath?: string) => Promise<boolean> | boolean;
  sendOtp: (params: { recipient: string; channel: 'SMS' | 'EMAIL'; type: 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | '2FA_LOGIN' }) => Promise<any>;
  verifyOtp: (params: { recipient: string; code: string; type: 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | '2FA_LOGIN' }) => Promise<boolean>;
  registerWithOtp: (userData: Partial<User> & { password?: string; otpCode: string; channel: 'SMS' | 'EMAIL' }, redirectPath?: string) => Promise<boolean>;
  loginWithOtp: (recipient: string, otpCode: string, redirectPath?: string) => Promise<boolean>;
  initiate2faLogin: (credentials: { email: string; password: string; preferredChannel?: 'SMS' | 'EMAIL' }) => Promise<any>;
  verify2faLogin: (recipient: string, code: string, redirectPath?: string) => Promise<boolean>;
  updateProfile: (updatedData: Partial<User>) => void;
  switchUserRole: (role: 'STUDENT' | 'STAFF' | 'ADMIN', canteenId?: string) => void;

  // Canteens & Foods
  canteens: Canteen[];
  toggleCanteenStatus: (canteenId: string) => void;
  foods: FoodItem[];
  addFood: (food: Omit<FoodItem, 'id' | 'rating' | 'reviewCount'>) => Promise<void> | void;
  updateFood: (foodId: string, updated: Partial<FoodItem>) => Promise<void> | void;
  toggleFoodAvailability: (foodId: string) => void;
  deleteFood: (foodId: string) => Promise<void> | void;

  // Cart & Ordering Flow
  cart: CartItem[];
  addToCart: (
    food: FoodItem,
    quantity: number,
    selectedSize?: FoodSize,
    selectedToppings?: FoodTopping[],
    notes?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  // Active Order Mode & Config
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  selectedCanteen: Canteen | null;
  setSelectedCanteen: (canteen: Canteen | null) => void;
  tableInfo: TableInfo | null;
  setTableInfo: (table: TableInfo | null) => void;
  pickupTimeSlot: string;
  setPickupTimeSlot: (slot: string) => void;
  deliveryAddress: DeliveryAddress | null;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;

  // Promotions
  promotions: Promotion[];
  appliedPromotion: Promotion | null;
  applyPromotion: (code: string) => { success: boolean; message: string };
  removePromotion: () => void;

  // Pricing calculations
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;

  // Order Operations
  orders: Order[];
  createOrder: (paymentMethod: PaymentMethod, notes?: string) => Order | null;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  cancelOrder: (orderId: string, reason?: string) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (foodId: string) => void;
  isFavorite: (foodId: string) => boolean;

  // Wallet
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  topUpWallet: (amount: number, method: string) => void;

  // Notifications
  notifications: Notification[];
  unreadNotifCount: number;
  markNotifAsRead: (notifId: string) => void;
  markAllNotifsAsRead: () => void;

  // Toasts & Modals
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  qrScannerOpen: boolean;
  setQrScannerOpen: (open: boolean) => void;
  handleScannedQR: (qrData: string) => Promise<boolean> | boolean;
  walletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;

  // Active view route handler for smooth single-page tab transitions
  currentView: string;
  setCurrentView: (view: string) => void;
  viewParams: Record<string, any>;
  navigateTo: (view: string, params?: Record<string, any>) => void;

  // Marketing & Database Synced Data
  banners: BannerItem[];
  flashSales: FlashSaleItem[];
  categories: Category[];
  diningTables: any[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
}

const defaultStudentUser: User = {
  id: 'user-stu-1',
  name: 'Đặng Hoàng Minh',
  email: 'minh.dh22@university.edu.vn',
  phone: '0987654321',
  role: 'STUDENT',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  studentId: 'SV20220192',
  faculty: 'Khoa Công Nghệ Thông Tin',
  status: 'ACTIVE',
  walletBalance: 150000,
  savedAddresses: [],
  createdAt: '2026-08-01',
};

const defaultDemoUsers: User[] = [
  defaultStudentUser,
  {
    id: 'user-staff-1',
    name: 'Nguyễn Văn An (Trưởng Quầy Căn Tin A2)',
    email: 'staff.a@canteen.edu.vn',
    phone: '0901234567',
    role: 'STAFF',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
    department: 'Tổ Chế Biến Căn Tin A2',
    status: 'ACTIVE',
    walletBalance: 0,
    savedAddresses: [],
    createdAt: '2026-08-01',
  },
  {
    id: 'user-admin-1',
    name: 'Quản Trị Viên Hệ Thống',
    email: 'admin@university.edu.vn',
    phone: '0909999888',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    department: 'Ban Giám Hiệu - Phòng Quản Trị Căn Tin',
    status: 'ACTIVE',
    walletBalance: 5000000,
    savedAddresses: [],
    createdAt: '2026-08-01',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Live State from Backend
  const [users, setUsers] = useState<User[]>(defaultDemoUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('unieat_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('unieat_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orderType, setOrderType] = useState<OrderType>('PICKUP');
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('11:45 - 12:00');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);

  // Dynamic API Database states
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [diningTables, setDiningTables] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(150000);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const [
        bannersRes,
        flashSalesRes,
        vouchersRes,
        foodsRes,
        catsRes,
        tablesRes,
        canteensRes,
        ordersRes,
        usersRes,
        addressesRes,
        favoritesRes,
        notifsRes,
        walletTxRes,
      ] = await Promise.allSettled([
        marketingService.getBanners(),
        marketingService.getFlashSales(),
        marketingService.getVouchers(),
        menuService.getProducts(),
        menuService.getCategories(),
        tableService.getTables(),
        canteenApiService.getCanteens(),
        orderService.getOrders({ all: 'true' }),
        userService.getUsers(),
        userService.getAddresses(),
        userService.getFavorites(),
        userService.getNotifications(),
        userService.getWalletTransactions(),
      ]);

      if (bannersRes.status === 'fulfilled') setBanners(bannersRes.value);
      if (flashSalesRes.status === 'fulfilled') setFlashSales(flashSalesRes.value);
      if (vouchersRes.status === 'fulfilled') setPromotions(vouchersRes.value);
      if (foodsRes.status === 'fulfilled') setFoods(foodsRes.value);
      if (catsRes.status === 'fulfilled') setCategories(catsRes.value);
      if (tablesRes.status === 'fulfilled') setDiningTables(tablesRes.value);

      if (canteensRes.status === 'fulfilled' && canteensRes.value.length > 0) {
        setCanteens(canteensRes.value);
        setSelectedCanteen((prev) => {
          if (!prev) return canteensRes.value[0];
          const found = canteensRes.value.find((c) => c.id === prev.id);
          return found || canteensRes.value[0];
        });
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.length > 0) {
        setOrders(ordersRes.value);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value.length > 0) {
        setUsers(usersRes.value);
        setCurrentUser((prev) => {
          if (!prev) return null;
          const found = usersRes.value.find((u) => u.id === prev.id);
          return found || prev;
        });
        if (currentUser) {
          const active = usersRes.value.find((u) => u.id === currentUser.id);
          if (active && active.walletBalance !== undefined) {
            setWalletBalance(active.walletBalance);
          }
        }
      }

      if (addressesRes.status === 'fulfilled' && addressesRes.value.length > 0) {
        setDeliveryAddress((prev) => prev || addressesRes.value.find((a) => a.isDefault) || addressesRes.value[0]);
      }

      if (favoritesRes.status === 'fulfilled') {
        setFavorites(favoritesRes.value);
      }

      if (notifsRes.status === 'fulfilled') {
        setNotifications(notifsRes.value);
      }

      if (walletTxRes.status === 'fulfilled') {
        setWalletTransactions(walletTxRes.value);
      }

      // Nạp giỏ hàng từ Redis
      try {
        const redisCart = await cartApiService.getCart();
        if (redisCart && Array.isArray(redisCart.items) && redisCart.items.length > 0) {
          const reconstructed: CartItem[] = redisCart.items.map((it: any) => ({
            id: it.id,
            food: {
              id: it.productId,
              name: it.productName,
              price: it.basePrice || it.unitPrice || 0,
              image: it.productImage,
              isAvailable: true,
              categoryId: 'cat-1',
              categoryName: 'Món ăn',
              canteenId: redisCart.canteenId || 'cant-a',
              canteenName: 'Căng tin A2',
              ingredients: [],
              preparationTime: 10,
              rating: 5.0,
              reviewCount: 1,
            },
            quantity: it.quantity,
            unitPrice: it.unitPrice || it.basePrice || 0,
            selectedToppings: it.selectedOptions || [],
            notes: it.notes || '',
          }));
          setCart(reconstructed);
        }
      } catch (redisCartErr) {
        console.warn('[AppContext] Redis cart fetch notice:', redisCartErr);
      }
    } catch (err) {
      console.warn('[AppContext] API fetch warning:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Navigation state - Sync with browser URL
  const [currentView, setCurrentView] = useState<string>(() => {
    const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('unieat_current_user') : null;
    let savedUser = null;
    try {
      savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
    } catch {}

    // 1. Chưa đăng nhập -> Luôn ưu tiên hiển thị màn hình Login
    if (!savedUser) {
      if (typeof window !== 'undefined') {
        const rawPath = window.location.pathname.replace(/^\//, '');
        if (rawPath === 'register' || rawPath === 'buyer/register') return 'register';
        if (rawPath === 'forgot-password') return 'forgot-password';
      }
      return 'login';
    }

    // 2. Đã đăng nhập -> Nhảy vào giao diện theo Role tương ứng ĐỘC LẬP HOÀN TOÀN
    if (savedUser.role === 'ADMIN') {
      const rawPath = typeof window !== 'undefined' ? window.location.pathname.replace(/^\//, '') : '';
      if (rawPath.startsWith('admin') || rawPath === 'kitchen-kds' || rawPath === 'kds') return rawPath;
      const saved = localStorage.getItem('unieat_current_view');
      if (saved && (saved.startsWith('admin') || saved === 'kitchen-kds' || saved === 'kds')) return saved;
      return 'admin-dashboard';
    }

    if (savedUser.role === 'STAFF') {
      const rawPath = typeof window !== 'undefined' ? window.location.pathname.replace(/^\//, '') : '';
      if (rawPath.startsWith('staff') || rawPath === 'kitchen-kds' || rawPath === 'kds') return rawPath;
      const saved = localStorage.getItem('unieat_current_view');
      if (saved && (saved.startsWith('staff') || saved === 'kitchen-kds' || saved === 'kds')) return saved;
      return 'staff-dashboard';
    }

    // STUDENT / BUYER / CUSTOMER
    const rawPath = typeof window !== 'undefined' ? window.location.pathname.replace(/^\//, '') : '';
    if (rawPath && !rawPath.startsWith('admin') && !rawPath.startsWith('staff') && rawPath !== 'kitchen-kds' && rawPath !== 'kds' && rawPath !== 'landing' && rawPath !== 'login') {
      return rawPath;
    }
    const saved = localStorage.getItem('unieat_current_view');
    if (saved && !saved.startsWith('admin') && !saved.startsWith('staff') && saved !== 'kitchen-kds' && saved !== 'kds' && saved !== 'landing' && saved !== 'login') {
      return saved;
    }
    return 'home';
  });

  const [viewParams, setViewParams] = useState<Record<string, any>>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const params: Record<string, any> = {};
      searchParams.forEach((val, key) => { params[key] = val; });
      return params;
    }
    return {};
  });

  const navigateTo = (view: string, params: Record<string, any> = {}) => {
    let targetView = view;

    // Chặn và định hướng nghiêm ngặt theo vai trò người dùng (Strict Role Enforcement)
    if (currentUser?.role === 'ADMIN') {
      if (!targetView.startsWith('admin') && targetView !== 'kitchen-kds' && targetView !== 'kds' && targetView !== 'kitchen' && targetView !== 'login') {
        targetView = 'admin-dashboard';
      }
    } else if (currentUser?.role === 'STAFF') {
      if (!targetView.startsWith('staff') && targetView !== 'kitchen-kds' && targetView !== 'kds' && targetView !== 'kitchen' && targetView !== 'login') {
        targetView = 'staff-dashboard';
      }
    } else if (currentUser) {
      if (targetView.startsWith('admin') || targetView.startsWith('staff') || targetView === 'kitchen-kds' || targetView === 'kds' || targetView === 'kitchen') {
        targetView = 'home';
      }
    }

    setCurrentView(targetView);
    setViewParams(params);
    localStorage.setItem('unieat_current_view', targetView);

    // Đồng bộ đường dẫn trên thanh địa chỉ trình duyệt giống Shopee
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && typeof v !== 'object') {
          searchParams.set(k, String(v));
        }
      });
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      let pathSegment = '';
      if (targetView === 'login') pathSegment = 'buyer/login';
      else if (targetView === 'register') pathSegment = 'buyer/register';
      else if (targetView === 'home') pathSegment = '';
      else pathSegment = targetView;

      const newUrl = `/${pathSegment}${queryString}`;
      window.history.pushState({ view: targetView, params }, '', newUrl);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lắng nghe sự kiện Back/Forward của trình duyệt
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      let targetView = 'home';
      if (e.state && e.state.view) {
        targetView = e.state.view;
      } else {
        const rawPath = window.location.pathname.replace(/^\//, '');
        targetView = (rawPath === 'buyer/login' || rawPath === 'login')
          ? 'login'
          : (rawPath === 'buyer/register' || rawPath === 'register')
            ? 'register'
            : (rawPath || 'home');
      }

      const savedUserStr = localStorage.getItem('unieat_current_user');
      let role = null;
      try { role = savedUserStr ? JSON.parse(savedUserStr).role : null; } catch {}

      if (role === 'ADMIN' && !targetView.startsWith('admin') && targetView !== 'kitchen-kds' && targetView !== 'kds' && targetView !== 'kitchen') {
        targetView = 'admin-dashboard';
      } else if (role === 'STAFF' && !targetView.startsWith('staff') && targetView !== 'kitchen-kds' && targetView !== 'kds' && targetView !== 'kitchen') {
        targetView = 'staff-dashboard';
      } else if (role && role !== 'ADMIN' && role !== 'STAFF' && (targetView.startsWith('admin') || targetView.startsWith('staff') || targetView === 'kitchen-kds')) {
        targetView = 'home';
      }

      const searchParams = new URLSearchParams(window.location.search);
      const params: Record<string, any> = {};
      searchParams.forEach((val, key) => { params[key] = val; });
      setCurrentView(targetView);
      setViewParams(e.state?.params || params);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Persist important data
  useEffect(() => {
    localStorage.setItem('unieat_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('unieat_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('unieat_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('unieat_canteens', JSON.stringify(canteens));
  }, [canteens]);

  useEffect(() => {
    localStorage.setItem('unieat_foods', JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem('unieat_cart', JSON.stringify(cart));
    if (currentUser) {
      cartApiService.syncCart(cart).catch(() => {});
    }
  }, [cart, currentUser]);

  useEffect(() => {
    localStorage.setItem('unieat_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('unieat_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('unieat_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('unieat_wallet_tx', JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  // Real-time Audio Alert (Web Audio API Synthesizer)
  const playAudioTone = (tone: 'bell' | 'alert' | 'ding' = 'ding') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (tone === 'bell') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
        osc.start();
        osc.stop(ctx.currentTime + 0.38);
      } else if (tone === 'alert') {
        osc.frequency.setValueAtTime(392, ctx.currentTime);
        osc.frequency.setValueAtTime(261.63, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(784, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio playback requires user interaction
    }
  };

  // Native Device/OS Notification Helper
  const triggerDeviceNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') {
        try {
          new window.Notification(title, {
            body,
            icon: '/favicon.ico',
          });
        } catch (err) {
          console.warn('[Desktop Notification error]:', err);
        }
      } else if (window.Notification.permission === 'default') {
        window.Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            try {
              new window.Notification(title, { body, icon: '/favicon.ico' });
            } catch {}
          }
        });
      }
    }
  };

  // Real-time Socket.IO Connection & Event Handlers
  useEffect(() => {
    // Request permission for Desktop Notification on user device
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission().catch(() => {});
    }

    if (!currentUser) {
      disconnectSocket();
      return;
    }
    const socket = initSocket(currentUser.id, currentUser.role);

    // Join staff channel if role is staff or admin
    if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
      socket.emit('staff:join', { canteenId: 'cant-a' });
    }

    // 1. New incoming order (for canteen staff & kitchen KDS & admin)
    socket.on('order:new', (orderData: any) => {
      console.log('[Socket.IO] New order received by staff/admin:', orderData);

      // Auto prepend order to orders state so staff dashboard and orders list update in real time
      setOrders((prev) => {
        const orderId = orderData.id || orderData.orderCode;
        const exists = prev.some((o) => o.id === orderId || o.orderCode === orderData.orderCode);
        if (exists) return prev;

        const transformed: Order = {
          id: orderData.id || `ord-${Date.now()}`,
          orderCode: orderData.orderCode,
          orderNumber: orderData.orderCode ? `#${orderData.orderCode}` : (orderData.orderNumber || `#ORD-${Date.now()}`),
          userId: orderData.userId || 'guest',
          userName: orderData.userName || 'Sinh viên UniEat',
          userPhone: orderData.userPhone || '',
          orderType: orderData.orderType === 'TAKEAWAY' ? 'PICKUP' : (orderData.orderType || 'PICKUP'),
          canteenId: orderData.canteenId || 'cant-a',
          canteenName: orderData.canteenName || 'Căng tin A2',
          items: orderData.items || [],
          subtotal: orderData.subtotal || orderData.finalAmount || orderData.totalAmount || 0,
          shippingFee: orderData.shippingFee || 0,
          discountAmount: orderData.discountAmount || 0,
          totalAmount: orderData.finalAmount || orderData.totalAmount || 0,
          paymentMethod: orderData.paymentMethod || 'CASH',
          paymentStatus: orderData.isPaid ? 'PAID' : 'UNPAID',
          status: orderData.status || 'PENDING',
          createdAt: new Date(orderData.createdAt || Date.now()).toLocaleString('vi-VN'),
          estimatedTime: orderData.pickupSlot || '15 phút',
          tableInfo: orderData.tableNumber
            ? {
                id: orderData.tableId,
                tableCode: orderData.tableId || orderData.tableNumber,
                tableName: orderData.tableNumber,
                tableNumber: orderData.tableNumber,
                canteenId: orderData.canteenId || '',
                canteenName: orderData.canteenName || '',
                status: 'OCCUPIED' as const,
              }
            : undefined,
          pickupTimeSlot: orderData.pickupSlot,
          deliveryAddress: orderData.deliveryAddressText ? ({ building: orderData.deliveryAddressText, room: '', phone: orderData.userPhone } as any) : undefined,
          notes: orderData.notes,
          qrCodeValue: `UNI-${orderData.orderCode || orderData.id}`,
          timeline: [
            { status: 'PENDING', title: 'Đã nhận đơn', description: 'Đang chờ bếp', time: 'Vừa xong', completed: true },
            { status: 'CONFIRMED', title: 'Xác nhận', description: '', time: '--:--', completed: false },
            { status: 'PREPARING', title: 'Đang nấu', description: '', time: '--:--', completed: false },
            { status: 'READY', title: 'Chờ lấy / giao', description: '', time: '--:--', completed: false },
            { status: 'COMPLETED', title: 'Hoàn thành', description: '', time: '--:--', completed: false },
          ],
        };
        return [transformed, ...prev];
      });

      if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
        playAudioTone('bell');
        const amt = (orderData.finalAmount || orderData.totalAmount || 0).toLocaleString('vi-VN');
        showToast(`🔔 Đơn hàng mới: #${orderData.orderCode || orderData.id} - ${amt}đ`, 'info');
        triggerDeviceNotification(`🔔 Đơn hàng mới #${orderData.orderCode || orderData.id}`, `Đơn trị giá: ${amt}đ`);
      }
    });

    // 2. Order status update (for students, staff, and admin)
    socket.on('order:status_updated', (orderData: any) => {
      console.log('[Socket.IO] Order status update:', orderData);
      const statusLabels: Record<string, string> = {
        CONFIRMED: 'Đã tiếp nhận',
        PREPARING: 'Đang chế biến trong bếp',
        READY: 'Đã sẵn sàng - Mời bạn nhận món',
        SERVED: 'Đã phục vụ ra bàn cho bạn',
        WAITING_PICKUP: 'Sẵn sàng - Chờ khách nhận',
        DELIVERING: 'Đang giao tận phòng',
        COMPLETED: 'Đã hoàn thành',
        CANCELLED: 'Đã hủy',
      };
      const label = statusLabels[orderData.status] || orderData.status;

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderData.id || o.orderCode === orderData.orderCode || o.orderNumber === `#${orderData.orderCode}`) {
            const updatedTimeline = o.timeline.map((t) =>
              t.status === orderData.status
                ? { ...t, completed: true, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
                : t
            );
            return { ...o, status: orderData.status, timeline: updatedTimeline };
          }
          return o;
        })
      );

      if (orderData.status === 'CANCELLED') {
        playAudioTone('alert');
        if (orderData.userId === currentUser.id) {
          showToast(`❌ Đơn hàng #${orderData.orderCode || orderData.id} đã bị hủy!`, 'error');
        } else if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
          showToast(`⚠️ Đơn hàng #${orderData.orderCode || orderData.id} của khách đã bị hủy!`, 'warning');
        }
      } else if (orderData.userId === currentUser.id) {
        playAudioTone('ding');
        showToast(`🎉 Đơn hàng #${orderData.orderCode || orderData.id}: ${label}`, 'success');
        triggerDeviceNotification(`Uni Canteen • Đơn #${orderData.orderCode || orderData.id}`, label);
      } else if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
        playAudioTone('ding');
        showToast(`📋 Đơn #${orderData.orderCode || orderData.id} -> ${label}`, 'info');
      }
    });

    // 2.1 Dedicated order cancellation listener
    socket.on('order:cancelled', (data: any) => {
      console.log('[Socket.IO] Order cancelled broadcast:', data);
      playAudioTone('alert');
      setOrders((prev) =>
        prev.map((o) =>
          o.id === data.orderId || o.orderCode === data.orderCode
            ? { ...o, status: 'CANCELLED' }
            : o
        )
      );
      if (data.userId === currentUser.id) {
        showToast(`❌ Đơn hàng #${data.orderCode || data.orderId} đã bị hủy!`, 'error');
        triggerDeviceNotification(`Uni Canteen • Đơn hàng bị hủy`, `Đơn #${data.orderCode || data.orderId} đã bị hủy.`);
      } else if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
        showToast(`⚠️ Khách hàng đã hủy đơn #${data.orderCode || data.orderId}!`, 'warning');
      }
    });

    // 3. Direct chat alerts between customer and staff
    socket.on('customer:chat:alert', (payload: any) => {
      if (!payload.targetUserId || payload.targetUserId === currentUser.id) {
        playAudioTone('ding');
        showToast(`💬 Căn tin: "${payload.message}"`, 'info');
        triggerDeviceNotification(`Uni Canteen Chat`, payload.message);
      }
    });

    socket.on('staff:chat:alert', (payload: any) => {
      if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
        playAudioTone('ding');
        showToast(`💬 Khách nhắn [Đơn ${payload.orderId}]: "${payload.message}"`, 'info');
        triggerDeviceNotification(`Tin nhắn khách [Đơn ${payload.orderId}]`, payload.message);
      }
    });

    // 4. System & Promotional Notifications
    socket.on('notification:received', (notif: any) => {
      const newNotif: Notification = {
        id: notif.id || `notif-${Date.now()}`,
        title: notif.title || 'Thông báo mới',
        message: notif.message || '',
        timestamp: notif.createdAt
          ? new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          : 'Vừa xong',
        dateDisplay: notif.createdAt
          ? new Date(notif.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
          : undefined,
        read: Boolean(notif.isRead ?? notif.read ?? false),
        type: (notif.type === 'ORDER_STATUS' ? 'ORDER' : notif.type === 'PROMOTION' ? 'PROMO' : notif.type) || 'SYSTEM',
        linkOrderId: notif.referenceId || notif.linkOrderId,
        iconEmoji: notif.iconEmoji || (notif.type === 'ORDER_STATUS' ? '📦' : notif.type === 'WALLET' ? '💳' : notif.type === 'PROMOTION' ? '🎁' : '⚡'),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showToast(`📢 ${notif.title || 'Thông báo mới'}`, 'info');
      triggerDeviceNotification(newNotif.title, newNotif.message);
    });

    // 5. Customer call order event (kitchen/staff calls customer to pickup ready order)
    socket.on('customer:call_order', (payload: any) => {
      console.log('[Socket.IO] customer:call_order received:', payload);
      if (!payload.targetUserId || payload.targetUserId === currentUser.id) {
        playAudioTone('bell');
        showToast(
          `📢 MỜI NHẬN MÓN! Đơn #${payload.orderCode}: Món ăn đã sẵn sàng tại quầy, mời bạn đến lấy!`,
          'success'
        );
        triggerDeviceNotification(`Mời nhận món #${payload.orderCode}`, 'Món ăn đã sẵn sàng tại quầy, mời bạn đến lấy!');
      }
    });

    return () => {
      socket.off('order:new');
      socket.off('order:status_updated');
      socket.off('customer:chat:alert');
      socket.off('staff:chat:alert');
      socket.off('notification:received');
      socket.off('customer:call_order');
    };
  }, [currentUser?.id, currentUser?.role]);

  // Modern animated Toast Helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, message, type };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper phân giải URL chuyển hướng (Shopee Pattern: ?next=...)
  const resolveRedirect = (target?: string): { view: string; params: Record<string, any> } | null => {
    if (!target) return null;
    const path = target.trim();
    if (!path) return null;

    try {
      if (path.startsWith('http://') || path.startsWith('https://')) {
        const u = new URL(path);
        // Nếu chuyển tới domain khác bên ngoài (VD: https://shopee.vn/m/uu-dai-lorealparis-maybelline)
        if (typeof window !== 'undefined' && u.origin !== window.location.origin) {
          window.location.href = path;
          return null;
        }
        const cleanPath = (u.pathname.replace(/^\//, '') + u.search).replace(/^\//, '');
        const [viewName, search] = cleanPath.split('?');
        const params: Record<string, any> = {};
        if (search) {
          new URLSearchParams(search).forEach((v, k) => {
            params[k] = v;
          });
        }
        return { view: viewName || 'home', params };
      }
    } catch {
      // ignore parse error
    }

    const cleanPath = path.replace(/^\//, '');
    const [viewName, search] = cleanPath.split('?');
    const params: Record<string, any> = {};
    if (search) {
      new URLSearchParams(search).forEach((v, k) => {
        params[k] = v;
      });
    }
    return { view: viewName || 'home', params };
  };

  // Auth Operations (JWT + Bcrypt Integration)
  const login = async (email: string, password: string = '123456', redirectPath?: string): Promise<boolean> => {
    try {
      const res = await authService.login({ email, password });
      if (res?.success && res.data?.user) {
        const loggedUser = res.data.user;
        setCurrentUser(loggedUser);
        setWalletBalance(loggedUser.walletBalance ?? 0);
        if (loggedUser.savedAddresses && loggedUser.savedAddresses.length > 0) {
          setDeliveryAddress(loggedUser.savedAddresses[0]);
        }
        showToast(`Đăng nhập thành công! Chào mừng ${loggedUser.name}`, 'success');

        // Cơ chế điều hướng chuyển tiếp như Shopee (?next=...)
        const searchParams = new URLSearchParams(window.location.search);
        const nextUrl = redirectPath || viewParams?.next || searchParams.get('next');

        if (nextUrl) {
          try {
            if (nextUrl.startsWith('http://') || nextUrl.startsWith('https://')) {
              const u = new URL(nextUrl);
              if (typeof window !== 'undefined' && u.origin !== window.location.origin) {
                window.location.href = nextUrl;
                return true;
              }
            }
          } catch {}
        }

        // Điều hướng thẳng vào giao diện tương ứng với Role của tài khoản
        if (loggedUser.role === 'ADMIN') {
          navigateTo('admin-dashboard');
        } else if (loggedUser.role === 'STAFF') {
          navigateTo('staff-dashboard');
        } else {
          const resolved = resolveRedirect(nextUrl || undefined);
          if (resolved && resolved.view !== 'login' && resolved.view !== 'buyer/login' && !resolved.view.startsWith('admin') && !resolved.view.startsWith('staff')) {
            navigateTo(resolved.view, resolved.params);
          } else {
            navigateTo('home');
          }
        }
        return true;
      }
    } catch (apiErr: any) {
      console.warn('Backend login notice, checking local records:', apiErr?.message);
    }

    // Local fallback if offline or existing demo account
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.status === 'BLOCKED') {
        showToast('Tài khoản này đã bị tạm khóa do vi phạm quy định.', 'error');
        return false;
      }
      setCurrentUser(found);
      setWalletBalance(found.walletBalance);
      if (found.savedAddresses && found.savedAddresses.length > 0) {
        setDeliveryAddress(found.savedAddresses[0]);
      }
      showToast(`Đăng nhập thành công! Chào mừng ${found.name}`, 'success');
      if (found.role === 'ADMIN') {
        navigateTo('admin-dashboard');
      } else if (found.role === 'STAFF') {
        navigateTo('staff-dashboard');
      } else {
        navigateTo('home');
      }
      return true;
    }
    showToast('Tài khoản hoặc mật khẩu không chính xác!', 'error');
    return false;
  };

  const logout = () => {
    disconnectSocket();
    authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('unieat_jwt');
    localStorage.removeItem('unieat_current_user');
    localStorage.removeItem('unieat_current_view');
    setCurrentUser(null);
    showToast('Đã đăng xuất khỏi tài khoản', 'info');
    navigateTo('login');
  };

  const register = async (userData: Partial<User> & { password?: string }, redirectPath?: string): Promise<boolean> => {
    try {
      const res = await authService.register({
        name: userData.name || 'Sinh Viên Mới',
        email: userData.email || '',
        password: userData.password || 'password123',
        phone: userData.phone || '0987654321',
        role: 'STUDENT',
        studentId: userData.studentId,
        department: userData.department,
        className: userData.className,
      });

      if (res?.success && res.data?.user) {
        const newUser: User = {
          ...res.data.user,
          walletBalance: res.data.user.walletBalance ?? 50000,
          savedAddresses: [],
          status: 'ACTIVE',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers((prev) => [newUser, ...prev]);
        setCurrentUser(newUser);
        setWalletBalance(newUser.walletBalance);
        showToast('Tạo tài khoản thành công! Tặng ngay +50.000đ vào Ví Sinh Viên 🎉', 'success');

        // Chuyển hướng theo query 'next' nếu có
        const searchParams = new URLSearchParams(window.location.search);
        const nextUrl = redirectPath || viewParams?.next || searchParams.get('next');

        if (nextUrl) {
          try {
            if (nextUrl.startsWith('http://') || nextUrl.startsWith('https://')) {
              const u = new URL(nextUrl);
              if (typeof window !== 'undefined' && u.origin !== window.location.origin) {
                window.location.href = nextUrl;
                return true;
              }
            }
          } catch {}
        }

        const resolved = resolveRedirect(nextUrl || undefined);
        if (resolved && resolved.view !== 'register' && resolved.view !== 'buyer/register') {
          navigateTo(resolved.view, resolved.params);
        } else {
          navigateTo('home');
        }
        return true;
      } else {
        showToast((res as any)?.message || 'Đăng ký không thành công!', 'error');
        return false;
      }
    } catch (err: any) {
      // Fallback local registration if backend temporarily unavailable
      console.warn('Backend register notice:', err?.message);
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || 'Sinh Viên Mới',
        studentId: userData.studentId || '2026001122',
        email: userData.email || 'student@st.university.edu.vn',
        phone: userData.phone || '0987 654 321',
        role: 'STUDENT',
        department: userData.department || 'Công Nghệ Thông Tin',
        className: userData.className || 'K68-CNTT',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300`,
        walletBalance: 50000,
        savedAddresses: [],
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setWalletBalance(50000);
      showToast('Tạo tài khoản thành công! Tặng ngay +50.000đ vào Ví Sinh Viên 🎉', 'success');
      navigateTo('home');
      return true;
    }
  };

  // OTP & 2-Factor Authentication Methods (Real Email SMTP via Backend)
  const sendOtp = async (params: {
    recipient: string;
    channel?: 'SMS' | 'EMAIL';
    type: 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | '2FA_LOGIN';
  }) => {
    try {
      const res = await authService.sendOtp({
        recipient: params.recipient.trim().toLowerCase(),
        channel: params.channel || 'EMAIL',
        type: params.type,
      });
      if (res?.success) {
        showToast(res.message || 'Đã gửi mã xác thực đến email của bạn!', 'success');
        return res.data;
      }
      showToast((res as any)?.message || 'Không thể gửi mã OTP qua email', 'error');
      return null;
    } catch (err: any) {
      showToast(err?.message || 'Không thể kết nối đến máy chủ gửi email!', 'error');
      return null;
    }
  };

  const verifyOtp = async (params: {
    recipient: string;
    code: string;
    type: 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | '2FA_LOGIN';
  }): Promise<boolean> => {
    try {
      const res = await authService.verifyOtp({
        recipient: params.recipient.trim().toLowerCase(),
        code: params.code.trim(),
        type: params.type,
      });
      if (res?.success) {
        return true;
      }
      showToast((res as any)?.message || 'Mã xác thực không hợp lệ', 'error');
      return false;
    } catch (err: any) {
      showToast(err?.message || 'Mã OTP không chính xác hoặc đã hết hạn!', 'error');
      return false;
    }
  };

  const registerWithOtp = async (
    userData: Partial<User> & { password?: string; otpCode: string; channel: 'SMS' | 'EMAIL' },
    redirectPath?: string
  ): Promise<boolean> => {
    try {
      const res = await authService.registerWithOtp(userData);
      if (res?.success && res.data?.user) {
        const newUser: User = {
          ...res.data.user,
          walletBalance: res.data.user.walletBalance ?? 50000,
          savedAddresses: [],
          status: 'ACTIVE',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers((prev) => [newUser, ...prev]);
        setCurrentUser(newUser);
        setWalletBalance(newUser.walletBalance);
        showToast('Xác thực bảo mật và tạo tài khoản thành công! Nhận +50.000đ vào Ví Sinh Viên 🎉', 'success');

        const searchParams = new URLSearchParams(window.location.search);
        const nextUrl = redirectPath || viewParams?.next || searchParams.get('next');
        const resolved = resolveRedirect(nextUrl || undefined);
        if (resolved && resolved.view !== 'register' && resolved.view !== 'buyer/register') {
          navigateTo(resolved.view, resolved.params);
        } else {
          navigateTo('home');
        }
        return true;
      } else {
        showToast((res as any)?.message || 'Đăng ký không thành công!', 'error');
        return false;
      }
    } catch (err: any) {
      console.warn('Backend register-with-otp notice, local fallback:', err?.message);
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || 'Sinh Viên Mới',
        studentId: userData.studentId || '2026001122',
        email: userData.email || 'student@st.university.edu.vn',
        phone: userData.phone || '0987 654 321',
        role: 'STUDENT',
        department: userData.department || 'Công Nghệ Thông Tin',
        className: userData.className || 'K68-CNTT',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300`,
        walletBalance: 50000,
        savedAddresses: [],
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setWalletBalance(50000);
      showToast('Xác thực bảo mật thành công! Tặng ngay +50.000đ vào Ví Sinh Viên 🎉', 'success');
      navigateTo('home');
      return true;
    }
  };

  const loginWithOtp = async (recipient: string, otpCode: string, redirectPath?: string): Promise<boolean> => {
    try {
      const res = await authService.loginWithOtp({ recipient, otpCode });
      if (res?.success && res.data?.user) {
        const loggedUser = res.data.user;
        setCurrentUser(loggedUser);
        setWalletBalance(loggedUser.walletBalance ?? 0);
        showToast(`Đăng nhập bảo mật thành công! Chào mừng ${loggedUser.name}`, 'success');

        const searchParams = new URLSearchParams(window.location.search);
        const nextUrl = redirectPath || viewParams?.next || searchParams.get('next');
        if (loggedUser.role === 'ADMIN') {
          navigateTo('admin-dashboard');
        } else if (loggedUser.role === 'STAFF') {
          navigateTo('staff-dashboard');
        } else {
          const resolved = resolveRedirect(nextUrl || undefined);
          if (resolved && resolved.view !== 'login' && resolved.view !== 'buyer/login' && !resolved.view.startsWith('admin') && !resolved.view.startsWith('staff')) {
            navigateTo(resolved.view, resolved.params);
          } else {
            navigateTo('home');
          }
        }
        return true;
      }
    } catch (err: any) {
      console.warn('Backend login with OTP notice, checking local records:', err?.message);
    }

    const clean = recipient.toLowerCase().trim();
    const found = users.find((u) => u.email.toLowerCase() === clean || (u.phone && u.phone.trim() === clean));
    if (found) {
      setCurrentUser(found);
      setWalletBalance(found.walletBalance);
      showToast(`Đăng nhập OTP thành công! Chào mừng ${found.name}`, 'success');
      if (found.role === 'ADMIN') navigateTo('admin-dashboard');
      else if (found.role === 'STAFF') navigateTo('staff-dashboard');
      else navigateTo('home');
      return true;
    }

    showToast('Mã OTP không hợp lệ hoặc tài khoản không tồn tại', 'error');
    return false;
  };

  const initiate2faLogin = async (credentials: { email: string; password: string; preferredChannel?: 'SMS' | 'EMAIL' }) => {
    try {
      const res = await authService.initiate2faLogin(credentials);
      return res;
    } catch (err: any) {
      const found = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase().trim());
      if (!found) {
        throw new Error('Tài khoản email không tồn tại trong hệ thống');
      }
      const channel = credentials.preferredChannel || 'SMS';
      const target = channel === 'EMAIL' ? found.email : (found.phone || '0987654321');
      const debugCode = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem(`demo_otp_2FA_LOGIN_${target.toLowerCase().trim()}`, debugCode);
      const masked = channel === 'EMAIL'
        ? `${found.email.slice(0, 2)}***@${found.email.split('@')[1] || 'university.edu.vn'}`
        : `${(found.phone || '0987654321').slice(0, 3)}****${(found.phone || '0987654321').slice(-3)}`;
      return {
        success: true,
        require2FA: true,
        message: 'Đã gửi mã xác thực 2 lớp',
        data: {
          userId: found.id,
          email: found.email,
          phone: found.phone,
          channel,
          recipient: target,
          maskedRecipient: masked,
          debugOtp: debugCode,
        },
      };
    }
  };

  const verify2faLogin = async (recipient: string, code: string, redirectPath?: string): Promise<boolean> => {
    try {
      const res = await authService.verify2faLogin({ recipient, code });
      if (res?.success && res.data?.user) {
        const loggedUser = res.data.user;
        setCurrentUser(loggedUser);
        setWalletBalance(loggedUser.walletBalance ?? 0);
        showToast(`Xác thực 2 lớp thành công! Chào mừng ${loggedUser.name}`, 'success');

        const searchParams = new URLSearchParams(window.location.search);
        const nextUrl = redirectPath || viewParams?.next || searchParams.get('next');
        if (loggedUser.role === 'ADMIN') {
          navigateTo('admin-dashboard');
        } else if (loggedUser.role === 'STAFF') {
          navigateTo('staff-dashboard');
        } else {
          const resolved = resolveRedirect(nextUrl || undefined);
          if (resolved && resolved.view !== 'login' && resolved.view !== 'buyer/login' && !resolved.view.startsWith('admin') && !resolved.view.startsWith('staff')) {
            navigateTo(resolved.view, resolved.params);
          } else {
            navigateTo('home');
          }
        }
        return true;
      }
    } catch (err: any) {
      console.warn('Backend 2FA login notice, checking local:', err?.message);
    }

    const clean = recipient.toLowerCase().trim();
    const found = users.find((u) => u.email.toLowerCase() === clean || (u.phone && u.phone.trim() === clean));
    if (found) {
      setCurrentUser(found);
      setWalletBalance(found.walletBalance);
      showToast(`Xác minh bảo mật thành công! Chào mừng ${found.name}`, 'success');
      if (found.role === 'ADMIN') navigateTo('admin-dashboard');
      else if (found.role === 'STAFF') navigateTo('staff-dashboard');
      else navigateTo('home');
      return true;
    }
    showToast('Mã OTP xác thực 2 lớp không hợp lệ', 'error');
    return false;
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast('Đã cập nhật thông tin cá nhân thành công!', 'success');
  };

  const switchUserRole = (role: 'STUDENT' | 'STAFF' | 'ADMIN', canteenId?: string) => {
    if (role === 'STUDENT') {
      const student = users.find((u) => u.role === 'STUDENT') || users[0] || defaultStudentUser;
      setCurrentUser(student);
      setWalletBalance(student.walletBalance);
      showToast('Đã chuyển sang vai trò Sinh Viên', 'info');
      navigateTo('home');
    } else if (role === 'STAFF') {
      const staff = users.find((u) => u.role === 'STAFF') || users.find((u) => u.id === 'user-staff-1') || users[0] || defaultStudentUser;
      const updatedStaff = canteenId ? { ...staff, canteenId } : staff;
      setCurrentUser(updatedStaff);
      showToast(`Đã chuyển sang vai trò Nhân Viên Căng Tin`, 'info');
      navigateTo('staff-dashboard');
    } else if (role === 'ADMIN') {
      const admin = users.find((u) => u.role === 'ADMIN') || users.find((u) => u.id === 'user-admin-1') || users[0] || defaultStudentUser;
      setCurrentUser(admin);
      showToast('Đã chuyển sang vai trò Quản Trị Viên (Admin)', 'info');
      navigateTo('admin-dashboard');
    }
  };

  // Canteens & Foods
  const toggleCanteenStatus = async (canteenId: string) => {
    setCanteens((prev) =>
      prev.map((c) => (c.id === canteenId ? { ...c, isOpen: !c.isOpen } : c))
    );
    try {
      await canteenApiService.toggleStatus(canteenId);
    } catch (err) {
      console.warn('Failed to sync canteen status with backend:', err);
    }
    showToast('Đã cập nhật trạng thái hoạt động căng tin!', 'success');
  };

  const addFood = async (foodData: Omit<FoodItem, 'id' | 'rating' | 'reviewCount'>) => {
    try {
      const created = await menuService.createProduct(foodData);
      const newFood: FoodItem = created || {
        ...foodData,
        id: `food-${Date.now()}`,
        rating: 5.0,
        reviewCount: 1,
      };
      setFoods((prev) => [newFood, ...prev]);
      showToast(`Đã thêm món "${newFood.name}" vào menu thành công!`, 'success');
    } catch (err) {
      console.warn('[addFood notice]:', err);
      const fallbackFood: FoodItem = {
        ...foodData,
        id: `food-${Date.now()}`,
        rating: 5.0,
        reviewCount: 1,
      };
      setFoods((prev) => [fallbackFood, ...prev]);
      showToast(`Đã thêm món "${fallbackFood.name}" vào menu!`, 'success');
    }
  };

  const updateFood = async (foodId: string, updated: Partial<FoodItem>) => {
    setFoods((prev) => prev.map((f) => (f.id === foodId ? { ...f, ...updated } : f)));
    try {
      await menuService.updateProduct(foodId, updated);
    } catch (err) {
      console.warn('[updateFood notice]:', err);
    }
    showToast('Đã cập nhật thông tin món ăn', 'success');
  };

  const toggleFoodAvailability = async (foodId: string) => {
    let nextState = false;
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id === foodId) {
          nextState = !f.isAvailable;
          return { ...f, isAvailable: nextState };
        }
        return f;
      })
    );
    showToast(`Đã đổi trạng thái món thành: ${nextState ? 'Còn hàng' : 'Hết hàng'}`, 'info');
    try {
      await menuService.toggleAvailability(foodId);
    } catch (err) {
      console.warn('[toggleFoodAvailability notice]:', err);
    }
  };

  const deleteFood = async (foodId: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== foodId));
    try {
      await menuService.deleteProduct(foodId);
    } catch (err) {
      console.warn('[deleteFood notice]:', err);
    }
    showToast('Đã xóa món ăn khỏi thực đơn', 'warning');
  };

  // Cart Operations
  const addToCart = (
    food: FoodItem,
    quantity: number,
    selectedSize?: FoodSize,
    selectedToppings: FoodTopping[] = [],
    notes: string = ''
  ) => {
    if (!food.isAvailable) {
      showToast('Món này hiện đang tạm hết hàng!', 'error');
      return;
    }

    // Calculate unit price based on size & toppings
    const sizePrice = selectedSize ? selectedSize.price : 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const unitPrice = food.price + sizePrice + toppingsPrice;

    // Check if identical item already exists in cart
    const toppingsKey = selectedToppings
      .map((t) => t.id)
      .sort()
      .join(',');
    const sizeKey = selectedSize ? selectedSize.name : 'default';
    const cartItemKey = `${food.id}-${sizeKey}-${toppingsKey}-${notes.trim()}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === cartItemKey);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemKey,
          food,
          quantity,
          selectedSize,
          selectedToppings,
          notes,
          unitPrice,
        };
        return [...prevCart, newItem];
      }
    });

    showToast(`Đã thêm ${quantity}x "${food.name}" vào giỏ hàng!`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Đã xóa món khỏi giỏ hàng', 'info');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromotion(null);
    if (currentUser) {
      cartApiService.clearCart().catch(() => {});
    }
  };

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const shippingFee = orderType === 'DELIVERY' ? (subtotal >= 45000 ? 0 : 5000) : 0;

  let discountAmount = 0;
  if (appliedPromotion) {
    if (subtotal >= appliedPromotion.minOrderValue) {
      if (appliedPromotion.discountType === 'PERCENT') {
        const calc = (subtotal * appliedPromotion.discountValue) / 100;
        discountAmount = appliedPromotion.maxDiscount
          ? Math.min(calc, appliedPromotion.maxDiscount)
          : calc;
      } else {
        discountAmount = appliedPromotion.discountValue;
      }
    }
  }

  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  // Apply Coupon
  const applyPromotion = (code: string) => {
    const promo = promotions.find(
      (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.isAvailable
    );
    if (!promo) {
      return { success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
    }
    if (subtotal < promo.minOrderValue) {
      return {
        success: false,
        message: `Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng mã này.`,
      };
    }
    setAppliedPromotion(promo);
    showToast(`Áp dụng mã ${promo.code} thành công!`, 'success');
    return { success: true, message: 'Áp dụng khuyến mãi thành công!' };
  };

  const removePromotion = () => {
    setAppliedPromotion(null);
    showToast('Đã bỏ mã giảm giá', 'info');
  };

  // Create Order
  const createOrder = (paymentMethod: PaymentMethod, notes: string = ''): Order | null => {
    if (cart.length === 0) {
      showToast('Giỏ hàng đang trống!', 'error');
      return null;
    }

    if (orderType === 'DINE_IN' && !tableInfo) {
      showToast('Vui lòng quét QR bàn hoặc chọn bàn trước khi đặt món ăn tại chỗ!', 'error');
      return null;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress) {
      showToast('Vui lòng chọn địa chỉ giao hàng trong khuôn viên trường!', 'error');
      return null;
    }

    // Check payment by Student Wallet
    if (paymentMethod === 'STUDENT_WALLET') {
      if (walletBalance < totalAmount) {
        showToast(
          `Số dư Ví Sinh Viên không đủ (${walletBalance.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm tiền!`,
          'error'
        );
        return null;
      }
      // Deduct wallet balance
      const newBalance = walletBalance - totalAmount;
      setWalletBalance(newBalance);
      setCurrentUser((prev) => ({ ...prev, walletBalance: newBalance }));

      // Log wallet transaction
      const tx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        amount: totalAmount,
        type: 'PAYMENT',
        description: `Thanh toán đơn hàng UniEat`,
        date: new Date().toLocaleString('vi-VN'),
        status: 'SUCCESS',
      };
      setWalletTransactions((prev) => [tx, ...prev]);
    }

    const orderNum = `#CT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const chosenCanteen = selectedCanteen || canteens[0] || ({
      id: 'cant-a',
      name: 'Căng tin A2',
      displayName: 'Căng tin A2',
      code: 'CTA',
      location: 'Tòa A2',
      openingHours: '06:30 - 21:00',
      isOpen: true,
      rating: 5,
      reviewCount: 100,
      image: '',
      totalTables: 20,
      phone: '0988 123 456',
    } as Canteen);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode: orderNum.replace('#', ''),
      orderNumber: orderNum,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone || '0912 345 678',
      orderType,
      canteenId: chosenCanteen.id,
      canteenName: chosenCanteen.name,
      items: [...cart],
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'CASH' ? 'UNPAID' : 'PAID',
      status: 'PENDING',
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      estimatedTime:
        orderType === 'PICKUP'
          ? pickupTimeSlot
          : orderType === 'DELIVERY'
            ? '20 - 30 phút'
            : '10 - 15 phút',
      tableInfo: orderType === 'DINE_IN' ? tableInfo! : undefined,
      pickupTimeSlot: orderType === 'PICKUP' ? pickupTimeSlot : undefined,
      deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress! : undefined,
      notes,
      qrCodeValue: `UNI-${orderType}-${orderNum}`,
      timeline: [
        {
          status: 'PENDING',
          title: 'Đã nhận đơn',
          description: 'Đơn hàng đang chờ nhà bếp xác nhận',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          completed: true,
        },
        { status: 'CONFIRMED', title: 'Căng tin xác nhận', description: 'Đang chuyển xuống bếp', time: '--:--', completed: false },
        { status: 'PREPARING', title: 'Đang chế biến', description: 'Nhà bếp đang thực hiện', time: '--:--', completed: false },
        {
          status: orderType === 'DELIVERY' ? 'DELIVERING' : orderType === 'PICKUP' ? 'READY' : 'SERVED',
          title: orderType === 'DELIVERY' ? 'Đang giao tận phòng' : orderType === 'PICKUP' ? 'Sẵn sàng - Chờ lấy' : 'Phục vụ tại bàn',
          description: 'Chuẩn bị hoàn tất',
          time: '--:--',
          completed: false,
        },
        { status: 'COMPLETED', title: 'Hoàn thành', description: 'Cảm ơn bạn đã dùng bữa!', time: '--:--', completed: false },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // 1. Emit direct via Socket.IO for 0ms latency to Kitchen KDS and Staff Dashboard
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('order:place', {
          id: newOrder.id,
          orderCode: orderNum.replace('#', ''),
          orderNumber: orderNum,
          userId: currentUser.id,
          userName: currentUser.name,
          userPhone: currentUser.phone || '0912 345 678',
          canteenId: chosenCanteen.id,
          canteenName: chosenCanteen.name,
          orderType: newOrder.orderType,
          status: 'PENDING',
          paymentMethod,
          finalAmount: totalAmount,
          totalAmount,
          subtotal,
          shippingFee,
          discountAmount,
          items: newOrder.items.map((it) => ({
            productId: it.food.id,
            productName: it.food.name,
            productImage: it.food.image,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            notes: it.notes,
            selectedOptions: it.selectedToppings?.map((t) => ({ optionName: t.name, price: t.price })),
          })),
          tableNumber: tableInfo?.tableName || tableInfo?.tableNumber,
          pickupSlot: pickupTimeSlot,
          deliveryAddressText: deliveryAddress ? `${deliveryAddress.room}, ${deliveryAddress.building}` : undefined,
          notes,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (sockErr) {
      console.warn('[Socket order:place error]:', sockErr);
    }

    // 2. Persist to backend database via REST API
    (async () => {
      try {
        const payload = {
          id: newOrder.id,
          orderCode: newOrder.orderCode,
          orderType: newOrder.orderType === 'PICKUP' ? 'TAKEAWAY' : newOrder.orderType,
          paymentMethod: newOrder.paymentMethod,
          canteenId: chosenCanteen.id,
          canteenName: chosenCanteen.name,
          tableId: tableInfo?.tableCode || tableInfo?.id,
          tableNumber: tableInfo?.tableName || tableInfo?.tableNumber,
          pickupSlot: pickupTimeSlot,
          deliveryAddressText: deliveryAddress
            ? `${deliveryAddress.room}, ${deliveryAddress.building}`
            : newOrder.orderType === 'DELIVERY'
              ? 'KTX Toà A, Phòng 101'
              : undefined,
          notes,
          items: newOrder.items.map((it) => ({
            productId: it.food.id,
            productName: it.food.name,
            productImage: it.food.image,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            notes: it.notes,
          })),
        };
        const res = await orderService.createOrder(payload);
        if (res?.success && res.data?.order) {
          console.log('[Order Created Sync with Backend]:', res.data.order);
        }
      } catch (apiErr) {
        console.warn('[Backend order sync warning]:', apiErr);
      }
    })();

    // Create Notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: `Đặt món thành công ${orderNum}`,
      message: `Đơn ${orderType === 'DINE_IN' ? 'Ăn tại bàn' : orderType === 'PICKUP' ? 'Nhận tại quầy' : 'Giao tận phòng'} đã được tạo. Tổng: ${totalAmount.toLocaleString('vi-VN')}đ`,
      timestamp: 'Vừa xong',
      read: false,
      type: 'ORDER',
      linkOrderId: newOrder.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`🎉 Đặt món thành công! Mã đơn ${orderNum}`, 'success');
    return newOrder;
  };

  // Update Order Status (for Staff/Admin & simulation)
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Sync to backend
    orderService.updateOrderStatus(orderId, newStatus).catch(() => { });

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimeline = order.timeline.map((item) => {
            if (item.status === newStatus) {
              return { ...item, completed: true, time: timeNow };
            }
            return item;
          });

          // System Toast for Student alert simulation
          let notifTitle = `Cập nhật đơn hàng ${order.orderNumber}`;
          let notifMsg = `Trạng thái đơn hàng của bạn đã chuyển thành ${newStatus}`;

          if (newStatus === 'CONFIRMED') {
            notifMsg = `Căng tin ${order.canteenName} đã xác nhận đơn hàng của bạn!`;
          } else if (newStatus === 'PREPARING') {
            notifMsg = `Nhà bếp đang chế biến các món ăn thơm ngon cho bạn...`;
          } else if (newStatus === 'READY') {
            notifMsg = `Món ăn đã sẵn sàng! Mời bạn tới Quầy ${order.canteenName} xuất trình QR code để nhận món.`;
          } else if (newStatus === 'DELIVERING') {
            notifMsg = `Nhân viên căng tin đang di chuyển giao món đến phòng của bạn!`;
          } else if (newStatus === 'SERVED') {
            notifMsg = `Món ăn đã được mang ra Bàn. Chúc bạn ngon miệng!`;
          } else if (newStatus === 'COMPLETED') {
            notifMsg = `Đơn hàng ${order.orderNumber} đã hoàn thành. Hãy để lại đánh giá nhé!`;
          }

          const notif: Notification = {
            id: `notif-${Date.now()}`,
            title: notifTitle,
            message: notifMsg,
            timestamp: 'Vừa xong',
            read: false,
            type: 'ORDER',
            linkOrderId: order.id,
          };
          setNotifications((n) => [notif, ...n]);

          return {
            ...order,
            status: newStatus,
            timeline: updatedTimeline,
          };
        }
        return order;
      })
    );

    showToast(`Đã chuyển trạng thái đơn hàng sang: ${newStatus}`, 'info');
  };

  const cancelOrder = (orderId: string, reason: string = 'Sinh viên hủy đơn') => {
    // Sync to backend so MySQL is updated and Socket.IO order:cancelled is broadcast to Staff/Admin
    orderService.cancelOrder(orderId, reason).catch((err) => {
      console.warn('[cancelOrder backend sync notice]:', err);
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          // If paid via wallet, refund automatically!
          if (o.paymentMethod === 'STUDENT_WALLET' && o.paymentStatus === 'PAID') {
            const refundAmount = o.totalAmount;
            setWalletBalance((b) => b + refundAmount);
            setWalletTransactions((txs) => [
              {
                id: `tx-refund-${Date.now()}`,
                amount: refundAmount,
                type: 'REFUND',
                description: `Hoàn tiền hủy đơn ${o.orderNumber}: ${reason}`,
                date: new Date().toLocaleString('vi-VN'),
                status: 'SUCCESS',
              },
              ...txs,
            ]);
            showToast(`Đã hoàn lại ${refundAmount.toLocaleString('vi-VN')}đ vào Ví Sinh Viên!`, 'success');
          }
          return {
            ...o,
            status: 'CANCELLED',
            notes: o.notes ? `${o.notes} (Hủy: ${reason})` : `Lý do hủy: ${reason}`,
          };
        }
        return o;
      })
    );
    showToast(`Đã hủy đơn hàng #${orderId.slice(-6)}`, 'warning');
  };

  // Favorites
  const toggleFavorite = (foodId: string) => {
    setFavorites((prev) => {
      if (prev.includes(foodId)) {
        showToast('Đã xóa món khỏi danh sách yêu thích', 'info');
        return prev.filter((id) => id !== foodId);
      } else {
        showToast('Đã thêm món vào Yêu thích', 'success');
        return [...prev, foodId];
      }
    });
    userService.toggleFavorite('PRODUCT', foodId).catch(() => { });
  };

  const isFavorite = (foodId: string) => favorites.includes(foodId);

  // Wallet
  const topUpWallet = (amount: number, method: string) => {
    const newBal = walletBalance + amount;
    setWalletBalance(newBal);
    setCurrentUser((prev) => ({ ...prev, walletBalance: newBal }));

    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      amount,
      type: 'TOPUP',
      description: `Nạp tiền vào Ví Sinh Viên qua ${method}`,
      date: new Date().toLocaleString('vi-VN'),
      status: 'SUCCESS',
    };
    setWalletTransactions((prev) => [tx, ...prev]);

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Nạp tiền Ví Sinh Viên thành công! 💳',
      message: `Cộng +${amount.toLocaleString('vi-VN')}đ. Số dư hiện tại: ${newBal.toLocaleString('vi-VN')}đ`,
      timestamp: 'Vừa xong',
      read: false,
      type: 'WALLET',
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Nạp +${amount.toLocaleString('vi-VN')}đ vào Ví Sinh Viên thành công!`, 'success');
    userService.topUpWallet(amount, method).catch(() => { });
  };

  // Notifications
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const markNotifAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    userService.markNotificationRead(notifId).catch(() => { });
  };

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Đã đánh dấu đọc tất cả thông báo', 'info');
  };

  // QR Scanner Handler
  const handleScannedQR = async (qrData: string): Promise<boolean> => {
    const trimmed = qrData.trim().toLowerCase();
    const foundTable = diningTables.find((t: any) =>
      (t.tableCode && t.tableCode.toLowerCase() === trimmed) ||
      (t.id && t.id.toLowerCase() === trimmed) ||
      (t.tableNumber && t.tableNumber.toLowerCase() === trimmed)
    );

    if (foundTable) {
      const tableObj: TableInfo = {
        id: foundTable.id || foundTable.tableCode,
        tableCode: foundTable.tableCode || foundTable.id,
        tableName: foundTable.tableName || foundTable.tableNumber || 'Bàn ăn',
        tableNumber: foundTable.tableNumber || foundTable.tableName,
        canteenId: foundTable.canteenId || 'cant-a',
        canteenName: foundTable.canteenName || 'Căng tin A2',
        status: foundTable.status || 'AVAILABLE',
      };
      setOrderType('DINE_IN');
      setTableInfo(tableObj);
      const foundCanteen = canteens.find((c) => c.id === tableObj.canteenId) || null;
      if (foundCanteen) setSelectedCanteen(foundCanteen);
      setQrScannerOpen(false);
      showToast(
        `Đã nhận diện QR! ${tableObj.canteenName} - ${tableObj.tableName}`,
        'success'
      );
      navigateTo('menu');
      return true;
    }

    try {
      const remoteTable = await tableService.getTableByQr(qrData);
      if (remoteTable) {
        setOrderType('DINE_IN');
        setTableInfo(remoteTable);
        const foundCanteen = canteens.find((c) => c.id === remoteTable.canteenId) || null;
        if (foundCanteen) setSelectedCanteen(foundCanteen);
        setQrScannerOpen(false);
        showToast(
          `Đã nhận diện QR! ${remoteTable.canteenName} - ${remoteTable.tableName}`,
          'success'
        );
        navigateTo('menu');
        return true;
      }
    } catch {
      // ignore
    }

    showToast(`Mã QR "${qrData}" không hợp lệ hoặc chưa được đăng ký trong hệ thống!`, 'error');
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        users,
        login,
        logout,
        register,
        sendOtp,
        verifyOtp,
        registerWithOtp,
        loginWithOtp,
        initiate2faLogin,
        verify2faLogin,
        updateProfile,
        switchUserRole,
        canteens,
        toggleCanteenStatus,
        foods,
        addFood,
        updateFood,
        toggleFoodAvailability,
        deleteFood,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orderType,
        setOrderType,
        selectedCanteen,
        setSelectedCanteen,
        tableInfo,
        setTableInfo,
        pickupTimeSlot,
        setPickupTimeSlot,
        deliveryAddress,
        setDeliveryAddress,
        promotions,
        appliedPromotion,
        applyPromotion,
        removePromotion,
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        favorites,
        toggleFavorite,
        isFavorite,
        walletBalance,
        walletTransactions,
        topUpWallet,
        notifications,
        unreadNotifCount,
        markNotifAsRead,
        markAllNotifsAsRead,
        toasts,
        showToast,
        removeToast,
        qrScannerOpen,
        setQrScannerOpen,
        handleScannedQR,
        walletModalOpen,
        setWalletModalOpen,
        currentView,
        setCurrentView,
        viewParams,
        navigateTo,
        banners,
        flashSales,
        categories,
        diningTables,
        isLoadingData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
