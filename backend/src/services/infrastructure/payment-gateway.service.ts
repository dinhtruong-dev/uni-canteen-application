import { Payment, Order } from '../../models';
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
    const vnp_Amount = amount * 100;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021238540010A00000072701240006970422011009876543210208QRIBFTTA5303704540${amount}5802VN62${orderInfo}6304`;
    const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${vnp_Amount}&vnp_Command=pay&vnp_CreateDate=${Date.now()}&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=${encodeURIComponent(orderInfo)}&vnp_OrderType=food&vnp_ReturnUrl=http://localhost:3000/api/payments/vnpay-return&vnp_TmnCode=UNIEAT01&vnp_TxnRef=${txnRef}&vnp_Version=2.1.0`;

    return {
      paymentUrl,
      qrCodeUrl,
      transactionCode: txnRef,
      amount,
      provider: 'VNPAY',
      orderId,
      expireInSeconds: 900,
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
      expireInSeconds: 600,
    };
  }

  // 3. Xử lý IPN / Xác nhận thanh toán thành công từ cổng
  public async confirmGatewayPayment(
    orderId: string,
    transactionCode: string,
    provider: 'VNPAY' | 'MOMO'
  ): Promise<boolean> {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) return false;

      order.isPaid = true;
      if (order.status === 'PENDING') {
        order.status = 'CONFIRMED';
      }
      await order.save();

      const paymentId = `pay-${Date.now()}`;
      await Payment.create({
        id: paymentId,
        orderId: order.id,
        userId: order.userId,
        amount: Number(order.finalAmount) || Number(order.totalAmount) || 0,
        method: provider,
        status: 'SUCCESS',
        transactionCode,
        paidAt: new Date(),
      });

      const orderJson = typeof (order as any)?.toJSON === 'function' ? (order as any).toJSON() : order;
      socketService.emitOrderStatus(order.userId, orderJson);

      return true;
    } catch (err: any) {
      console.error('[PaymentGatewayService.confirmGatewayPayment Error]:', err.message);
      throw err;
    }
  }
}

export const paymentGatewayService = new PaymentGatewayService();
