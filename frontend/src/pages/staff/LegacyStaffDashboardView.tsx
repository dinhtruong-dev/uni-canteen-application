import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  QrCode,
  Utensils,
  CookingPot,
  Search,
  Filter,
  Eye,
  Power,
  Volume2,
  VolumeX,
  Phone,
  Flame,
} from 'lucide-react';

export const StaffDashboardView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    cancelOrder,
    foods,
    toggleFoodAvailability,
    canteens,
    selectedCanteen,
    setSelectedCanteen,
    setQrScannerOpen,
    showToast,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'KITCHEN' | 'MENU_STOCK'>('KITCHEN');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filter orders by canteen
  const canteenOrders = selectedCanteen
    ? orders.filter((o) => o.canteenId === selectedCanteen.id)
    : orders;

  const pendingOrders = canteenOrders.filter((o) => o.status === 'PENDING');
  const activeOrders = canteenOrders.filter((o) =>
    ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'SERVED'].includes(o.status)
  );
  const completedOrders = canteenOrders.filter((o) => o.status === 'COMPLETED');

  const filteredOrders = canteenOrders.filter((o) => {
    if (filterStatus === 'ALL') return o.status !== 'COMPLETED' && o.status !== 'CANCELLED';
    if (filterStatus === 'COMPLETED') return o.status === 'COMPLETED';
    if (filterStatus === 'CANCELLED') return o.status === 'CANCELLED';
    return o.status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Staff Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <CookingPot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-orange-400 font-extrabold tracking-wider uppercase block">
                MÀN HÌNH ĐIỀU HÀNH BẾP CĂNG TIN
              </span>
              <h1 className="text-2xl font-black">
                {selectedCanteen ? selectedCanteen.name : 'Tất Cả Căng Tin'}
              </h1>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigateTo('kitchen-kds')}
              className="bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-white/20"
              title="Chuyển sang giao diện KDS tối ưu màn hình cảm ứng ngang và máy tính"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Màn Hình Bếp KDS (Ngang / Cảm Ứng)</span>
            </button>

            <button
              onClick={() => setQrScannerOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" /> Quét QR Nhận Đơn
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${soundEnabled
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              title="Âm báo đơn mới"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Chuông Bật' : 'Chuông Tắt'}</span>
            </button>
          </div>
        </div>

        {/* Canteen Selector for Staff */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0 font-medium">Chọn quầy:</span>
          {canteens.map((cant) => (
            <button
              key={cant.id}
              onClick={() => setSelectedCanteen(cant)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${selectedCanteen?.id === cant.id
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
              {cant.name.split('-')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 font-bold text-xs">
          <button
            onClick={() => setActiveTab('KITCHEN')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'KITCHEN'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <CookingPot className="w-4 h-4" /> Bảng Đơn Hàng Realtime
            {pendingOrders.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {pendingOrders.length} mới
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('MENU_STOCK')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'MENU_STOCK'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Power className="w-4 h-4" /> Quản Lý Kho & Hết Hàng
          </button>
        </div>

        {activeTab === 'KITCHEN' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${filterStatus === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {st === 'ALL'
                  ? 'Đang chế biến'
                  : st === 'PENDING'
                    ? 'Đơn Mới'
                    : st === 'PREPARING'
                      ? 'Đang Nấu'
                      : st === 'READY'
                        ? 'Sẵn Sàng'
                        : 'Đã Hoàn Thành'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Tab 1: Kitchen Orders Queue */}
      {activeTab === 'KITCHEN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-800 text-base">Hiện không có đơn hàng nào cần xử lý</h3>
              <p className="text-xs text-slate-500">Các đơn hàng mới sẽ xuất hiện tự động tại đây.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border-2 p-5 shadow-sm space-y-4 transition-all ${order.status === 'PENDING'
                  ? 'border-orange-500 ring-4 ring-orange-500/10'
                  : order.status === 'PREPARING'
                    ? 'border-amber-400'
                    : order.status === 'READY' || order.status === 'DELIVERING'
                      ? 'border-blue-400'
                      : 'border-slate-200'
                  }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-black text-slate-900 text-lg block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Thời gian đặt: {order.createdAt}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${order.orderType === 'DINE_IN'
                      ? 'bg-amber-100 text-amber-900'
                      : order.orderType === 'PICKUP'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-emerald-100 text-emerald-900'
                      }`}
                  >
                    {order.orderType === 'DINE_IN'
                      ? '🍽️ Tại bàn'
                      : order.orderType === 'PICKUP'
                        ? '🏃 Tại quầy'
                        : '🏠 Giao phòng'}
                  </span>
                </div>

                {/* Customer / Location Info */}
                <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{order.customerName}</span>
                    <span className="text-slate-500 font-normal">{order.customerPhone}</span>
                  </p>

                  {order.orderType === 'DINE_IN' && order.tableInfo && (
                    <p className="font-extrabold text-orange-600">
                      Bàn: {order.tableInfo.tableName} ({order.tableInfo.tableCode})
                    </p>
                  )}

                  {order.orderType === 'PICKUP' && order.pickupTimeSlot && (
                    <p className="font-extrabold text-blue-600">
                      Khung giờ hẹn lấy: {order.pickupTimeSlot}
                    </p>
                  )}

                  {order.orderType === 'DELIVERY' && order.deliveryAddress && (
                    <p className="font-bold text-emerald-700">
                      Địa chỉ: {order.deliveryAddress.building} - {order.deliveryAddress.room} ({order.deliveryAddress.area})
                    </p>
                  )}
                </div>

                {/* Items Food List */}
                <div className="space-y-2 divide-y divide-slate-100 text-xs">
                  {order.items.map((it) => (
                    <div key={it.id} className="pt-1.5 flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {it.quantity}x {it.food.name}
                        </span>
                        {it.selectedSize && (
                          <span className="text-slate-500 block text-[11px]">Size: {it.selectedSize.name}</span>
                        )}
                        {it.selectedToppings && it.selectedToppings.length > 0 && (
                          <span className="text-slate-500 block text-[11px]">
                            Topping: {it.selectedToppings.map((t) => t.name).join(', ')}
                          </span>
                        )}
                        {it.notes && (
                          <span className="text-rose-600 italic block font-bold text-[11px]">
                            Ghi chú: {it.notes}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-800">
                        {(it.unitPrice * it.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons for Staff */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  {order.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => cancelOrder(order.id, 'Nhà bếp hết món')}
                        className="py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                      >
                        Hủy đơn
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold shadow-xs"
                      >
                        Xác Nhận Đơn
                      </button>
                    </div>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-xs"
                    >
                      Bắt Đầu Chế Biến Món
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          order.orderType === 'DELIVERY' ? 'DELIVERING' : 'READY'
                        )
                      }
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs"
                    >
                      {order.orderType === 'DELIVERY' ? 'Giao Cho Shipper' : 'Báo Món Đã Sẵn Sàng'}
                    </button>
                  )}

                  {(order.status === 'READY' || order.status === 'DELIVERING' || order.status === 'SERVED') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Hoàn Thành Đơn
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Tab 2: Menu Stock & Availability Manager */}
      {activeTab === 'MENU_STOCK' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Quản Lý Tình Trạng Món Ăn Trong Kho</h3>
            <p className="text-xs text-slate-500">
              Bật/Tắt trạng thái "Còn hàng" hoặc "Hết hàng" để cập nhật ngay lập tức cho sinh viên
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {foods.map((food) => (
              <div
                key={food.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 bg-slate-50/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={food.image} alt={food.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{food.name}</h4>
                    <p className="text-[11px] text-orange-600 font-extrabold">
                      {food.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFoodAvailability(food.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${food.isAvailable
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                >
                  {food.isAvailable ? 'Đang bán' : 'Hết hàng'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
