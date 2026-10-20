import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Building,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { PaymentMethod } from '../../types';

interface PaymentTransaction {
  id: string;
  txCode: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: PaymentMethod;
  type: 'TOPUP' | 'PAYMENT' | 'REFUND';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  orderNumber?: string;
}

export const AdminPaymentsView: React.FC = () => {
  const { walletTransactions, orders, showToast } = useApp();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'tx-1',
      txCode: 'TXN-984210',
      userName: 'Nguyễn Văn Minh',
      userEmail: 'minh.nv@sis.edu.vn',
      amount: 45000,
      method: 'STUDENT_WALLET',
      type: 'PAYMENT',
      status: 'SUCCESS',
      createdAt: 'Hôm nay, 12:20',
      orderNumber: '#ORD-20260923',
    },
    {
      id: 'tx-2',
      txCode: 'TXN-984209',
      userName: 'Trần Thị Mai',
      userEmail: 'mai.tt@sis.edu.vn',
      amount: 200000,
      method: 'MOMO',
      type: 'TOPUP',
      status: 'SUCCESS',
      createdAt: 'Hôm nay, 11:45',
    },
    {
      id: 'tx-3',
      txCode: 'TXN-984208',
      userName: 'Lê Hoàng Nam',
      userEmail: 'nam.lh@sis.edu.vn',
      amount: 72000,
      method: 'VNPAY_QR',
      type: 'PAYMENT',
      status: 'SUCCESS',
      createdAt: 'Hôm nay, 11:32',
      orderNumber: '#ORD-20260922',
    },
    {
      id: 'tx-4',
      txCode: 'TXN-984207',
      userName: 'Phạm Quỳnh Anh',
      userEmail: 'anh.pq@sis.edu.vn',
      amount: 35000,
      method: 'CASH',
      type: 'PAYMENT',
      status: 'SUCCESS',
      createdAt: 'Hôm nay, 10:15',
      orderNumber: '#ORD-20260921',
    },
    {
      id: 'tx-5',
      txCode: 'TXN-984206',
      userName: 'Đỗ Quốc Bảo',
      userEmail: 'bao.dq@sis.edu.vn',
      amount: 50000,
      method: 'STUDENT_WALLET',
      type: 'REFUND',
      status: 'SUCCESS',
      createdAt: 'Hôm qua, 18:00',
      orderNumber: '#ORD-20260919',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TOPUP' | 'PAYMENT' | 'REFUND'>('ALL');

  const totalVol = transactions
    .filter((t) => t.status === 'SUCCESS' && t.type !== 'REFUND')
    .reduce((sum, t) => sum + t.amount, 0);

  const walletVol = transactions
    .filter((t) => t.method === 'STUDENT_WALLET' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const momoVol = transactions
    .filter((t) => t.method === 'MOMO' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const vnpayVol = transactions
    .filter((t) => t.method === 'VNPAY_QR' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTxs = transactions.filter((t) => {
    const matchSearch =
      t.txCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.orderNumber && t.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchMethod = methodFilter === 'ALL' || t.method === methodFilter;
    const matchType = typeFilter === 'ALL' || t.type === typeFilter;

    return matchSearch && matchMethod && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              Quản Lý Thanh Toán & Dòng Tiền Toàn Trường
            </h2>
            <p className="text-xs text-slate-400">
              Giám sát dòng tiền qua Ví Sinh Viên, VNPay QR, MoMo và thu ngân tiền mặt tại từng quầy căn tin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
              Tổng luân chuyển: {totalVol.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã GD, tên khách, mã đơn..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả cổng thanh toán</option>
            <option value="STUDENT_WALLET">Ví Sinh Viên UniEat</option>
            <option value="MOMO">Ví Điện Tử MoMo</option>
            <option value="VNPAY_QR">Cổng VNPay QR</option>
            <option value="CASH">Tiền mặt tại quầy</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả loại giao dịch</option>
            <option value="PAYMENT">Thanh toán đơn hàng</option>
            <option value="TOPUP">Nạp tiền vào ví</option>
            <option value="REFUND">Hoàn tiền hủy đơn</option>
          </select>
        </div>
      </div>

      {/* 4 Gateway Volume Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase text-slate-400">Ví Sinh Viên UniEat</span>
            <Wallet className="w-5 h-5 bg-emerald-500/10 p-1 rounded-lg" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">
            {walletVol.toLocaleString('vi-VN')}đ
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold">Tỷ lệ sử dụng cao nhất (65%)</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-pink-400">
            <span className="text-xs font-bold uppercase text-slate-400">Cổng Ví MoMo</span>
            <DollarSign className="w-5 h-5 bg-pink-500/10 p-1 rounded-lg" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">
            {momoVol.toLocaleString('vi-VN')}đ
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Tự động đối soát realtime</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase text-slate-400">Cổng VNPay QR</span>
            <CreditCard className="w-5 h-5 bg-blue-500/10 p-1 rounded-lg" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">
            {vnpayVol.toLocaleString('vi-VN')}đ
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Liên kết 40+ ngân hàng</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase text-slate-400">Tiền Mặt Tại Quầy</span>
            <TrendingUp className="w-5 h-5 bg-amber-500/10 p-1 rounded-lg" />
          </div>
          <p className="text-2xl font-black text-slate-100 font-mono">35.000đ</p>
          <p className="text-[11px] text-slate-400 font-medium">Đối soát ca thu ngân cuối ngày</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Mã giao dịch</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                <th className="py-3.5 px-4">Cổng thanh toán</th>
                <th className="py-3.5 px-4">Loại giao dịch</th>
                <th className="py-3.5 px-4">Số tiền</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Đơn hàng liên quan</th>
                <th className="py-3.5 px-4 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredTxs.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    {t.txCode}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-slate-100">{t.userName}</p>
                    <p className="text-[10px] text-slate-400">{t.userEmail}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-300">
                      {t.method === 'STUDENT_WALLET'
                        ? 'Ví Sinh Viên'
                        : t.method === 'MOMO'
                          ? 'MoMo'
                          : t.method === 'VNPAY_QR'
                            ? 'VNPay QR'
                            : 'Tiền mặt'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${t.type === 'TOPUP'
                        ? 'bg-blue-500/10 text-blue-400'
                        : t.type === 'PAYMENT'
                          ? 'bg-purple-500/10 text-purple-300'
                          : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                    >
                      {t.type === 'TOPUP' ? 'Nạp ví' : t.type === 'PAYMENT' ? 'Thanh toán' : 'Hoàn tiền'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span
                      className={
                        t.type === 'TOPUP' || t.type === 'REFUND'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }
                    >
                      {t.type === 'TOPUP' || t.type === 'REFUND' ? '+' : '-'}
                      {t.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Thành công
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-purple-400">
                    {t.orderNumber || '--'}
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px] font-mono">
                    {t.createdAt}
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
