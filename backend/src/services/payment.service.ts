import { Payment, PaymentStatus, User, WalletTransaction } from '../models';
import type { PaymentMethod } from '../types';
import type { WalletTransactionItem } from '../types/payment.types';

export class PaymentService {
  public async getPaymentByOrderId(orderId: string): Promise<Payment | undefined> {
    try {
      const p = await Payment.findOne({ where: { orderId } });
      return p || undefined;
    } catch (err: any) {
      console.error('[PaymentService.getPaymentByOrderId Error]:', err.message);
      throw err;
    }
  }

  public async getWalletTransactions(userId: string): Promise<WalletTransactionItem[]> {
    try {
      const rows = await WalletTransaction.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          amount: Number(r.amount) || 0,
          type: r.type,
          description: r.description || '',
          date: (r as any).createdAt ? new Date((r as any).createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
          status: r.status,
        }));
      }
      return [];
    } catch (err: any) {
      console.warn('[PaymentService.getWalletTransactions Warning]:', err.message);
      return [];
    }
  }

  public async processPayment(
    orderId: string,
    userId: string,
    amount: number,
    method: PaymentMethod
  ): Promise<Payment> {
    try {
      const paymentId = `pay-${Date.now()}`;
      let status: PaymentStatus = 'SUCCESS';

      if (method === 'WALLET') {
        const user = await User.findByPk(userId);
        if (!user) {
          throw new Error('Không tìm thấy tài khoản người dùng');
        }
        const walletBalance = Number(user.walletBalance) || 0;

        if (walletBalance < amount) {
          throw new Error(
            `Số dư ví không đủ (${walletBalance.toLocaleString('vi-VN')}đ). Cần ${amount.toLocaleString('vi-VN')}đ.`
          );
        }

        user.walletBalance = walletBalance - amount;
        await user.save();

        const txId = `tx-${Date.now()}`;
        await WalletTransaction.create({
          id: txId,
          userId,
          amount,
          type: 'PAYMENT',
          description: `Thanh toán đơn hàng ${orderId}`,
          status: 'SUCCESS',
        });
      } else if (method === 'CASH') {
        status = 'PENDING';
      }

      const payment = await Payment.create({
        id: paymentId,
        orderId,
        userId,
        amount,
        method,
        status,
        transactionCode: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: status === 'SUCCESS' ? new Date() : undefined,
      });

      return payment;
    } catch (err: any) {
      console.error('[PaymentService.processPayment Error]:', err.message);
      throw err;
    }
  }

  public async topUpWallet(userId: string, amount: number, method: string = 'MoMo'): Promise<{ newBalance: number }> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      const currentBalance = Number(user.walletBalance) || 0;
      user.walletBalance = currentBalance + amount;
      await user.save();

      const txId = `tx-${Date.now()}`;
      await WalletTransaction.create({
        id: txId,
        userId,
        amount,
        type: 'TOPUP',
        description: `Nạp tiền ví sinh viên qua ${method}`,
        status: 'SUCCESS',
      });

      return { newBalance: Number(user.walletBalance) || 0 };
    } catch (err: any) {
      console.error('[PaymentService.topUpWallet Error]:', err.message);
      throw err;
    }
  }
}

export const paymentService = new PaymentService();
