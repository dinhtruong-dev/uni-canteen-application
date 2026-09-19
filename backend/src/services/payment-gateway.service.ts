import { db } from './database.service';
import { Payment } from '../models';
import { socketService } from './socket.service';

export interface GatewayInitResponse {
  paymentUrl: string;
  qrCodeUrl: string;
  transactionCode: string;
  amount: number;
  provider: 'VNPAY' | 'MOMO';
  orderId: string;
  expireInSeconds: number;
}

export class PaymentGatewayService {
  // 1. Khởi tạo thanh toán qua Cổng VNPay
  public createVNPayPayment(orderId: string, amount: number, orderInfo: string): GatewayInitResponse {
    const txnRef = `VNP-${Date.now()}`;
    const vnp_Amount = amount * 100; // VNPay quy định nhân 100

    // Mã QR thanh toán VietQR / VNPay Sandbox
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021238540010A00000072701240006970422011009876543210208QRIBFTTA5303704540${amount}5802VN62${orderInfo}6304`;
    const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${vnp_Amount}&vnp_Command=pay&vnp_CreateDate=${Date.now()}&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=${encodeURIComponent(orderInfo)}&vnp_OrderType=food&vnp_ReturnUrl=http://localhost:3000/api/payments/vnpay-return&vnp_TmnCode=UNIEAT01&vnp_TxnRef=${txnRef}&vnp_Version=2.1.0`;

    return {
      paymentUrl,
      qrCodeUrl,
      transactionCode: txnRef,
      amount,
      provider: 'VNPAY',
      orderId,
      expireInSeconds: 900, // 15 phút
    };
  }

  // 2. Khởi tạo thanh toán qua Cổng MoMo (QR Code & DeepLink)
  public createMoMoPayment(orderId: string, amount: number, orderInfo: string): GatewayInitResponse {
    const requestId = `MM-${Date.now()}`;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=2|99|0987654321|UniEat%20Campus|minh.dh@edu.vn|0|0|${amount}|${encodeURIComponent(orderInfo)}|transfer_mycode`;
    const paymentUrl = `https://test-payment.momo.vn/v2/gateway/api/create?partnerCode=MOMO_UNIEAT&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${encodeURIComponent(orderInfo)}`;

    return {
      paymentUrl,
      qrCodeUrl,
      transactionCode: requestId,
      amount,
      provider: 'MOMO',
      orderId,
      expireInSeconds: 600, // 10 phút
    };
  }

  // 3. Xử lý IPN / Xác nhận thanh toán thành công từ cổng
  public confirmGatewayPayment(
    orderId: string,
    transactionCode: string,
    provider: 'VNPAY' | 'MOMO'
  ): boolean {
    const order = db.orders.get(orderId);
    if (!order) return false;

    // Update order status
    order.isPaid = true;
    if (order.status === 'PENDING') {
      order.updateStatus('CONFIRMED');
    }

    // Save or update payment record
    const payment = new Payment(
      `pay-${Date.now()}`,
      order.id,
      order.userId,
      order.finalAmount,
      provider,
      'SUCCESS',
      transactionCode,
      {
        paidAt: new Date(),
        gatewayResponse: {
          provider,
          confirmedAt: new Date().toISOString(),
          status: '00',
        },
      }
    );

    db.payments.set(payment.id, payment);

    // Notify via Socket.IO
    socketService.emitOrderStatus(order.userId, order.toJSON());
    return true;
  }
}

export const paymentGatewayService = new PaymentGatewayService();
