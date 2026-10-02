import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Receipt,
  Utensils,
  PackageCheck,
  Truck,
  CreditCard,
  Wallet,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { staffService } from '../../services/api';

export const StaffStatisticsView: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await staffService.getStatistics('cant-a');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const dailyRevenue = stats?.dailyRevenue || [
    { date: '16/09', revenue: 1450000, orders: 42 },
    { date: '17/09', revenue: 1820000, orders: 51 },
    { date: '18/09', revenue: 1950000, orders: 58 },
    { date: '19/09', revenue: 2100000, orders: 63 },
    { date: '20/09', revenue: 2450000, orders: 74 },
    { date: '21/09', revenue: 2280000, orders: 68 },
    { date: '22/09', revenue: 2650000, orders: 81 },
  ];

  const maxRevenue = Math.max(...dailyRevenue.map((d: any) => d.revenue), 3000000);

  const topSelling = stats?.topSellingProducts || [
    { name: 'Cơm Gà Xối Mỡ Da Giòn', quantity: 142, revenue: 4970000 },
    { name: 'Bún Bò Huế Chả Cua', quantity: 98, revenue: 3920000 },
    { name: 'Cơm Sườn Nướng Mật Ong', quantity: 87, revenue: 3480000 },
    { name: 'Mì Trộn Xá Xíu Trứng Lòng Đào', quantity: 76, revenue: 2660000 },
    { name: 'Trà Sữa Oolong Nướng Trân Châu', quantity: 125, revenue: 3125000 },
  ];

  const methodDistribution = stats?.orderMethods || {
    DINE_IN: 45,
    TAKEAWAY: 38,
    DELIVERY: 17,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PHÂN TÍCH HIỆU SUẤT
            </span>
            <span className="text-xs text-slate-400">Dữ liệu doanh thu & tỷ lệ tiêu thụ</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">Báo Cáo & Thống Kê Căn Tin</h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>7 ngày gần nhất (Tuần này)</span>
        </div>
      </div>

      {/* KPI 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>DOANH THU HÔM NAY</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {stats?.todayRevenue?.toLocaleString('vi-VN') || '2.650.000'}đ
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400/80">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+16.2% so với hôm qua</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>DOANH THU TUẦN NÀY</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-300 font-mono">
            {stats?.weekRevenue?.toLocaleString('vi-VN') || '14.700.000'}đ
          </div>
          <div className="mt-1 text-xs text-slate-400">Tổng 442 đơn hoàn tất</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>DOANH THU THÁNG NÀY</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-400 font-mono">
            {stats?.monthRevenue?.toLocaleString('vi-VN') || '58.200.000'}đ
          </div>
          <div className="mt-1 text-xs text-slate-400">Đạt 97% chỉ tiêu tháng</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue 7 Days Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100">Biểu Đồ Doanh Thu 7 Ngày Qua</h3>
              <p className="text-xs text-slate-400">Doanh thu và số lượng đơn hàng theo ngày</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Doanh thu (VNĐ)
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 pt-6 flex items-end justify-between gap-3">
            {dailyRevenue.map((d: any, idx: number) => {
              const heightPercent = Math.max(15, Math.round((d.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {(d.revenue / 1000).toLocaleString('vi-VN')}k
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-800 rounded-t-xl overflow-hidden flex flex-col justify-end relative h-48">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="text-xs font-mono text-slate-300 font-bold">{d.date}</div>
                  <div className="text-[10px] text-slate-500">{d.orders} đơn</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Methods Distribution */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-100">Hình Thức Nhận Đơn</h3>
            <p className="text-xs text-slate-400">Tỷ lệ theo thói quen của sinh viên</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Dine in */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <Utensils className="w-4 h-4" />
                  <span>Ăn tại bàn (Dine-in)</span>
                </div>
                <span className="font-mono font-bold text-slate-200">
                  {methodDistribution.DINE_IN}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${methodDistribution.DINE_IN}%` }}
                />
              </div>
            </div>

            {/* Pickup */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <PackageCheck className="w-4 h-4" />
                  <span>Mang đi (Pickup hẹn giờ)</span>
                </div>
                <span className="font-mono font-bold text-slate-200">
                  {methodDistribution.TAKEAWAY}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${methodDistribution.TAKEAWAY}%` }}
                />
              </div>
            </div>

            {/* Delivery */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-purple-400 font-semibold">
                  <Truck className="w-4 h-4" />
                  <span>Giao tận nơi KTX</span>
                </div>
                <span className="font-mono font-bold text-slate-200">
                  {methodDistribution.DELIVERY}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${methodDistribution.DELIVERY}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Phương thức thanh toán chủ yếu:</span>
              <span className="font-bold text-emerald-400">Ví UniPay (68%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Giờ cao điểm đông nhất:</span>
              <span className="font-bold text-amber-400">11:30 - 12:15</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-bold text-base text-slate-100">Top Món Ăn Bán Chạy Nhất</h3>
          <p className="text-xs text-slate-400">Các món được sinh viên yêu thích và đặt nhiều nhất</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Xếp hạng</th>
                <th className="py-3 px-4">Tên món ăn</th>
                <th className="py-3 px-4 text-center">Số phần đã bán</th>
                <th className="py-3 px-4 text-right">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {topSelling.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950 font-black'
                          : idx === 2
                          ? 'bg-amber-700 text-white font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-100 text-sm">{item.name}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                    {item.quantity} phần
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                    {item.revenue?.toLocaleString('vi-VN')}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
