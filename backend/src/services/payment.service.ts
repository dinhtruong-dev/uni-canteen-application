import { db } from './database.service';
import { Payment, PaymentMethod, PaymentStatus } from '../models';

export interface WalletTransactionItem {
  id: string;
  userId: string;
  amount: number;
  type: 'TOPUP' | 'PAYMENT' | 'REFUND';
  description: string;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export class PaymentService {
  public walletTransactions: Map<string, WalletTransactionItem> = new Map();

  constructor() {
    this.seedInitialTransactions();
  }

  private seedInitialTransactions() {
    const tx1: WalletTransactionItem = {
      id: 'tx-1',
      userId: 'user-stu-1',
      amount: 100000,
      type: 'TOPUP',
      description: 'Nạp tiền qua VNPay QR',
      date: '2026-08-10 10:15',
      status: 'SUCCESS',
    };
    const tx2: WalletTransactionItem = {
      id: 'tx-2',
      userId: 'user-stu-1',
      amount: 90000,
      type: 'PAYMENT',
      description: 'Thanh toán đơn hàng #CT20260810001',
      date: '2026-08-10 11:15',
      status: 'SUCCESS',
    };
    const tx3: WalletTransactionItem = {
      id: 'tx-3',
      userId: 'user-stu-1',
      amount: 45000,
      type: 'PAYMENT',
      description: 'Thanh toán đơn hàng #CT20260810003',
      date: '2026-08-10 11:20',
      status: 'SUCCESS',
    };
    this.walletTransactions.set(tx1.id, tx1);
    this.walletTransactions.set(tx2.id, tx2);
    this.walletTransactions.set(tx3.id, tx3);
  }

  public getPaymentByOrderId(orderId: string): Payment | undefined {
    return Array.from(db.payments.values()).find((p) => p.orderId === orderId);
  }

  public getWalletTransactions(userId: string): WalletTransactionItem[] {
    return Array.from(this.walletTransactions.values())
      .filter((t) => t.userId === userId)
      .reverse();
  }

  public processPayment(
    orderId: string,
    userId: string,
    amount: number,
    method: PaymentMethod
  ): Payment {
    const paymentId = `pay-${Date.now()}`;
    const user = db.users.get(userId);

    let status: PaymentStatus = 'SUCCESS';

    if (method === 'CAMPUS_WALLET') {
      if (!user) {
        throw new Error('Không tìm thấy tài khoản người dùng');
      }
      if (user.walletBalance < amount) {
        throw new Error(
          `Số dư ví không đủ (${user.walletBalance.toLocaleString('vi-VN')}đ). Cần ${amount.toLocaleString('vi-VN')}đ.`
        );
      }
      user.deductFunds(amount);

      const tx: WalletTransactionItem = {
        id: `tx-${Date.now()}`,
        userId,
        amount,
        type: 'PAYMENT',
        description: `Thanh toán đơn hàng ${orderId}`,
        date: new Date().toLocaleString('vi-VN'),
        status: 'SUCCESS',
      };
      this.walletTransactions.set(tx.id, tx);
    } else if (method === 'CASH') {
      status = 'PENDING'; // Sẽ thanh toán khi nhận đồ
    }

    const payment = new Payment(paymentId, orderId, userId, amount, method, status, undefined, {
      paidAt: status === 'SUCCESS' ? new Date() : undefined,
    });

    db.payments.set(payment.id, payment);
    return payment;
  }

  public topUpWallet(userId: string, amount: number, method: string = 'MoMo'): { newBalance: number } {
    const user = db.users.get(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    user.addFunds(amount);

    const tx: WalletTransactionItem = {
      id: `tx-${Date.now()}`,
      userId,
      amount,
      type: 'TOPUP',
      description: `Nạp tiền ví sinh viên qua ${method}`,
      date: new Date().toLocaleString('vi-VN'),
      status: 'SUCCESS',
    };
    this.walletTransactions.set(tx.id, tx);

    return { newBalance: user.walletBalance };
  }
}

export const paymentService = new PaymentService();
