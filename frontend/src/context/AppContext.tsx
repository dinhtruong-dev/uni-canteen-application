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
  Notification,
  WalletTransaction,
  FoodTopping,
  FoodSize,
  PaymentMethod,
  BannerItem,
  FlashSaleItem,
  Category,
} from '../types';
import {
  MOCK_CANTEENS,
  MOCK_FOODS,
  MOCK_PROMOTIONS,
  MOCK_USERS,
  INITIAL_ORDERS,
  MOCK_NOTIFICATIONS,
  MOCK_WALLET_TRANSACTIONS,
  MOCK_TIME_SLOTS,
  MOCK_TABLES,
  MOCK_CATEGORIES,
} from '../data/mockData';
import { initSocket } from '../services/socket.client';
import {
  menuService,
  marketingService,
  tableService,
  orderService,
  authService,
} from '../services/api';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Auth & User
  currentUser: User;
  users: User[];
  login: (email: string) => boolean;
  logout: () => void;
  register: (userData: Partial<User>) => boolean;
  updateProfile: (updatedData: Partial<User>) => void;
  switchUserRole: (role: 'STUDENT' | 'STAFF' | 'ADMIN', canteenId?: string) => void;

  // Canteens & Foods
  canteens: Canteen[];
  toggleCanteenStatus: (canteenId: string) => void;
  foods: FoodItem[];
  addFood: (food: Omit<FoodItem, 'id' | 'rating' | 'reviewCount'>) => void;
  updateFood: (foodId: string, updated: Partial<FoodItem>) => void;
  toggleFoodAvailability: (foodId: string) => void;
  deleteFood: (foodId: string) => void;

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
  handleScannedQR: (qrData: string) => boolean;

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage persistence
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('unieat_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('unieat_current_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[0]; // Student
  });

  const [canteens, setCanteens] = useState<Canteen[]>(() => {
    const saved = localStorage.getItem('unieat_canteens');
    return saved ? JSON.parse(saved) : MOCK_CANTEENS;
  });

  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('unieat_foods');
    return saved ? JSON.parse(saved) : MOCK_FOODS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('unieat_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(MOCK_CANTEENS[0]);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('11:45 - 12:00');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(
    MOCK_USERS[0].savedAddresses[0] || null
  );

  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);

  // Dynamic API Database states
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [diningTables, setDiningTables] = useState<any[]>(MOCK_TABLES);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const [bannersRes, flashSalesRes, vouchersRes, foodsRes, catsRes, tablesRes] = await Promise.allSettled([
        marketingService.getBanners(),
        marketingService.getFlashSales(),
        marketingService.getVouchers(),
        menuService.getProducts(),
        menuService.getCategories(),
        tableService.getTables(),
      ]);

      if (bannersRes.status === 'fulfilled' && bannersRes.value.length > 0) {
        setBanners(bannersRes.value);
      }
      if (flashSalesRes.status === 'fulfilled' && flashSalesRes.value.length > 0) {
        setFlashSales(flashSalesRes.value);
      }
      if (vouchersRes.status === 'fulfilled' && vouchersRes.value.length > 0) {
        setPromotions(vouchersRes.value);
      }
      if (foodsRes.status === 'fulfilled' && foodsRes.value.length > 0) {
        setFoods(foodsRes.value);
      }
      if (catsRes.status === 'fulfilled' && catsRes.value.length > 0) {
        setCategories(catsRes.value);
      }
      if (tablesRes.status === 'fulfilled' && tablesRes.value.length > 0) {
        setDiningTables(tablesRes.value);
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

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('unieat_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('unieat_favorites');
    return saved ? JSON.parse(saved) : ['food-1', 'food-3', 'food-8'];
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return currentUser.walletBalance || 125000;
  });

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('unieat_wallet_tx');
    return saved ? JSON.parse(saved) : MOCK_WALLET_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('unieat_notifs');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<Record<string, any>>({});

  const navigateTo = (view: string, params: Record<string, any> = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Persist important data
  useEffect(() => {
    localStorage.setItem('unieat_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('unieat_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('unieat_canteens', JSON.stringify(canteens));
  }, [canteens]);

  useEffect(() => {
    localStorage.setItem('unieat_foods', JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem('unieat_cart', JSON.stringify(cart));
  }, [cart]);

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

  // Real-time Socket.IO Connection & Event Handlers
  useEffect(() => {
    if (!currentUser) return;
    const socket = initSocket(currentUser.id, currentUser.role);

    // 1. New incoming order (for canteen staff & admin)
    socket.on('order:new', (orderData: any) => {
      console.log('[Socket.IO] New order received by staff:', orderData);
      if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
        showToast(`🔔 Đơn hàng mới: #${orderData.orderCode} - ${orderData.finalAmount?.toLocaleString()}đ`, 'info');
      }
    });

    // 2. Order status update (for students when staff accept/prepare/finish order)
    socket.on('order:status_updated', (orderData: any) => {
      console.log('[Socket.IO] Order status update:', orderData);
      const statusLabels: Record<string, string> = {
        CONFIRMED: 'Đã tiếp nhận',
        PREPARING: 'Đang chuẩn bị',
        READY: 'Đã xong - Mời nhận món',
        DELIVERING: 'Đang giao tận phòng',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
      };
      const label = statusLabels[orderData.status] || orderData.status;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderData.id || o.orderCode === orderData.orderCode ? { ...o, status: orderData.status } : o))
      );

      if (orderData.userId === currentUser.id) {
        showToast(`Đơn hàng #${orderData.orderCode || orderData.id}: ${label}`, 'success');
      }
    });

    // 3. System & Promotional Notifications
    socket.on('notification:received', (notif: any) => {
      setNotifications((prev) => [
        {
          id: notif.id || `notif-${Date.now()}`,
          userId: notif.userId || currentUser.id,
          title: notif.title,
          message: notif.message,
          type: notif.type || 'SYSTEM',
          isRead: false,
          createdAt: notif.createdAt || new Date().toISOString(),
        },
        ...prev,
      ]);
      showToast(`📢 ${notif.title}`, 'info');
    });

    return () => {
      socket.off('order:new');
      socket.off('order:status_updated');
      socket.off('notification:received');
    };
  }, [currentUser?.id, currentUser?.role]);

  // Toast Helpers (Disabled as requested)
  const showToast = (_message: string, _type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    // Toast notifications completely disabled
  };

  const removeToast = (_id: string) => {
    setToasts([]);
  };

  // Auth Operations (JWT + Bcrypt Integration)
  const login = (email: string, password: string = '123456') => {
    // Attempt real backend authentication with JWT & Bcrypt
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.token) {
          localStorage.setItem('unieat_jwt', json.data.token);
        }
      })
      .catch((err) => console.warn('Auth backend sync notice:', err));

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
      if (found.role === 'STAFF') {
        navigateTo('staff-dashboard');
      } else if (found.role === 'ADMIN') {
        navigateTo('admin-dashboard');
      } else {
        navigateTo('home');
      }
      return true;
    }
    showToast('Không tìm thấy tài khoản với Email/Mã sinh viên này!', 'error');
    return false;
  };

  const logout = () => {
    localStorage.removeItem('unieat_jwt');
    showToast('Đã đăng xuất khỏi tài khoản', 'info');
    navigateTo('login');
  };

  const register = (userData: Partial<User>) => {
    // Sync register to backend with Bcrypt password hashing
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name || 'Sinh Viên Mới',
        email: userData.email || 'student@st.university.edu.vn',
        password: 'password123',
        phone: userData.phone || '0987654321',
        role: 'STUDENT',
        studentId: userData.studentId,
        faculty: userData.department,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.token) {
          localStorage.setItem('unieat_jwt', json.data.token);
        }
      })
      .catch((err) => console.warn('Auth register sync notice:', err));

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
      walletBalance: 50000, // Welcome bonus!
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
  };

  const updateProfile = (updatedData: Partial<User>) => {
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast('Đã cập nhật thông tin cá nhân thành công!', 'success');
  };

  const switchUserRole = (role: 'STUDENT' | 'STAFF' | 'ADMIN', canteenId?: string) => {
    if (role === 'STUDENT') {
      const student = users.find((u) => u.role === 'STUDENT') || MOCK_USERS[0];
      setCurrentUser(student);
      setWalletBalance(student.walletBalance);
      showToast('Đã chuyển sang vai trò Sinh Viên', 'info');
      navigateTo('home');
    } else if (role === 'STAFF') {
      const staff = users.find((u) => u.role === 'STAFF') || MOCK_USERS[1];
      const updatedStaff = canteenId ? { ...staff, canteenId } : staff;
      setCurrentUser(updatedStaff);
      showToast(`Đã chuyển sang vai trò Nhân Viên Căng Tin`, 'info');
      navigateTo('staff-dashboard');
    } else if (role === 'ADMIN') {
      const admin = users.find((u) => u.role === 'ADMIN') || MOCK_USERS[2];
      setCurrentUser(admin);
      showToast('Đã chuyển sang vai trò Quản Trị Viên (Admin)', 'info');
      navigateTo('admin-dashboard');
    }
  };

  // Canteens & Foods
  const toggleCanteenStatus = (canteenId: string) => {
    setCanteens((prev) =>
      prev.map((c) => (c.id === canteenId ? { ...c, isOpen: !c.isOpen } : c))
    );
    showToast('Đã cập nhật trạng thái hoạt động căng tin!', 'success');
  };

  const addFood = (foodData: Omit<FoodItem, 'id' | 'rating' | 'reviewCount'>) => {
    const newFood: FoodItem = {
      ...foodData,
      id: `food-${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
    };
    setFoods((prev) => [newFood, ...prev]);
    showToast(`Đã thêm món "${newFood.name}" vào menu!`, 'success');
  };

  const updateFood = (foodId: string, updated: Partial<FoodItem>) => {
    setFoods((prev) => prev.map((f) => (f.id === foodId ? { ...f, ...updated } : f)));
    showToast('Đã cập nhật thông tin món ăn', 'success');
  };

  const toggleFoodAvailability = (foodId: string) => {
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id === foodId) {
          const nextState = !f.isAvailable;
          showToast(`Đã đổi trạng thái món thành: ${nextState ? 'Còn hàng' : 'Hết hàng'}`, 'info');
          return { ...f, isAvailable: nextState };
        }
        return f;
      })
    );
  };

  const deleteFood = (foodId: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== foodId));
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

    const chosenCanteen = selectedCanteen || MOCK_CANTEENS[0];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
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
        showToast('Đã thêm món vào Yêu thích ❤️', 'success');
        return [...prev, foodId];
      }
    });
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
  };

  // Notifications
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const markNotifAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Đã đánh dấu đọc tất cả thông báo', 'info');
  };

  // QR Scanner Handler
  const handleScannedQR = (qrData: string): boolean => {
    // Try matching Table code
    const foundTable = MOCK_TABLES.find(
      (t) => t.tableCode.toLowerCase() === qrData.trim().toLowerCase()
    );

    if (foundTable) {
      setOrderType('DINE_IN');
      setTableInfo(foundTable);
      const foundCanteen = canteens.find((c) => c.id === foundTable.canteenId) || null;
      if (foundCanteen) setSelectedCanteen(foundCanteen);
      setQrScannerOpen(false);
      showToast(
        `🎉 Đã nhận diện QR! ${foundTable.canteenName} - ${foundTable.tableName}`,
        'success'
      );
      navigateTo('menu');
      return true;
    }

    showToast(`Mã QR "${qrData}" không hợp lệ hoặc chưa được đăng ký trong hệ thống!`, 'error');
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        register,
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
