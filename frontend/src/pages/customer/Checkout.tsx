import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { PaymentMethod, FoodItem } from '../../types';
import { OnlinePaymentModal } from '../../components/checkout/OnlinePaymentModal';
import { HeaderNav } from '../../components/common/HeaderNav';
import { userService, cartApiService } from '../../services/api/client';
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
  | 'pickup'
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
    pickupTimeSlot,
    setPickupTimeSlot,
    showToast,
  } = useApp();

  // Active page state: 'main' or full-screen sub-page
  const [activePage, setActivePage] = useState<CheckoutSubPage>('main');

  // Customer addresses from MySQL database
  const [dbAddresses, setDbAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [newAddressForm, setNewAddressForm] = useState({
    recipientName: currentUser?.name || '',
    recipientPhone: currentUser?.phone || '',
    dormBlock: 'Tòa A1',
    roomNumber: '',
    fullAddress: '',
    notes: '',
  });

  // Pickup Slots from MySQL database
  const [pickupSlots, setPickupSlots] = useState<any[]>([]);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>(pickupTimeSlot || '11:45 - 12:00');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để tiến hành thanh toán đơn hàng!', 'info');
      navigateTo('login', { next: 'checkout' });
    }
  }, [currentUser]);

  // Luôn chuyển sang chế độ "Đặt đồ ăn đến lấy"
  useEffect(() => {
    setOrderType('PICKUP');
  }, []);

  // Nạp địa chỉ thực tế của khách hàng từ CSDL MySQL (bỏ danh sách mặc định fix cứng)
  const loadAddressesFromDb = async () => {
    setLoadingAddresses(true);
    try {
      const list = await userService.getAddresses();
      if (Array.isArray(list) && list.length > 0) {
        setDbAddresses(list);
        const def = list.find((a: any) => a.isDefault) || list[0];
        if (def) {
          setSelectedAddressId(def.id);
          const full = def.fullAddress || `${def.roomNumber || def.room ? `Phòng ${def.roomNumber || def.room}, ` : ''}${def.dormBlock || def.building || ''}`;
          setAddressData({
            street: full,
            customerName: def.recipientName || currentUser?.name || 'Khách hàng',
            phone: def.recipientPhone || currentUser?.phone || '0987654321',
            distance: 'Tại khuôn viên',
            driverNote: def.notes || def.note || '',
            building: def.dormBlock || def.building || '',
            room: def.roomNumber || def.room || '',
          });
          setDeliveryAddress({
            id: def.id,
            building: def.dormBlock || def.building || '',
            room: def.roomNumber || def.room || '',
            phone: def.recipientPhone || currentUser?.phone || '',
            note: def.notes || def.note || '',
            isDefault: Boolean(def.isDefault),
          });
        }
      } else {
        setDbAddresses([]);
      }
    } catch (err) {
      console.warn('[CheckoutView] Failed to load DB addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadAddressesFromDb();
  }, [currentUser?.id]);

  // Nạp các khung giờ nhận món được cấu hình trong CSDL (pickup_slots)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingSlots(true);
      try {
        const slots = await cartApiService.getPickupSlots(selectedCanteen?.id || 'cant-a');
        if (isMounted && Array.isArray(slots) && slots.length > 0) {
          setPickupSlots(slots);
          const found = slots.find((s) => s.timeRange === pickupTimeSlot);
          if (found) {
            setSelectedSlotTime(found.timeRange);
          } else {
            const firstAvail = slots.find((s) => s.status === 'AVAILABLE') || slots[0];
            if (firstAvail) {
              setSelectedSlotTime(firstAvail.timeRange);
              setPickupTimeSlot(firstAvail.timeRange);
            }
          }
        }
      } catch (err) {
        console.warn('[CheckoutView] Failed to load pickup slots:', err);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    })();
    return () => { isMounted = false; };
  }, [selectedCanteen?.id]);

  // If cart is empty when opening, automatically seed demo item
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

  // Delivery Address info
  const [addressData, setAddressData] = useState({
    street: deliveryAddress?.building
      ? `${deliveryAddress.room}, ${deliveryAddress.building}`
      : 'Ký Túc Xá Sinh Viên ĐHQG',
    customerName: currentUser?.name || 'Khách hàng',
    phone: deliveryAddress?.phone || currentUser?.phone || '0987654321',
    distance: 'Tại khuôn viên',
    driverNote: deliveryAddress?.note || '',
    building: deliveryAddress?.building || '',
    room: deliveryAddress?.room || '',
  });

  // State management
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [greenCareEnabled, setGreenCareEnabled] = useState(false);

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

  // Price calculations: Đặt đồ ăn đến lấy -> Phí giao hàng = 0đ
  const itemsSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = 0; // Đặt đồ ăn đến lấy: Miễn phí 0đ
  const serviceFee = 2000;
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
        <HeaderNav
          title="Địa chỉ nhận hàng"
          subtitle={selectedCanteen ? `Giao từ ${selectedCanteen.name}` : 'Khuôn viên trường & Ký túc xá'}
          onBack={() => setActivePage('main')}
        />

        <main className="p-4 space-y-4">
          {/* Danh sách địa chỉ của khách hàng trong Database */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Địa chỉ của bạn (Đã lưu trong CSDL)
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                className="text-[12px] font-bold text-[#22c3d3] hover:underline cursor-pointer flex items-center gap-1"
              >
                {isAddingNewAddress ? '✕ Hủy thêm' : '+ Thêm địa chỉ mới'}
              </button>
            </div>

            {loadingAddresses ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                Đang tải danh sách địa chỉ từ cơ sở dữ liệu...
              </div>
            ) : dbAddresses.length > 0 ? (
              <div className="space-y-2">
                {dbAddresses.map((item) => {
                  const full = item.fullAddress || `${item.roomNumber || item.room ? `Phòng ${item.roomNumber || item.room}, ` : ''}${item.dormBlock || item.building || ''}`;
                  const isSelected = selectedAddressId === item.id || addressData.street === full;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedAddressId(item.id);
                        setAddressData({
                          street: full,
                          customerName: item.recipientName || currentUser?.name || 'Khách hàng',
                          phone: item.recipientPhone || currentUser?.phone || '0987654321',
                          distance: 'Tại khuôn viên',
                          driverNote: item.notes || item.note || '',
                          building: item.dormBlock || item.building || '',
                          room: item.roomNumber || item.room || '',
                        });
                        setDeliveryAddress({
                          id: item.id,
                          building: item.dormBlock || item.building || '',
                          room: item.roomNumber || item.room || '',
                          phone: item.recipientPhone || currentUser?.phone || '',
                          note: item.notes || item.note || '',
                          isDefault: Boolean(item.isDefault),
                        });
                        showToast(`Đã chọn địa chỉ: ${full}`, 'success');
                      }}
                      className={`p-3.5 bg-white rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${isSelected
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
                            <span className="text-[14px] font-bold text-slate-900">
                              {item.recipientName || currentUser?.name || 'Người nhận'}
                            </span>
                            {item.isDefault && (
                              <span className="text-[10px] font-bold text-[#22c3d3] bg-[#e6f8fa] px-1.5 py-0.5 rounded-md">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-slate-600 mt-1 leading-snug">{full}</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            SĐT: {item.recipientPhone || currentUser?.phone || 'Chưa có'}
                            {item.notes && ` • Ghi chú: ${item.notes}`}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#22c3d3] text-white flex items-center justify-center shrink-0 mt-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                <p className="text-[13px] text-slate-500 font-medium">
                  Bạn chưa có địa chỉ nào được lưu trong cơ sở dữ liệu.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(true)}
                  className="px-4 py-2 bg-[#22c3d3] text-white text-[12px] font-bold rounded-xl hover:bg-[#1db3c1] transition-all cursor-pointer"
                >
                  + Thêm địa chỉ mới ngay
                </button>
              </div>
            )}
          </div>

          {/* Form thêm địa chỉ mới vào Database MySQL */}
          {isAddingNewAddress && (
            <div className="bg-white p-4 rounded-2xl border border-[#22c3d3]/40 space-y-3.5 shadow-sm">
              <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#22c3d3]" /> Thêm địa chỉ vào CSDL MySQL
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-slate-600 block mb-1">
                    Tên người nhận:
                  </label>
                  <input
                    type="text"
                    value={newAddressForm.recipientName}
                    onChange={(e) => setNewAddressForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-slate-600 block mb-1">
                    Số điện thoại:
                  </label>
                  <input
                    type="text"
                    value={newAddressForm.recipientPhone}
                    onChange={(e) => setNewAddressForm((prev) => ({ ...prev, recipientPhone: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                    placeholder="0987654321"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-slate-600 block mb-1">
                    Khu vực / Tòa nhà / KTX:
                  </label>
                  <input
                    type="text"
                    value={newAddressForm.dormBlock}
                    onChange={(e) => setNewAddressForm((prev) => ({ ...prev, dormBlock: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                    placeholder="VD: KTX Tòa A3"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-slate-600 block mb-1">
                    Số phòng:
                  </label>
                  <input
                    type="text"
                    value={newAddressForm.roomNumber}
                    onChange={(e) => setNewAddressForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                    placeholder="VD: 402"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-slate-600 block mb-1">
                  Địa chỉ chi tiết (Đầy đủ):
                </label>
                <textarea
                  rows={2}
                  value={newAddressForm.fullAddress}
                  onChange={(e) => setNewAddressForm((prev) => ({ ...prev, fullAddress: e.target.value }))}
                  placeholder="VD: Phòng 402, Tòa A3, KTX Đại học Quốc Gia"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-slate-600 block mb-1">
                  Ghi chú địa chỉ:
                </label>
                <input
                  type="text"
                  placeholder="VD: Gọi trước khi đến..."
                  value={newAddressForm.notes}
                  onChange={(e) => setNewAddressForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-hidden focus:border-[#22c3d3] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (!newAddressForm.dormBlock || !newAddressForm.roomNumber) {
                      showToast('Vui lòng nhập Tòa nhà và Số phòng!', 'error');
                      return;
                    }
                    const payload = {
                      recipientName: newAddressForm.recipientName || currentUser?.name || 'Khách hàng',
                      recipientPhone: newAddressForm.recipientPhone || currentUser?.phone || '0987654321',
                      dormBlock: newAddressForm.dormBlock,
                      roomNumber: newAddressForm.roomNumber,
                      fullAddress: newAddressForm.fullAddress || `Phòng ${newAddressForm.roomNumber}, ${newAddressForm.dormBlock}`,
                      notes: newAddressForm.notes,
                      isDefault: dbAddresses.length === 0,
                    };
                    const res = await userService.createAddress(payload);
                    if (res) {
                      showToast('Đã lưu địa chỉ vào CSDL thành công!', 'success');
                      setIsAddingNewAddress(false);
                      await loadAddressesFromDb();
                    } else {
                      showToast('Không thể lưu địa chỉ vào DB!', 'error');
                    }
                  }}
                  className="flex-1 py-2.5 bg-[#22c3d3] hover:bg-[#1db3c1] text-white font-bold text-[13px] rounded-xl transition-all cursor-pointer text-center"
                >
                  Lưu vào CSDL
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md sm:max-w-lg mx-auto">
            <button
              onClick={() => {
                setActivePage('main');
                showToast(`Địa chỉ đã lưu: ${addressData.street}`, 'success');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#22c3d3] hover:bg-[#1db3c1] text-white font-bold text-[15px] transition-all cursor-pointer shadow-md shadow-[#22c3d3]/20"
            >
              Xác nhận địa chỉ này
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
        <HeaderNav
          title="Phương thức thanh toán"
          subtitle="Chọn hình thức thanh toán thuận tiện"
          backIcon={<X className="w-5 h-5 stroke-[2]" />}
          onBack={() => setActivePage('main')}
        />

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
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${paymentMethod === 'CASH'
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
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${paymentMethod === 'E_GREEN' || paymentMethod === 'STUDENT_WALLET'
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
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${paymentMethod === 'APPLE_PAY'
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
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${paymentMethod === 'MOMO'
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
        <HeaderNav
          title="Ưu đãi"
          subtitle="Mã giảm giá & Khuyến mãi sinh viên"
          backIcon={<X className="w-5 h-5 stroke-[2]" />}
          onBack={() => setActivePage('main')}
        />

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
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${isSelected
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
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${isSelected
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
  // SUB-PAGE 4: CHỌN KHUNG GIỜ ĐẾN LẤY MÓN (FULL PAGE - ĐẶT ĐỒ ĂN ĐẾN LẤY)
  // ==========================================
  if (activePage === 'pickup') {
    const availableSlotsList =
      pickupSlots.length > 0
        ? pickupSlots
        : [
          { id: 'ps-1', timeRange: '11:00 - 11:15', status: 'AVAILABLE', label: 'Khung giờ trưa sớm' },
          { id: 'ps-2', timeRange: '11:15 - 11:30', status: 'AVAILABLE', label: 'Khung giờ trưa' },
          { id: 'ps-3', timeRange: '11:30 - 11:45', status: 'AVAILABLE', label: 'Giờ cao điểm' },
          { id: 'ps-4', timeRange: '11:45 - 12:00', status: 'AVAILABLE', label: 'Giờ cao điểm' },
          { id: 'ps-5', timeRange: '12:00 - 12:15', status: 'AVAILABLE', label: 'Giờ cao điểm' },
          { id: 'ps-6', timeRange: '12:15 - 12:30', status: 'AVAILABLE', label: 'Khung giờ trưa' },
          { id: 'ps-7', timeRange: '12:30 - 12:45', status: 'AVAILABLE', label: 'Khung giờ vắng' },
          { id: 'ps-8', timeRange: '12:45 - 13:00', status: 'AVAILABLE', label: 'Khung giờ vắng' },
        ];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <HeaderNav
          title="Khung giờ đến lấy"
          subtitle={selectedCanteen?.name || 'Nhận món tại quầy nhanh chóng'}
          backIcon={<X className="w-5 h-5 stroke-[2]" />}
          onBack={() => setActivePage('main')}
        />

        <main className="p-4 space-y-4">
          {/* Thông tin nhận tại quầy */}
          <div className="p-4 bg-gradient-to-br from-[#f0fdf4] to-[#e6f8fa] border border-[#22c3d3]/30 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#22c3d3] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    Đặt đồ ăn đến lấy
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Miễn phí 0đ
                    </span>
                  </h2>
                  <p className="text-[12px] text-slate-600 mt-0.5">
                    Quầy phục vụ: <strong className="text-slate-800 font-semibold">{selectedCanteen?.name || 'Căng tin trường'}</strong>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                Tại quầy
              </span>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-[#22c3d3]/20 flex items-center justify-between text-[12.5px]">
              <span className="text-slate-600 font-medium">Khung giờ đang chọn:</span>
              <strong className="text-[#0f766e] font-bold text-[14px] bg-[#22c3d3]/15 px-2.5 py-1 rounded-lg">
                {selectedSlotTime}
              </strong>
            </div>

            <p className="text-[11.5px] text-slate-500 leading-relaxed italic">
              * Quán sẽ chuẩn bị sẵn sàng và giữ nóng món ăn theo đúng khung giờ bạn chọn. Vui lòng đến quầy đúng giờ để thưởng thức món ăn nóng hổi trọn vị nhất.
            </p>
          </div>

          {/* Danh sách khung giờ từ CSDL */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14.5px] font-bold text-slate-900">
                  Chọn khung giờ nhận món:
                </h3>
                <p className="text-[12px] text-slate-500">
                  Khung giờ sẵn có được cấu hình từ quầy căng tin
                </p>
              </div>
              {loadingSlots && (
                <span className="text-[11px] text-[#0d9488] font-medium bg-[#e6f8fa] px-2 py-0.5 rounded-full">
                  Đang tải CSDL...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {availableSlotsList.map((slot: any) => {
                const isSelected = selectedSlotTime === slot.timeRange;
                const isAvailable = slot.status === 'AVAILABLE';

                return (
                  <button
                    key={slot.id || slot.timeRange}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedSlotTime(slot.timeRange);
                      setPickupTimeSlot(slot.timeRange);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[76px] ${isSelected
                      ? 'border-[#22c3d3] bg-[#f0fdfa] ring-2 ring-[#22c3d3]/35 text-[#0f766e] shadow-xs'
                      : isAvailable
                        ? 'border-slate-200/90 bg-white hover:border-[#22c3d3]/50 hover:bg-slate-50/60 text-slate-800'
                        : 'border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold block">{slot.timeRange}</span>
                      <div
                        className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected
                          ? 'border-[#22c3d3] bg-[#22c3d3] text-white shadow-2xs'
                          : 'border-slate-300 bg-white'
                          }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                      <span
                        className={`text-[11px] font-semibold ${isSelected
                          ? 'text-[#0d9488] font-bold'
                          : isAvailable
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                          }`}
                      >
                        {isSelected ? '✓ Đã chọn' : isAvailable ? 'Còn chỗ' : 'Hết chỗ'}
                      </span>
                      {slot.label && (
                        <span className="text-[9.5px] text-slate-400 hidden sm:inline truncate max-w-[80px]">
                          {slot.label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hướng dẫn nhận món 3 bước */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="text-[13.5px] font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#22c3d3]" /> Quy trình nhận món tại quầy
            </h4>
            <div className="space-y-2 text-[12px] text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>Sau khi thanh toán, hệ thống sẽ cấp mã đơn hàng 6 số và mã QR riêng.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p>Căng tin chuẩn bị món sẵn sàng và đóng gói cẩn thận đúng theo khung giờ bạn đã chọn.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p>Đến quầy nhận món, xuất trình mã đơn trên ứng dụng để nhận đồ ăn ngay không cần xếp hàng.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Nút Xác nhận khung giờ cố định dưới đáy */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md sm:max-w-lg mx-auto">
            <button
              onClick={() => {
                setActivePage('main');
                showToast(`Đã chọn khung giờ đến lấy: ${selectedSlotTime}`, 'success');
              }}
              className="w-full py-3.5 rounded-full bg-[#22c3d3] hover:bg-[#1eb0bf] text-white font-bold text-[15px] transition-all cursor-pointer shadow-md shadow-[#22c3d3]/20 active:scale-98 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Xác nhận khung giờ ({selectedSlotTime})</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  // SUB-PAGE 5: XUẤT HÓA ĐƠN & DỊCH VỤ BỔ SUNG (FULL PAGE)
  // ==========================================
  if (activePage === 'invoice') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md sm:max-w-lg mx-auto relative font-sans">
        {/* Page Header */}
        <HeaderNav
          title="Hóa đơn & Dịch vụ bổ sung"
          subtitle="Xuất hóa đơn điện tử & Dụng cụ ăn uống"
          onBack={() => setActivePage('main')}
        />

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
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${invoiceRequested ? 'bg-[#22c3d3]' : 'bg-slate-200'
                  }`}
                role="switch"
                aria-checked={invoiceRequested}
              >
                <span
                  className={`w-6 h-6 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform flex items-center justify-center text-[#22c3d3] text-[10px] font-bold ${invoiceRequested ? 'left-5.5' : 'left-0.5'
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
        <HeaderNav
          title="Bảo hiểm GreenCare"
          subtitle="Bảo vệ đơn hàng toàn diện 100%"
          onBack={() => setActivePage('main')}
        />

        <main className="p-4 space-y-4">
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
        <HeaderNav
          title="Ghi chú cho quán"
          subtitle={editingItemNote?.name || 'Yêu cầu chuẩn bị món ăn'}
          onBack={() => setActivePage('main')}
        />

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
      <HeaderNav
        title="Thanh toán"
        subtitle={
          selectedCanteen
            ? `${selectedCanteen.name}${selectedCanteen.location ? ` - ${selectedCanteen.location}` : ''}`
            : 'Căng Tin A - Giảng Đường Trung Tâm A2'
        }
        onBack={() => navigateTo('cart')}
      />

      {/* Main Content Sections */}
      <main className="px-4 py-4 space-y-4">
        {/* 1. Địa chỉ của khách hàng lấy từ CSDL (bỏ mặc định fix cứng) */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
          </div>

          <div
            onClick={() => setActivePage('address')}
            className="flex items-start gap-3 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-[#e6f8fa] text-[#22c3d3] flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-slate-900 leading-snug">
                {addressData.street || 'Chưa thiết lập địa chỉ trong CSDL'}
              </p>
              <p className="text-[12px] text-slate-500 font-normal mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700">{addressData.customerName}</span>
                <span>•</span>
                <span>{addressData.phone}</span>
                {addressData.driverNote && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400 truncate max-w-[140px]">Ghi chú: {addressData.driverNote}</span>
                  </>
                )}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2.5" />
          </div>
        </div>

        {/* 2. Options Rows (Phương thức thanh toán & Mã ưu đãi) */}
        <div className="space-y-3 pt-1">
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

          {/* Row: Khung giờ đến lấy -> opens 'pickup' page (tương tự như Ưu đãi) */}
          <div
            onClick={() => setActivePage('pickup')}
            className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#22c3d3] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[15px] font-medium text-slate-900">
                {selectedSlotTime ? (
                  <>
                    Khung giờ đến lấy:{' '}
                    <span className="text-[#0f766e] font-bold">{selectedSlotTime}</span>
                  </>
                ) : (
                  'Khung giờ đến lấy'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Tại quầy 0đ
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* 3. ĐẶT ĐỒ ĂN ĐẾN LẤY & KHUNG GIỜ NHẬN MÓN TỪ CSDL (Click mở trang chọn giờ) */}
        <div
          onClick={() => setActivePage('pickup')}
          className="p-3.5 bg-gradient-to-br from-[#f0fdf4] to-[#e6f8fa] border border-[#22c3d3]/30 hover:border-[#22c3d3] rounded-2xl cursor-pointer transition-all hover:shadow-xs group flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#22c3d3] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[14.5px] font-bold text-slate-900">
                  Đặt đồ ăn đến lấy
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Miễn phí 0đ
                </span>
              </div>
              <p className="text-[12px] text-slate-600 mt-0.5 truncate">
                Khung giờ: <strong className="text-[#0f766e] font-bold text-[13px]">{selectedSlotTime}</strong> • Tại quầy căng tin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#0d9488] font-bold text-[12px] bg-white/90 px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs group-hover:bg-[#22c3d3] group-hover:text-white group-hover:border-[#22c3d3] transition-all shrink-0">
            <span>Đổi giờ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

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
          <h3 className="text-[15px] font-bold text-slate-900">Dịch vụ khác</h3>

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
              <span>Phí nhận hàng (Đến lấy tại quầy)</span>
              <span className="font-bold text-emerald-600">
                0đ (Miễn phí)
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
