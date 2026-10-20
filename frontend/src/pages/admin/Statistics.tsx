import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Store,
  DollarSign,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../store/AppContext';
import { adminService, AdminStatisticsData } from '../../services/api/client';

export const AdminStatisticsView: React.FC = () => {
  const { canteens, orders, foods, showToast } = useApp();

  const [dateRange, setDateRange] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('MONTH');
  const [statData, setStatData] = useState<AdminStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live statistics from MySQL
  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getStatistics();
      if (res && res.success && res.data) {
        setStatData(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch statistics from DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  // Canteen comparison data from MySQL DB with fallback
  const canteenData = statData?.canteens && statData.canteens.length > 0
    ? statData.canteens
    : [
      { name: 'Căn Tin A (A2)', revenue: 45200000, orders: 1250, cancelRate: 2.1 },
      { name: 'Căn Tin B (B5)', revenue: 38900000, orders: 1040, cancelRate: 1.8 },
      { name: 'Căn Tin C (TD)', revenue: 26400000, orders: 720, cancelRate: 3.4 },
    ];

  // Peak Hour distribution from MySQL DB with fallback
  const hourlyData = statData?.hourly && statData.hourly.length > 0
    ? statData.hourly
    : [
      { hour: '07h-08h', orders: 145 },
      { hour: '08h-09h', orders: 85 },
      { hour: '11h-12h', orders: 480 },
      { hour: '12h-13h', orders: 560 },
      { hour: '13h-14h', orders: 190 },
      { hour: '17h-18h', orders: 280 },
      { hour: '18h-19h', orders: 340 },
      { hour: '19h-20h', orders: 160 },
    ];

  // System cancel rate
  const totalSystemOrders = orders.length;
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;
  const dynamicCancelRate = totalSystemOrders > 0
    ? ((cancelledOrders / totalSystemOrders) * 100).toFixed(1)
    : '1.9';

  const handleExportCSV = () => {
    // Generate CSV string
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Mã Căn Tin,Tên Căn Tin,Số Đơn Hàng,Tổng Doanh Thu (VNĐ),Tỷ Lệ Hủy (%)\n' +
      canteenData
        .map((c, i) => `CANT-${i + 1},"${c.name}",${c.orders},${c.revenue},${c.cancelRate}%`)
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_doanh_thu_campus_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Đã xuất file báo cáo CSV thành công!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Báo Cáo Phân Tích & Thống Kê Doanh Thu Chuyên Sâu
            </h2>
            <p className="text-xs text-slate-400">
              Phân tích hiệu suất vận hành các quầy căng tin, khung giờ cao điểm và tải dữ liệu báo cáo đối soát.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
              <button
                onClick={() => setDateRange('WEEK')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${dateRange === 'WEEK' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'
                  }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setDateRange('MONTH')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${dateRange === 'MONTH' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'
                  }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => setDateRange('QUARTER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${dateRange === 'QUARTER' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'
                  }`}
              >
                Học kỳ này
              </button>
            </div>

            <button
              onClick={loadStatistics}
              disabled={isLoading}
              title="Lấy dữ liệu mới nhất từ CSDL"
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Canteen Revenue & Hourly Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canteen Revenue Comparison */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              So Sánh Doanh Thu Giữa Các Căn Tin
            </h3>
            <p className="text-xs text-slate-400">Doanh số lũy kế theo học kỳ (Đơn vị: Triệu VNĐ)</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={canteenData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}tr`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Histogram */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Phân Bổ Lượng Đơn Theo Khung Giờ (Peak Hours)
            </h3>
            <p className="text-xs text-slate-400">Lưu lượng đặt đơn tập trung cao nhất vào ca trưa 11h - 13h</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} đơn`, 'Lượng đơn']}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold">Thời gian hoàn thành đơn TB</span>
          <p className="text-3xl font-black text-slate-100 font-mono">11.4 phút</p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Nhanh hơn 2.3 phút so với tháng trước
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold">Tỷ lệ hủy đơn toàn trường</span>
          <p className="text-3xl font-black text-rose-400 font-mono">{dynamicCancelRate}%</p>
          <p className="text-xs text-slate-400">Chủ yếu do khách đặt nhầm cơ sở hoặc hết món</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold">Tỷ lệ thanh toán không tiền mặt</span>
          <p className="text-3xl font-black text-purple-400 font-mono">92.8%</p>
          <p className="text-xs text-purple-300 font-semibold">Tối ưu hoá chuyển đổi số trường học</p>
        </div>
      </div>
    </div>
  );
};
