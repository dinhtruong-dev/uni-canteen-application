import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, FoodItem } from '../types';
import { OnlinePaymentModal } from '../components/OnlinePaymentModal';
import {
  ArrowLeft,
  X,
  Search,
  Gift,
  CreditCard,
  MapPin,
  Pencil,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  ShieldCheck,
  FileText,
  Check,
  Ticket,
  Package,
  Info,
  Banknote,
  Wallet,
  QrCode,
  Smartphone,
  Navigation,
  Clock,
  Building2,
  Phone,
  User,
  Sparkles,
  HelpCircle,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Suggested items for "Cho bữa ăn thêm tròn vị!" matching the user screenshot
interface SuggestedAddon {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const SUGGESTED_ADDONS: SuggestedAddon[] = [
  {
    id: 'addon-tra-tac',
    name: 'Trà Tắc',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400',
    category: 'Đồ uống',
  },
  {
    id: 'addon-com-bi-cha',
    name: 'Cơm Tấm Sườn Bì Chả',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
    category: 'Món chính',
  },
  {
    id: 'addon-com-suon-trung',
    name: 'Cơm Tấm Sườn Trứng',
    price: 66000,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    category: 'Món chính',
  },
  {
    id: 'addon-canh-rong-bien',
    name: 'Canh Rong Biển',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400',
    category: 'Món phụ',
  },
  {
    id: 'addon-trung-op-la',
    name: 'Trứng Ốp La Lòng Đào',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400',
    category: 'Topping',
  },
  {
    id: 'addon-tra-dao',
    name: 'Trà Đào Cam Sả',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400',
    category: 'Đồ uống',
  },
];

type CheckoutSubPage =
  | 'main'
  | 'address'
  | 'payment'
  | 'voucher'
  | 'delivery'
  | 'invoice'
  | 'insurance'
  | 'note';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    addToCart,
    updateCartQuantity,
    selectedCanteen,
    orderType,
    setOrderType,
    deliveryAddress,
    setDeliveryAddress,
    walletBalance,
    appliedPromotion,
    applyPromotion,
    removePromotion,
    promotions,
    createOrder,
    navigateTo,
    currentUser,
    showToast,
  } = useApp();

  // Active page state: 'main' or full-screen sub-page (No popups)
  const [activePage, setActivePage] = useState<CheckoutSubPage>('main');

  // If cart is empty when opening, automatically seed the item shown in the user screenshot: "Cơm Tấm Sườn Nướng" 62.000đ
  useEffect(() => {
    if (cart.length === 0) {
      const defaultItem: FoodItem = {
        id: 'food-suon-nuong',
        name: 'Cơm Tấm Sườn Nướng',
        price: 62000,
        categoryId: 'cat-1',
        categoryName: 'Cơm Tấm Sườn',
        canteenId: selectedCanteen?.id || 'cant-a',
        canteenName: 'Cơm Tấm Sườn Đông Dương - Đình Thôn',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
        description: 'Sườn cốt lết nướng mật ong than hồng thơm lừng, cơm tấm dẻo, mỡ hành tép mỡ giòn.',
        ingredients: ['Sườn cốt lết', 'Cơm tấm', 'Mỡ hành', 'Nước mắm chua ngọt'],
        preparationTime: 10,
        isAvailable: true,
        rating: 4.9,
        reviewCount: 260,
      };
      addToCart(defaultItem, 1);
    }
  }, []);

  // Delivery Address info matching screenshot
  const [addressData, setAddressData] = useState({
    street: deliveryAddress?.building
      ? `${deliveryAddress.room}, ${deliveryAddress.building}`
      : 'Phòng 402, Tòa A1, Ký Túc Xá Sinh Viên ĐHQG',
    customerName: currentUser?.name || 'Đinh Văn Trường',
    phone: deliveryAddress?.phone || currentUser?.phone || '+84339104921',
    distance: '0.2km',
    driverNote: deliveryAddress?.note || 'Gọi trước khi đến cổng, giao tận cửa phòng',
    building: deliveryAddress?.building || 'Ký Túc Xá A1',
    room: deliveryAddress?.room || 'Phòng 402',
  });

  // State management
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [greenCareEnabled, setGreenCareEnabled] = useState(true);

  // Note editing state for a cart item
  const [editingItemNote, setEditingItemNote] = useState<{ id: string; name: string; note: string } | null>(null);

  // Coupon code input
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Invoice state
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [companyName, setCompanyName] = useState('Công ty Cổ phần Công nghệ UniEat Việt Nam');
  const [taxCode, setTaxCode] = useState('0108923412');
  const [companyAddress, setCompanyAddress] = useState('Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội');
  const [invoiceEmail, setInvoiceEmail] = useState('truong.dinh@example.com');

  // Online Payment Gateway Modal
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const [pendingGatewayOrder, setPendingGatewayOrder] = useState<{
    id: string;
    orderCode: string;
    amount: number;
    provider: 'VNPAY' | 'MOMO';
  } | null>(null);

  // Price calculations
  const itemsSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = orderType === 'DELIVERY' ? 20000 : 0;
  const serviceFee = 4000;
  const insuranceFee = greenCareEnabled ? 1000 : 0;

  // Discount calculation
  let promoDiscount = 0;
  if (appliedPromotion) {
    if (itemsSubtotal >= appliedPromotion.minOrderValue) {
      if (appliedPromotion.discountType === 'PERCENT') {
        const val = (itemsSubtotal * appliedPromotion.discountValue) / 100;
        promoDiscount = appliedPromotion.maxDiscount ? Math.min(val, appliedPromotion.maxDiscount) : val;
      } else {
        promoDiscount = appliedPromotion.discountValue;
      }
    }
  }

  const finalTotalAmount = Math.max(0, itemsSubtotal + shippingFee + serviceFee + insuranceFee - promoDiscount);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle Add-on to cart
  const handleAddAddon = (addon: SuggestedAddon) => {
    const foodObj: FoodItem = {
      id: addon.id,
      name: addon.name,
      price: addon.price,
      categoryId: 'cat-addon',
      categoryName: addon.category,
      canteenId: selectedCanteen?.id || 'cant-a',
      canteenName: selectedCanteen?.name || 'Cơm Tấm Sườn Đông Dương - Đình Thôn',
      image: addon.image,
      description: addon.name,
      ingredients: [addon.name],
      preparationTime: 5,
      isAvailable: true,
      rating: 4.8,
      reviewCount: 45,
    };
    addToCart(foodObj, 1);
    showToast(`Đã thêm "${addon.name}" (+${addon.price.toLocaleString('vi-VN')}đ) vào đơn!`, 'success');
  };

  // Handle Order Submit
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      showToast('Giỏ hàng trống! Vui lòng chọn món trước khi đặt.', 'warning');
      return;
    }

    const fullOrderNotes = [
      invoiceRequested ? `[Xuất VAT: MST ${taxCode} - ${companyName}]` : '',
      greenCareEnabled ? '[Bảo hiểm GreenCare]' : '',
    ]
      .filter(Boolean)
      .join('; ');

    const created = createOrder(paymentMethod, fullOrderNotes);
    if (!created) return;

    if (paymentMethod === 'VNPAY_QR') {
      setPendingGatewayOrder({
        id: created.id,
        orderCode: created.orderCode || created.id,
        amount: finalTotalAmount,
        provider: 'VNPAY',
      });
      setOnlineModalOpen(true);
    } else if (paymentMethod === 'MOMO') {
      setPendingGatewayOrder({
        id: created.id,
        orderCode: created.orderCode || created.id,
        amount: finalTotalAmount,
        provider: 'MOMO',
      });
      setOnlineModalOpen(true);
    } else {
      showToast('🎉 Đặt đơn thành công! Đang chuyển tới trạng thái đơn hàng...', 'success');
      navigateTo('order-tracking', { orderId: created.id });
    }
  };

  // Payment method labels
  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case 'CASH':
        return 'Tiền mặt/QR';
      case 'E_GREEN':
      case 'STUDENT_WALLET':
        return `Thẻ E-Green (${walletBalance.toLocaleString('vi-VN')}đ)`;
      case 'APPLE_PAY':
        return 'Apple Pay';
      case 'MOMO':
        return 'MoMo **4921';
      case 'VNPAY_QR':
        return 'VNPAY / VietQR';
      case 'CREDIT_CARD':
        return 'Thẻ quốc tế';
      case 'SHOPEEPAY':
        return 'ShopeePay';
      case 'ZALOPAY':
        return 'Zaloypay';
      default:
        return 'Tiền mặt/QR';
    }
  };

  // Delivery / receiving method label
  const getDeliveryMethodDisplay = () => {
    if (orderType === 'DELIVERY') {
      return 'Green Food (12 - 22 phút)';
    }
    if (orderType === 'DINE_IN') {
      return 'Ăn tại bàn (Căng tin)';
    }
    return 'Nhận tại quầy (Tự lấy)';
  };

  // ==========================================
  // SUB-PAGE 1: ĐỊA CHỈ GIAO HÀNG (FULL PAGE)
  // ==========================================
  if (activePage === 'address') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setActivePage('main')}
            className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-[17px] font-bold text-slate-900">Địa chỉ nhận hàng</h1>
          <div className="w-6" />
        </header>

        <main className="p-4 space-y-4">
          {/* Quick preset addresses */}
          <div>
            <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Địa chỉ gợi ý / Đã lưu
            </h2>
            <div className="space-y-2">
              {[
                {
                  title: 'Đình Thôn (Vị trí hiện tại)',
                  detail: '3 Ngõ 119 Đình Thôn, Phường Mỹ Đình 1, Quận Nam Từ Liêm, Hà Nội',
                  tag: 'Mặc định',
                  distance: '0.38km',
                },
                {
                  title: 'Ký Túc Xá Sinh Viên - Tòa A3',
                  detail: 'Phòng 402, Tòa A3, KTX Đại học Quốc Gia Hà Nội',
                  tag: 'KTX',
                  distance: '1.2km',
                },
                {
                  title: 'Nhà Thư Viện Trung Tâm',
                  detail: 'Bàn tự học tầng 2, Thư viện Đại học',
                  tag: 'Khu tự học',
                  distance: '0.8km',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setAddressData((prev) => ({
                      ...prev,
                      street: item.detail,
                      distance: item.distance,
                    }));
                    showToast(`Đã chọn địa chỉ: ${item.title}`, 'info');
                  }}
                  className={`p-3.5 bg-white rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    addressData.street === item.detail
                      ? 'border-[#22c3d3] ring-2 ring-[#22c3d3]/15 bg-[#f5fcfc]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4 text-[#22c3d3]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-bold text-[#22c3d3] bg-[#e6f8fa] px-1.5 py-0.5 rounded-md">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600 mt-1 leading-snug">{item.detail}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Cách căng tin: {item.distance}</p>
                    </div>
                  </div>
                  {addressData.street === item.detail && (
                    <div className="w-5 h-5 rounded-full bg-[#22c3d3] text-white flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form edit */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <h2 className="text-[14px] font-bold text-slate-900">Chỉnh sửa chi tiết địa chỉ</h2>

            <div>
              <label className="text-[12px] font-semibold text-slate-600 block mb-1">
                Địa chỉ chi tiết (Số nhà, Ngõ/Đường, Phường, Quận):
              </label>
              <textarea
                rows={3}
                value={addressData.street}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, street: e.target.value }))
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Tên người nhận
                </label>
                <input
                  type="text"
                  value={addressData.customerName}
                  onChange={(e) =>
                    setAddressData((prev) => ({ ...prev, customerName: e.target.value }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
                </label>
                <input
                  type="text"
                  value={addressData.phone}
                  onChange={(e) =>
                    setAddressData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-slate-600 block mb-1">
                Ghi chú cho tài xế giao hàng:
              </label>
              <input
                type="text"
                placeholder="VD: Để trước cửa phòng, gọi điện khi tới nơi..."
                value={addressData.driverNote}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, driverNote: e.target.value }))
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
              />
            </div>
          </div>
        </main>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md sm:max-w-lg mx-auto">
            <button
              onClick={() => {
                if (deliveryAddress) {
                  setDeliveryAddress({
                    ...deliveryAddress,
                    phone: addressData.phone,
                    note: addressData.driverNote,
                  });
                }
                setActivePage('main');
                showToast('Đã lưu địa chỉ giao hàng thành công!', 'success');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#22c3d3] hover:bg-[#1db3c1] text-white font-bold text-[15px] transition-all cursor-pointer shadow-md shadow-[#22c3d3]/20"
            >
              Lưu & Tiếp tục
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SUB-PAGE 2: PHƯƠNG THỨC THANH TOÁN (FULL PAGE - MATCHING SCREENSHOT 2)
  // ==========================================
  if (activePage === 'payment') {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-20 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setActivePage('main')}
            className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>
          <h1 className="text-[17px] font-bold text-slate-900">Phương thức thanh toán</h1>
          <div className="w-6" />
        </header>

        <main className="p-4 space-y-6">
          {/* Nhóm 1: Phương thức khác */}
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-3 px-1">Phương thức khác</h2>
            <div className="space-y-3">
              {/* Tiền mặt/QR */}
              <div
                onClick={() => {
                  setPaymentMethod('CASH');
                  showToast('Đã chọn Tiền mặt/QR', 'success');
                  setActivePage('main');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className="text-[15px] font-semibold text-slate-900">Tiền mặt/QR</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-[#22c3d3] bg-[#22c3d3]'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'CASH' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* Thẻ E-Green */}
              <div
                onClick={() => {
                  setPaymentMethod('E_GREEN');
                  showToast('Đã chọn Thẻ E-Green', 'success');
                  setActivePage('main');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-[15px] font-semibold text-slate-900 block">Thẻ E-Green</span>
                    <span className="text-[13px] text-slate-500 font-normal">
                      {walletBalance > 0 ? `${walletBalance.toLocaleString('vi-VN')}đ` : '0đ'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast('Chức năng nạp tiền Thẻ E-Green đang kết nối cổng ngân hàng...', 'info');
                    }}
                    className="text-[13px] font-bold text-[#22c3d3] hover:underline cursor-pointer"
                  >
                    Nạp tiền
                  </button>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === 'E_GREEN' || paymentMethod === 'STUDENT_WALLET'
                        ? 'border-[#22c3d3] bg-[#22c3d3]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {(paymentMethod === 'E_GREEN' || paymentMethod === 'STUDENT_WALLET') && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nhóm 2: Thẻ Tín dụng/Ghi nợ */}
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-3 px-1">Thẻ Tín dụng/Ghi nợ</h2>
            <div className="p-3.5 rounded-2xl flex items-center justify-between opacity-70 bg-slate-50/50">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#ccfbf1] text-[#0d9488] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[15px] font-semibold text-slate-500 block">Thẻ ATM</span>
                  <span className="text-[12px] text-slate-400 font-normal">
                    Dịch vụ chưa hỗ trợ hình thức thanh toán này
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Nhóm 3: Ví điện tử */}
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-3 px-1">Ví điện tử</h2>
            <div className="space-y-3">
              {/* Apple Pay */}
              <div
                onClick={() => {
                  setPaymentMethod('APPLE_PAY');
                  showToast('Đã chọn Apple Pay', 'success');
                  setActivePage('main');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 font-bold text-xs tracking-tight">
                    <span>Pay</span>
                  </div>
                  <span className="text-[15px] font-semibold text-slate-900">Apple Pay</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    paymentMethod === 'APPLE_PAY'
                      ? 'border-[#22c3d3] bg-[#22c3d3]'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'APPLE_PAY' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* MoMo **4921 */}
              <div
                onClick={() => {
                  setPaymentMethod('MOMO');
                  showToast('Đã chọn Ví MoMo **4921', 'success');
                  setActivePage('main');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#a50064] text-white flex flex-col items-center justify-center shrink-0 font-black text-[9px] leading-tight select-none shadow-xs">
                    <span>mo</span>
                    <span>mo</span>
                  </div>
                  <span className="text-[15px] font-semibold text-slate-900">MoMo **4921</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    paymentMethod === 'MOMO'
                      ? 'border-[#22c3d3] bg-[#22c3d3]'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {paymentMethod === 'MOMO' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </div>

          {/* Nhóm 4: Thêm phương thức thanh toán */}
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-3 px-1">Thêm phương thức thanh toán</h2>
            <div className="space-y-3">
              {/* Thẻ quốc tế */}
              <div
                onClick={() => {
                  setPaymentMethod('CREDIT_CARD');
                  showToast('Đã liên kết Thẻ quốc tế', 'success');
                  setActivePage('main');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[15px] font-semibold text-slate-900">Thẻ quốc tế</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#e6f8fa] text-[#22c3d3] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* ShopeePay */}
              <div
                onClick={() => {
                  setPaymentMethod('SHOPEEPAY');
                  showToast('Đã liên kết Ví ShopeePay', 'success');
                  setActivePage('main');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#ee4d2d] text-white flex items-center justify-center shrink-0 font-black text-base select-none shadow-xs">
                    <span>S</span>
                  </div>
                  <span className="text-[15px] font-semibold text-slate-900">ShopeePay</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#e6f8fa] text-[#22c3d3] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Zaloypay */}
              <div
                onClick={() => {
                  setPaymentMethod('ZALOPAY');
                  showToast('Đã liên kết Ví Zalopay', 'success');
                  setActivePage('main');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f9ff] border border-blue-100 flex flex-col items-center justify-center shrink-0 font-black text-[8px] leading-tight select-none">
                    <span className="text-blue-600">Zalo</span>
                    <span className="text-emerald-500 font-bold">pay</span>
                  </div>
                  <span className="text-[15px] font-semibold text-slate-900">Zaloypay</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#e6f8fa] text-[#22c3d3] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // SUB-PAGE 3: ƯU ĐÃI & KHUYẾN MÃI (FULL PAGE - MATCHING SCREENSHOT 1)
  // ==========================================
  if (activePage === 'voucher') {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setActivePage('main')}
            className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>
          <h1 className="text-[17px] font-bold text-slate-900">Ưu đãi</h1>
          <div className="w-6" />
        </header>

        <main className="p-4 space-y-4">
          {/* Ô tìm kiếm / Nhập mã thẻ quà tặng */}
          <div className="relative">
            <div className="flex items-center bg-[#f1f5f9] rounded-2xl px-3.5 py-3 border border-transparent focus-within:border-[#22c3d3] focus-within:bg-white transition-all">
              <Gift className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="Nhập mã thẻ quà tặng"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && couponInput.trim()) {
                    const res = applyPromotion(couponInput.trim());
                    if (res.success) {
                      setCouponInput('');
                      showToast(`Đã áp dụng mã ${couponInput}!`, 'success');
                      setActivePage('main');
                    } else {
                      setCouponError(res.message);
                    }
                  }
                }}
                className="w-full bg-transparent text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
              {couponInput.trim() && (
                <button
                  onClick={() => {
                    const res = applyPromotion(couponInput.trim());
                    if (res.success) {
                      setCouponInput('');
                      showToast(`Đã áp dụng mã ${couponInput}!`, 'success');
                      setActivePage('main');
                    } else {
                      setCouponError(res.message);
                    }
                  }}
                  className="ml-2 px-3 py-1 bg-[#22c3d3] text-white text-[12px] font-bold rounded-lg cursor-pointer shrink-0 shadow-2xs"
                >
                  Áp dụng
                </button>
              )}
            </div>
            {couponError && (
              <p className="text-[12px] text-rose-500 font-semibold mt-1 px-1">{couponError}</p>
            )}
          </div>

          {/* Tiêu đề nhóm: Tất cả ưu đãi */}
          <div className="pt-1">
            <h2 className="text-[16px] font-bold text-slate-900 mb-3 px-0.5">Tất cả ưu đãi</h2>

            <div className="space-y-3.5">
              {promotions.map((promo, idx) => {
                const isSelected = appliedPromotion?.id === promo.id;

                // Phong cách tem voucher chuẩn theo Screenshot 1
                let badgeStyle = (
                  <div className="w-16 h-16 rounded-2xl bg-[#fff2e8] border border-[#ffbb96] flex flex-col items-center justify-center p-1 shrink-0 text-center shadow-2xs">
                    <div className="w-4 h-4 rounded-full bg-[#ff4d4f] text-white flex items-center justify-center text-[9px] font-black mb-0.5">
                      ★
                    </div>
                    <span className="text-[10px] font-black text-[#d4380d] leading-tight uppercase">
                      Ưu Đãi<br />Từ Quán
                    </span>
                  </div>
                );

                if (promo.code === 'GIAM20' || promo.code === 'GIAM18' || promo.code === 'GIAM15') {
                  badgeStyle = (
                    <div className="w-16 h-16 rounded-2xl bg-[#e6fffb] border border-[#87e8de] flex flex-col items-center justify-center p-1 shrink-0 text-center shadow-2xs relative">
                      <div className="w-7 h-7 rounded-full bg-[#13c2c2]/20 flex items-center justify-center text-base mb-0.5">
                        🍲
                      </div>
                      <span className="text-[9px] font-black bg-[#ff7a45] text-white px-1.5 py-0.2 rounded-full uppercase">
                        % OFF
                      </span>
                    </div>
                  );
                } else if (promo.code === 'TROLAI12K') {
                  badgeStyle = (
                    <div className="w-16 h-16 rounded-2xl bg-[#e6f7ff] border border-[#91d5ff] flex flex-col items-center justify-center p-1 shrink-0 text-center shadow-2xs">
                      <div className="text-xl mb-0.5">🛵</div>
                      <span className="text-[8.5px] font-black text-[#096dd9] leading-tight text-center">
                        Mừng Bạn<br />Trở Lại
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={promo.id || idx}
                    onClick={() => {
                      if (isSelected) {
                        removePromotion();
                        showToast('Đã bỏ chọn ưu đãi', 'info');
                      } else {
                        applyPromotion(promo.code);
                        showToast(`Đã áp dụng: ${promo.title}`, 'success');
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#22c3d3] bg-[#f5fcfc] ring-2 ring-[#22c3d3]/20 shadow-xs'
                        : 'border-slate-200/90 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Tem voucher bên trái */}
                    {badgeStyle}

                    {/* Tiêu đề & điều kiện */}
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="text-[13.5px] font-semibold text-slate-800 leading-snug">
                        {promo.title}
                      </p>
                      {promo.minOrderValue > 0 && itemsSubtotal < promo.minOrderValue && (
                        <p className="text-[11px] text-amber-600 font-medium mt-1">
                          (Đơn tối thiểu: {promo.minOrderValue.toLocaleString('vi-VN')}đ)
                        </p>
                      )}
                    </div>

                    {/* Checkbox vuông bo tròn bên phải */}
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'border-[#22c3d3] bg-[#22c3d3] text-white shadow-2xs'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Nút Bỏ qua / Áp dụng cố định dưới đáy */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md sm:max-w-lg mx-auto">
            <button
              onClick={() => {
                setActivePage('main');
                if (appliedPromotion) {
                  showToast(`Đã áp dụng ưu đãi: ${appliedPromotion.title}`, 'success');
                }
              }}
              className="w-full py-3.5 rounded-full border-1.5 border-[#22c3d3] bg-white hover:bg-[#e6f8fa] text-[#22c3d3] font-bold text-[15px] transition-all cursor-pointer shadow-xs active:scale-98"
            >
              {appliedPromotion ? 'Áp dụng' : 'Bỏ qua'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SUB-PAGE 4: HÌNH THỨC NHẬN HÀNG (FULL PAGE)
  // ==========================================
  if (activePage === 'delivery') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setActivePage('main')}
            className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>
          <h1 className="text-[17px] font-bold text-slate-900">Hình thức nhận hàng</h1>
          <div className="w-6" />
        </header>

        <main className="p-4 space-y-4">
          <div className="space-y-3">
            {/* 1. Green Food */}
            <div
              onClick={() => {
                setOrderType('DELIVERY');
                showToast('Đã chọn hình thức Green Food (Giao tận nơi)', 'info');
              }}
              className={`p-4 bg-white rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                orderType === 'DELIVERY'
                  ? 'border-[#22c3d3] ring-2 ring-[#22c3d3]/15 bg-[#f5fcfc]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#e6f8fa] text-[#22c3d3] flex items-center justify-center shrink-0 font-bold text-xl">
                  🛵
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-900">
                      Green Food (Giao tận phòng/nơi)
                    </p>
                    <span className="text-[10px] font-bold text-[#22c3d3] bg-[#e6f8fa] px-2 py-0.5 rounded-full">
                      Phổ biến nhất
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 mt-1">
                    Phí giao: 20.000đ • Thời gian: 12 - 22 phút
                  </p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-snug">
                    Tài xế nhận món từ căng tin và giao trực tiếp đến phòng KTX, giảng đường hoặc địa chỉ của bạn.
                  </p>
                </div>
              </div>
              {orderType === 'DELIVERY' && (
                <div className="w-6 h-6 rounded-full bg-[#22c3d3] text-white flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>

            {/* 2. Ăn tại bàn */}
            <div
              onClick={() => {
                setOrderType('DINE_IN');
                showToast('Đã chọn hình thức Ăn tại bàn (Quét mã QR Bàn)', 'info');
              }}
              className={`p-4 bg-white rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                orderType === 'DINE_IN'
                  ? 'border-[#22c3d3] ring-2 ring-[#22c3d3]/15 bg-[#f5fcfc]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 font-bold text-xl">
                  🍽️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-900">Ăn tại bàn (Căng tin)</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Miễn phí 0đ
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 mt-1">
                    Phục vụ ngay tại bàn căng tin
                  </p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-snug">
                    Ngồi tại bàn, nhân viên bếp sẽ chuẩn bị và mang món nóng hổi ra bàn phục vụ bạn.
                  </p>
                </div>
              </div>
              {orderType === 'DINE_IN' && (
                <div className="w-6 h-6 rounded-full bg-[#22c3d3] text-white flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>

            {/* 3. Nhận tại quầy */}
            <div
              onClick={() => {
                setOrderType('PICKUP');
                showToast('Đã chọn hình thức Nhận tại quầy (Tự lấy mang về)', 'info');
              }}
              className={`p-4 bg-white rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                orderType === 'PICKUP'
                  ? 'border-[#22c3d3] ring-2 ring-[#22c3d3]/15 bg-[#f5fcfc]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xl">
                  🏃
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-slate-900">Nhận tại quầy (Tự lấy)</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Miễn phí 0đ
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 mt-1">
                    Tiết kiệm thời gian, lấy đồ nhanh
                  </p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-snug">
                    Bếp đóng gói sẵn, bạn chỉ việc tới quầy đọc mã đơn hàng và nhận món mang đi.
                  </p>
                </div>
              </div>
              {orderType === 'PICKUP' && (
                <div className="w-6 h-6 rounded-full bg-[#22c3d3] text-white flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md sm:max-w-lg mx-auto">
            <button
              onClick={() => {
                setActivePage('main');
                showToast(`Đã chọn: ${getDeliveryMethodDisplay()}`, 'success');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#22c3d3] hover:bg-[#1db3c1] text-white font-bold text-[15px] transition-all cursor-pointer shadow-md shadow-[#22c3d3]/20"
            >
              Xác nhận hình thức
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SUB-PAGE 5: XUẤT HÓA ĐƠN & DỊCH VỤ BỔ SUNG (FULL PAGE)
  // ==========================================
  if (activePage === 'invoice') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setActivePage('main')}
            className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-[17px] font-bold text-slate-900">Hóa đơn & Dịch vụ bổ sung</h1>
          <div className="w-6" />
        </header>

        <main className="p-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-[15px] font-bold text-slate-900">Yêu cầu xuất hóa đơn điện tử (VAT)</p>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Hóa đơn tài chính hợp lệ sẽ được gửi qua email
                </p>
              </div>
              <button
                onClick={() => setInvoiceRequested(!invoiceRequested)}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  invoiceRequested ? 'bg-[#22c3d3]' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={invoiceRequested}
              >
                <span
                  className={`w-6 h-6 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform flex items-center justify-center text-[#22c3d3] text-[10px] font-bold ${
                    invoiceRequested ? 'left-5.5' : 'left-0.5'
                  }`}
                >
                  {invoiceRequested && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>
            </div>

            {invoiceRequested && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-1">
                    Tên công ty / Đơn vị tổ chức:
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 block mb-1">
                      Mã số thuế (MST):
                    </label>
                    <input
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 block mb-1">
                      Email nhận hóa đơn:
                    </label>
                    <input
                      type="email"
                      value={invoiceEmail}
                      onChange={(e) => setInvoiceEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-1">
                    Địa chỉ đăng ký kinh doanh:
                  </label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="text-[14px] font-bold text-slate-900">Dụng cụ ăn uống & Bao bì thân thiện</h3>
            <p className="text-[12px] text-slate-500 leading-snug">
              Căng tin mặc định cung cấp hộp bã mía tự hủy sinh học và muỗng/đũa gỗ miễn phí theo tiêu chuẩn xanh bảo vệ môi trường học đường.
            </p>
          </div>
        </main>

        {/* Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md sm:max-w-lg mx-auto">
            <button
              onClick={() => {
                setActivePage('main');
                showToast('Đã lưu thông tin hóa đơn!', 'success');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#22c3d3] hover:bg-[#1db3c1] text-white font-bold text-[15px] transition-all cursor-pointer shadow-md shadow-[#22c3d3]/20"
            >
              Lưu & Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SUB-PAGE 6: BẢO VỆ ĐƠN HÀNG GREENCARE (FULL PAGE)
  // ==========================================
  if (activePage === 'insurance') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setActivePage('main')}
            className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-[17px] font-bold text-slate-900">Bảo hiểm GreenCare</h1>
          <div className="w-6" />
        </header>

        <main className="p-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#e6f8fa] text-[#22c3d3] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h2 className="text-[18px] font-bold text-slate-900">Bảo vệ đơn hàng với GreenCare</h2>
            <p className="text-[13px] text-slate-600 max-w-sm mx-auto leading-relaxed">
              Chương trình bảo hiểm phối hợp độc quyền cùng Tổng Công ty Bảo hiểm PVI với mức phí chỉ <strong>1.000đ/đơn</strong>.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-[14px] font-bold text-slate-900">Quyền lợi chi tiết</h3>
            <div className="space-y-3 text-[13px] text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong>Bồi thường 100% món bị đổ vỡ hoặc thất lạc:</strong> Hoàn tiền ngay lập tức vào Ví Sinh Viên hoặc tài khoản nếu quá trình vận chuyển xảy ra sự cố.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong>Đảm bảo giao đúng giờ hẹn:</strong> Hoàn voucher 30.000đ nếu đơn hàng giao trễ hơn 30 phút so với dự kiến.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong>Bảo hiểm an toàn thực phẩm:</strong> Cam kết chất lượng nguồn nguyên liệu chuẩn VietGAP từ các bếp ăn căng tin trường.
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md sm:max-w-lg mx-auto">
            <button
              onClick={() => setActivePage('main')}
              className="w-full py-3.5 rounded-2xl bg-[#22c3d3] hover:bg-[#1db3c1] text-white font-bold text-[15px] transition-all cursor-pointer shadow-md shadow-[#22c3d3]/20"
            >
              Đã hiểu & Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SUB-PAGE 7: GHI CHÚ MÓN ĂN (FULL PAGE)
  // ==========================================
  if (activePage === 'note' && editingItemNote) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setActivePage('main')}
            className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-[17px] font-bold text-slate-900">Ghi chú cho quán</h1>
          <div className="w-6" />
        </header>

        <main className="p-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <p className="text-[12px] font-semibold text-slate-500">Món đang chọn:</p>
              <h2 className="text-[16px] font-bold text-slate-900">{editingItemNote.name}</h2>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-700 block mb-1.5">
                Nhập chi tiết yêu cầu chế biến:
              </label>
              <textarea
                rows={4}
                placeholder="VD: Không lấy ớt, nhiều mỡ hành, nước mắm để riêng, nhiều cơm..."
                value={editingItemNote.note}
                onChange={(e) =>
                  setEditingItemNote((prev) => (prev ? { ...prev, note: e.target.value } : null))
                }
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
              />
            </div>

            {/* Quick tags */}
            <div>
              <p className="text-[12px] font-bold text-slate-600 mb-2">Gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Không ớt cay',
                  'Nhiều mỡ hành',
                  'Nước chấm để riêng',
                  'Nhiều cơm',
                  'Ít cơm',
                  'Không hành lá',
                  'Nước mắm ngọt',
                  'Thêm nước súp',
                ].map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setEditingItemNote((prev) => {
                        if (!prev) return null;
                        const current = prev.note.trim();
                        const next = current ? `${current}, ${tag}` : tag;
                        return { ...prev, note: next };
                      });
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-[#e6f8fa] hover:text-[#22c3d3] text-slate-700 rounded-xl text-[12px] font-medium transition-all cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md sm:max-w-lg mx-auto">
            <button
              onClick={() => {
                if (editingItemNote) {
                  const target = cart.find((c) => c.id === editingItemNote.id);
                  if (target) {
                    target.notes = editingItemNote.note;
                  }
                }
                setActivePage('main');
                showToast('Đã lưu ghi chú món ăn!', 'success');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#22c3d3] hover:bg-[#1db3c1] text-white font-bold text-[15px] transition-all cursor-pointer shadow-md shadow-[#22c3d3]/20"
            >
              Lưu ghi chú
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN CHECKOUT VIEW (EXACTLY AS SCREENSHOT)
  // ==========================================
  return (
    <div className="min-h-screen bg-white text-slate-900 pb-36 max-w-md sm:max-w-lg mx-auto relative font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={() => navigateTo('cart')}
          className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="text-center flex-1 px-2">
          <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Thanh toán</h1>
          <p className="text-[12px] text-slate-500 font-normal truncate mt-0.5">
            {selectedCanteen?.name || 'Cơm Tấm Sườn Đông Dương - Đình Thôn'}
          </p>
        </div>

        <div className="w-6" />
      </header>

      {/* Main Content Sections */}
      <main className="px-4 py-4 space-y-4">
        {/* 1. Location / Address Card - clicking opens 'address' page */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div
            onClick={() => setActivePage('address')}
            className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="mt-0.5 text-slate-500 shrink-0">
              <MapPin className="w-5 h-5 fill-slate-500 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2">
                {addressData.street}
              </p>
              <p className="text-[12px] text-slate-500 font-normal mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{addressData.customerName}</span>
                <span>•</span>
                <span>{addressData.phone}</span>
                <span>•</span>
                <span>{addressData.distance}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('address')}
            className="w-8 h-8 rounded-xl bg-[#e6f8fa] border border-[#22c3d3]/30 flex items-center justify-center text-[#22c3d3] hover:bg-[#d8f4f7] transition-all cursor-pointer shrink-0 mt-0.5"
            title="Chỉnh sửa địa chỉ nhận hàng"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Options Rows (Tiền mặt/QR, Ưu đãi, Hình thức giao hàng) - clicking opens page */}
        <div className="space-y-3.5 pt-2">
          {/* Row: Payment Method -> opens 'payment' page */}
          <div
            onClick={() => setActivePage('payment')}
            className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Banknote className="w-4 h-4" />
              </div>
              <span className="text-[15px] font-medium text-slate-900">
                {getPaymentMethodDisplay()}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Row: Ưu đãi -> opens 'voucher' page */}
          <div
            onClick={() => setActivePage('voucher')}
            className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-slate-500 flex items-center justify-center text-white shrink-0">
                <Ticket className="w-3.5 h-3.5" />
              </div>
              <span className="text-[15px] font-medium text-slate-900">
                {appliedPromotion ? (
                  <span className="text-[#22c3d3] font-bold">
                    Ưu đãi: Giảm {promoDiscount.toLocaleString('vi-VN')}đ ({appliedPromotion.code})
                  </span>
                ) : (
                  'Ưu đãi'
                )}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Row: Hình thức giao hàng -> opens 'delivery' page */}
          <div
            onClick={() => setActivePage('delivery')}
            className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-slate-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-slate-900 leading-tight">
                  Hình thức nhận hàng
                </p>
                <p className="text-[13px] text-slate-600 mt-0.5">
                  {getDeliveryMethodDisplay()}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          </div>
        </div>

        {/* Section Divider */}
        <div className="border-t border-slate-100 pt-3" />

        {/* 3. Tóm tắt đơn */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 leading-tight">Tóm tắt đơn</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                {totalItemCount} món •{' '}
                <button
                  onClick={() => navigateTo('cart')}
                  className="text-[#22c3d3] font-medium hover:underline cursor-pointer"
                >
                  Chỉnh sửa món
                </button>
              </p>
            </div>

            <button
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="p-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Thu gọn hoặc mở rộng"
            >
              {isSummaryExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Collapsible Items List */}
          <AnimatePresence initial={false}>
            {isSummaryExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3 pt-3"
              >
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    {/* Item Image */}
                    <img
                      src={
                        item.food.image ||
                        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300'
                      }
                      alt={item.food.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100 bg-slate-50"
                      referrerPolicy="no-referrer"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-slate-900 line-clamp-1 leading-snug">
                        {item.food.name}
                      </p>
                      {item.selectedSize && (
                        <p className="text-[11px] text-slate-500">{item.selectedSize.name}</p>
                      )}
                      <button
                        onClick={() => {
                          setEditingItemNote({
                            id: item.id,
                            name: item.food.name,
                            note: item.notes || '',
                          });
                          setActivePage('note');
                        }}
                        className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 mt-1 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {item.notes || 'Ghi chú cho quán'}
                        </span>
                      </button>
                    </div>

                    {/* Price & Stepper */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[14px] font-bold text-slate-900">
                        {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                      </span>

                      {/* Stepper capsule matching screenshot */}
                      <div className="mt-1.5 flex items-center border border-[#22c3d3]/40 bg-[#f0fbfb] rounded-xl px-2 py-0.5 gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#22c3d3] hover:opacity-75 cursor-pointer font-bold"
                          title="Giảm"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="text-[13px] font-bold text-slate-800 min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#22c3d3] hover:opacity-75 cursor-pointer font-bold"
                          title="Tăng"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-b border-dashed border-slate-200 my-4" />
        </div>

        {/* 4. Cho bữa ăn thêm tròn vị! (Upsell Carousel) */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 mb-2.5">
            Cho bữa ăn thêm tròn vị!
          </h3>

          <div className="flex items-start gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            {SUGGESTED_ADDONS.map((addon) => (
              <div key={addon.id} className="w-28 shrink-0 group">
                <div className="relative w-28 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img
                    src={addon.image}
                    alt={addon.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating + button */}
                  <button
                    onClick={() => handleAddAddon(addon)}
                    className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-lg bg-white/95 backdrop-blur-xs shadow-md text-[#22c3d3] hover:bg-[#22c3d3] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    title={`Thêm ${addon.name}`}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                <p className="text-[12px] font-medium text-slate-800 line-clamp-1 mt-1.5 leading-snug">
                  {addon.name}
                </p>
                <p className="text-[13px] font-bold text-[#22c3d3] mt-0.5">
                  {addon.price.toLocaleString('vi-VN')}đ
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Dịch vụ thêm */}
        <div className="pt-2 space-y-3.5">
          <h3 className="text-[15px] font-bold text-slate-900">Dịch vụ thêm</h3>

          {/* Protection GreenCare */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="mt-0.5 text-slate-800 shrink-0">
                <ShieldCheck className="w-5 h-5 fill-slate-800 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-900 leading-snug">
                  Bảo vệ đơn hàng với GreenCare
                </p>
                <p className="text-[13px] font-bold text-slate-800 mt-0.5">1.000đ</p>
                <p className="text-[12px] text-slate-500 leading-snug mt-1">
                  Đơn hàng được PVI bảo hiểm. Chứng nhận điện tử sẽ được cấp kèm.{' '}
                  <button
                    onClick={() => setActivePage('insurance')}
                    className="text-[#22c3d3] hover:underline cursor-pointer inline font-medium"
                  >
                    Chi tiết
                  </button>
                </p>
              </div>
            </div>

            {/* Teal Toggle Switch */}
            <button
              onClick={() => setGreenCareEnabled(!greenCareEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                greenCareEnabled ? 'bg-[#22c3d3]' : 'bg-slate-200'
              }`}
              role="switch"
              aria-checked={greenCareEnabled}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform flex items-center justify-center text-[#22c3d3] text-[10px] font-bold ${
                  greenCareEnabled ? 'left-5.5' : 'left-0.5'
                }`}
              >
                {greenCareEnabled && <Check className="w-3 h-3 stroke-[3]" />}
              </span>
            </button>
          </div>

          {/* Xuất hóa đơn & dịch vụ bổ sung -> opens 'invoice' page */}
          <div
            onClick={() => setActivePage('invoice')}
            className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-medium text-slate-900">
                {invoiceRequested ? (
                  <span className="text-emerald-600 font-bold">
                    ✓ Đã đăng ký xuất hóa đơn VAT ({taxCode || 'Theo yêu cầu'})
                  </span>
                ) : (
                  'Xuất hóa đơn & dịch vụ bổ sung tại đây.'
                )}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* 6. Chi tiết thanh toán */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-[15px] font-bold text-slate-900 mb-2.5">Chi tiết thanh toán</h3>

          <div className="space-y-2 text-[14px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>Tổng giá món ({totalItemCount} món)</span>
              <span className="font-semibold text-slate-900">
                {itemsSubtotal.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Phí giao hàng</span>
              <span className="font-semibold text-slate-900">
                {shippingFee.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                Phí dịch vụ <Info className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <span className="font-semibold text-slate-900">
                {serviceFee.toLocaleString('vi-VN')}đ
              </span>
            </div>

            {greenCareEnabled && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Bảo vệ đơn hàng với GreenCare</span>
                <span className="font-semibold text-slate-900">1.000đ</span>
              </div>
            )}

            {appliedPromotion && promoDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-medium">
                <span>Ưu đãi giảm giá ({appliedPromotion.code})</span>
                <span>-{promoDiscount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 7. Fixed Sticky Bottom Bar matching screenshot */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-4 py-3 sm:py-4">
        <div className="max-w-md sm:max-w-lg mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-slate-900">Tổng thanh toán</span>
            <span className="text-[18px] font-bold text-[#22c3d3]">
              {finalTotalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#22c3d3] hover:bg-[#1db3c1] active:scale-[0.99] text-white font-bold text-[16px] transition-all shadow-md shadow-[#22c3d3]/25 cursor-pointer flex items-center justify-center gap-2"
          >
            Đặt đơn
          </button>
        </div>
      </div>

      {/* Online Payment Gateway Modal (for scanning QR codes directly) */}
      {pendingGatewayOrder && (
        <OnlinePaymentModal
          isOpen={onlineModalOpen}
          onClose={() => setOnlineModalOpen(false)}
          orderId={pendingGatewayOrder.id}
          orderCode={pendingGatewayOrder.orderCode}
          amount={pendingGatewayOrder.amount}
          provider={pendingGatewayOrder.provider}
          onPaymentSuccess={() => {
            navigateTo('order-tracking', { orderId: pendingGatewayOrder.id });
          }}
        />
      )}
    </div>
  );
};

export default CheckoutView;
