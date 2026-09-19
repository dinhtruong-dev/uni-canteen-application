/**
 * ==============================================================================
 * CẤU HÌNH CỔNG THANH TOÁN VNPAY & MOMO (PAYMENT GATEWAYS CONFIG)
 * ==============================================================================
 * [HƯỚNG DẪN CẤU HÌNH TRÊN MÁY CỦA BẠN]:
 * - VNPAY Sandbox: Đăng ký tại https://sandbox.vnpayment.vn để nhận mã TMN Code & Hash Secret.
 * - MOMO Sandbox: Đăng ký tại https://developers.momo.vn để nhận Partner Code, Access Key, Secret Key.
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

export const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE || 'UNIEAT01',
  hashSecret: process.env.VNPAY_HASH_SECRET || 'LOCAL_DEV_VNPAY_SECRET',
  paymentUrl: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5173/orders',
  version: '2.1.0',
  command: 'pay',
  currCode: 'VND',
  locale: 'vn',
};

export const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO_UNIEAT',
  accessKey: process.env.MOMO_ACCESS_KEY || 'LOCAL_MOMO_ACCESS_KEY',
  secretKey: process.env.MOMO_SECRET_KEY || 'LOCAL_MOMO_SECRET_KEY',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/orders',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payments/momo-ipn',
  requestType: 'captureWallet',
};
