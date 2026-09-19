import { db } from './database.service';
import { Payment, PaymentMethod, PaymentStatus } from '../models';

export class PaymentService {
  public getPaymentByOrderId(orderId: string): Payment | undefined {
    return Array.from(db.payments.values()).find((p) => p.orderId === orderId);
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
    return { newBalance: user.walletBalance };
  }
}

export const paymentService = new PaymentService();
