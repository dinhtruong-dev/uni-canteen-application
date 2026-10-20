import React from 'react';
import { Order, OrderStatus } from '../../types';
import { Check, Clock, Utensils, Bike, ShoppingBag, AlertCircle } from 'lucide-react';

interface OrderStatusTimelineProps {
  order: Order;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ order }) => {
  const getSteps = () => {
    if (order.orderType === 'DINE_IN') {
      return [
        { status: 'PENDING', label: 'Đã đặt', sub: order.tableInfo ? `${order.tableInfo.tableName}` : 'Bàn' },
        { status: 'CONFIRMED', label: 'Xác nhận', sub: 'Căng tin nhận đơn' },
        { status: 'PREPARING', label: 'Đang chuẩn bị', sub: 'Nhà bếp chế biến' },
        { status: 'SERVED', label: 'Đã mang ra bàn', sub: 'Nhân viên phục vụ' },
        { status: 'COMPLETED', label: 'Hoàn thành', sub: 'Dùng bữa ngon miệng' },
      ];
    } else if (order.orderType === 'PICKUP') {
      return [
        { status: 'PENDING', label: 'Đã đặt', sub: 'Đã gửi yêu cầu' },
        { status: 'CONFIRMED', label: 'Xác nhận', sub: 'Căng tin nhận đơn' },
        { status: 'PREPARING', label: 'Đang chuẩn bị', sub: 'Đang nấu nướng' },
        { status: 'READY', label: 'Sẵn sàng', sub: 'Chờ sinh viên đến lấy' },
        { status: 'COMPLETED', label: 'Đã nhận hàng', sub: 'Đã giao sinh viên' },
      ];
    } else {
      return [
        { status: 'PENDING', label: 'Đã đặt', sub: 'Giao tận phòng' },
        { status: 'CONFIRMED', label: 'Xác nhận', sub: 'Căng tin nhận đơn' },
        { status: 'PREPARING', label: 'Đang chuẩn bị', sub: 'Chế biến & Đóng gói' },
        { status: 'DELIVERING', label: 'Đang giao', sub: 'Shipper đang tới' },
        { status: 'COMPLETED', label: 'Đã giao', sub: 'Hoàn thành đơn hàng' },
      ];
    }
  };

  const steps = getSteps();

  const getActiveIndex = () => {
    if (order.status === 'CANCELLED') return -1;
    if (order.status === 'COMPLETED') return steps.length - 1;
    const index = steps.findIndex((s) => s.status === order.status);
    return index >= 0 ? index : 0;
  };

  const activeIndex = getActiveIndex();

  if (order.status === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center text-rose-800">
        <div className="flex items-center justify-center gap-2 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          Đơn hàng đã bị hủy
        </div>
        {order.notes && <p className="text-xs text-rose-600 mt-1">{order.notes}</p>}
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="relative flex items-center justify-between">
        {/* Progress bar background line */}
        <div className="absolute left-0 right-0 top-4 h-1 bg-slate-200 z-0" />
        {/* Active progress bar line */}
        <div
          className="absolute left-0 top-4 h-1 bg-orange-500 transition-all duration-500 z-0"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isCurrent
                    ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110 shadow-md shadow-orange-500/30'
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                  }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-bold mt-2 text-center max-w-[70px] leading-tight ${isCurrent ? 'text-orange-600' : isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}
              >
                {step.label}
              </span>
              <span className="text-[9px] text-slate-400 text-center max-w-[65px] truncate hidden sm:block">
                {step.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
