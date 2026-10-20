import { Request, Response, NextFunction } from 'express';

const VALID_ORDER_TYPES = ['DINE_IN', 'TAKEAWAY', 'PICKUP', 'DELIVERY'];
const VALID_PAYMENT_METHODS = [
  'CAMPUS_WALLET',
  'STUDENT_WALLET',
  'MOMO',
  'ZALOPAY',
  'BANK_TRANSFER',
  'CASH',
  'VNPAY',
  'VNPAY_QR',
  'E_GREEN',
  'APPLE_PAY',
  'SHOPEEPAY',
  'CREDIT_CARD',
  'WALLET',
  'BANKING',
];

export function validateCreateOrder(req: Request, res: Response, next: NextFunction) {
  const { orderType, paymentMethod, items } = req.body;

  if (!orderType || !VALID_ORDER_TYPES.includes(orderType)) {
    return res.status(400).json({
      success: false,
      message: `Hình thức nhận hàng không hợp lệ. Cho phép: ${VALID_ORDER_TYPES.join(', ')}`,
    });
  }

  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: `Phương thức thanh toán không hợp lệ. Cho phép: ${VALID_PAYMENT_METHODS.join(', ')}`,
    });
  }

  if (items !== undefined) {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng phải chứa ít nhất 1 món ăn',
      });
    }
  }

  if (orderType === 'DELIVERY' && !req.body.deliveryAddressId && !req.body.deliveryAddressText) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp địa chỉ nhận hàng KTX khi chọn Giao Tận Nơi',
    });
  }

  next();
}

export function validateUpdateOrderStatus(req: Request, res: Response, next: NextFunction) {
  const { status } = req.body;
  const validStatuses = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'SERVED',
    'WAITING_PICKUP',
    'DELIVERING',
    'COMPLETED',
    'CANCELLED',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Trạng thái cập nhật không hợp lệ. Cho phép: ${validStatuses.join(', ')}`,
    });
  }

  next();
}
