/**
 * ==============================================================================
 * DỊCH VỤ XÁC THỰC MÃ BẢO MẬT OTP BẰNG REDIS (REDIS OTP SERVICE)
 * ==============================================================================
 * Quản lý sinh mã OTP 6 chữ số, thời gian sống TTL 5 phút, cooldown chống spam
 * và xác thực mã hoàn toàn thông qua Redis Cache thay vì lưu trữ Map trong RAM.
 * ==============================================================================
 */

import { redisService } from './redis.service';
import { redisConfig } from '../config/redis.config';
import { emailService } from './email.service';

export type OtpChannel = 'SMS' | 'EMAIL';
export type OtpType = 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | '2FA_LOGIN';

export interface OtpRecord {
  recipient: string;
  code: string;
  channel: OtpChannel;
  type: OtpType;
  expiresAt: number; // timestamp ms
  attempts: number;
  lastSentAt: number; // timestamp ms
  verified: boolean;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  recipient: string;
  maskedRecipient: string;
  channel: OtpChannel;
  type: OtpType;
  expiresInSeconds: number;
  debugOtp?: string;
}

export class OtpService {
  private static instance: OtpService;

  // Cấu hình thời gian
  private readonly OTP_TTL_SECONDS = 5 * 60; // 5 phút hiệu lực trong Redis
  private readonly RESEND_COOLDOWN_SECONDS = 45; // 45 giây đếm ngược gửi lại
  private readonly MAX_ATTEMPTS = 5; // Tối đa 5 lần nhập sai

  public static getInstance(): OtpService {
    if (!OtpService.instance) {
      OtpService.instance = new OtpService();
    }
    return OtpService.instance;
  }

  /**
   * Định dạng khóa Redis lưu trữ bản ghi OTP
   */
  private getRedisKey(type: OtpType, recipient: string): string {
    const cleanRecipient = recipient.trim().toLowerCase();
    return `${redisConfig.prefixes.OTP}${type}:${cleanRecipient}`;
  }

  /**
   * Định dạng khóa Redis kiểm soát Cooldown gửi lại mã
   */
  private getCooldownKey(type: OtpType, recipient: string): string {
    const cleanRecipient = recipient.trim().toLowerCase();
    return `${redisConfig.prefixes.OTP}cooldown:${type}:${cleanRecipient}`;
  }

  /**
   * Tạo chuỗi 6 chữ số ngẫu nhiên an toàn
   */
  public generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Che giấu một phần SĐT hoặc Email để bảo mật hiển thị
   */
  public maskRecipient(recipient: string, channel: OtpChannel): string {
    const raw = recipient.trim();
    if (channel === 'EMAIL' || raw.includes('@')) {
      const parts = raw.split('@');
      const name = parts[0];
      const domain = parts[1] || 'university.edu.vn';
      if (name.length <= 2) {
        return `${name[0] || '*'}***@${domain}`;
      }
      return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
    }

    // Xử lý số điện thoại
    const cleaned = raw.replace(/\s+/g, '');
    if (cleaned.length <= 4) return cleaned;
    const start = cleaned.slice(0, 3);
    const end = cleaned.slice(-3);
    return `${start}****${end}`;
  }

  /**
   * Gửi mã OTP xác thực bảo mật qua SMS hoặc Email và lưu trữ vào Redis
   */
  public async sendOtp(params: {
    recipient: string;
    channel: OtpChannel;
    type: OtpType;
  }): Promise<SendOtpResult> {
    const cleanRecipient = params.recipient.trim().toLowerCase();
    const redisKey = this.getRedisKey(params.type, cleanRecipient);
    const cooldownKey = this.getCooldownKey(params.type, cleanRecipient);
    const now = Date.now();

    // 1. Kiểm tra Cooldown chống spam trong Redis
    const remainingCooldown = await redisService.ttl(cooldownKey);
    if (remainingCooldown > 0) {
      throw new Error(`Vui lòng đợi ${remainingCooldown} giây nữa trước khi yêu cầu gửi lại mã OTP.`);
    }

    // 2. Tạo mã OTP mới
    const code = this.generateOtpCode();
    console.log(`================================================================================`);
    console.log(`🔑 [DEV MODE] Mật khẩu OTP của ${cleanRecipient} là: >>> ${code} <<<`);
    console.log(`================================================================================`);
    const record: OtpRecord = {
      recipient: cleanRecipient,
      code,
      channel: params.channel,
      type: params.type,
      expiresAt: now + this.OTP_TTL_SECONDS * 1000,
      attempts: 0,
      lastSentAt: now,
      verified: false,
    };

    // 3. Lưu bản ghi OTP vào Redis với thời gian hết hạn TTL (300 giây = 5 phút)
    await redisService.set(redisKey, record, this.OTP_TTL_SECONDS);

    // 4. Lưu Cooldown chống spam vào Redis (45 giây)
    await redisService.set(cooldownKey, '1', this.RESEND_COOLDOWN_SECONDS);

    console.log(`[Redis OTP] 💾 Đã lưu mã OTP [${code}] vào Redis -> Key: ${redisKey} (TTL: ${this.OTP_TTL_SECONDS}s)`);

    // 5. Thực hiện gửi mã qua Kênh tương ứng (SMS / Email)
    if (params.channel === 'EMAIL') {
      await this.dispatchEmail(cleanRecipient, code, params.type);
    } else {
      await this.dispatchSms(cleanRecipient, code, params.type);
    }

    const masked = this.maskRecipient(cleanRecipient, params.channel);
    const channelName = params.channel === 'EMAIL' ? 'hộp thư Email' : 'số điện thoại SMS';

    return {
      success: true,
      message: `Đã gửi mã xác thực bảo mật OTP 6 chữ số đến ${channelName} (${masked})`,
      recipient: cleanRecipient,
      maskedRecipient: masked,
      channel: params.channel,
      type: params.type,
      expiresInSeconds: this.OTP_TTL_SECONDS,
    };
  }

  /**
   * Xác thực mã OTP người dùng gửi lên từ Redis
   */
  public async verifyOtp(params: {
    recipient: string;
    code: string;
    type: OtpType;
  }): Promise<{ valid: boolean; message: string }> {
    const cleanRecipient = params.recipient.trim().toLowerCase();
    const redisKey = this.getRedisKey(params.type, cleanRecipient);

    // 1. Đọc bản ghi OTP từ Redis
    const record = await redisService.get<OtpRecord>(redisKey);

    if (!record) {
      throw new Error('Chưa có mã xác thực nào được gửi hoặc phiên xác thực đã hết hạn.');
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      await redisService.del(redisKey);
      throw new Error('Mã OTP xác thực đã hết hạn (quá 5 phút). Vui lòng yêu cầu gửi lại mã mới.');
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      await redisService.del(redisKey);
      throw new Error('Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã xác thực mới.');
    }

    // 2. So khớp mã OTP
    if (record.code !== params.code.trim()) {
      record.attempts += 1;
      const remaining = this.MAX_ATTEMPTS - record.attempts;

      // Cập nhật lại số lần sai vào Redis với TTL còn lại
      const remTtl = await redisService.ttl(redisKey);
      await redisService.set(redisKey, record, remTtl > 0 ? remTtl : 60);

      throw new Error(`Mã OTP không chính xác. Bạn còn ${remaining} lần thử lại.`);
    }

    // 3. Đánh dấu đã xác thực thành công trong Redis
    record.verified = true;
    const remTtl = await redisService.ttl(redisKey);
    await redisService.set(redisKey, record, remTtl > 0 ? remTtl : this.OTP_TTL_SECONDS);

    console.log(`[Redis OTP] ✅ Xác thực thành công mã OTP từ Redis -> Key: ${redisKey}`);

    return {
      valid: true,
      message: 'Xác thực mã OTP bảo mật thành công!',
    };
  }

  /**
   * Tiêu thụ mã OTP sau khi hoàn tất đăng ký/đăng nhập (Xóa khỏi Redis)
   */
  public async consumeOtp(recipient: string, type: OtpType): Promise<void> {
    const cleanRecipient = recipient.trim().toLowerCase();
    const redisKey = this.getRedisKey(type, cleanRecipient);
    const cooldownKey = this.getCooldownKey(type, cleanRecipient);
    await redisService.del(redisKey);
    await redisService.del(cooldownKey);
    console.log(`[Redis OTP] 🗑️ Đã tiêu thụ và xóa mã OTP khỏi Redis: ${redisKey}`);
  }

  /**
   * Kiểm tra xem người dùng đã hoàn thành bước xác thực OTP chưa qua Redis
   */
  public async isVerified(recipient: string, type: OtpType): Promise<boolean> {
    const cleanRecipient = recipient.trim().toLowerCase();
    const redisKey = this.getRedisKey(type, cleanRecipient);
    const record = await redisService.get<OtpRecord>(redisKey);
    return Boolean(record && record.verified && Date.now() <= record.expiresAt);
  }

  /**
   * Kích hoạt cổng gửi Email xác thực thực tế
   */
  private async dispatchEmail(email: string, code: string, type: OtpType): Promise<void> {
    try {
      await emailService.sendOtpEmail(email, code, type);
    } catch (err: any) {
      console.error(`[OtpService] Lỗi khi gửi email thực tế tới ${email}:`, err.message);
    }
  }

  /**
   * Giả lập & kích hoạt cổng SMS Brandname nhà trường
   */
  private async dispatchSms(phone: string, code: string, type: OtpType): Promise<void> {
    const actionDesc = type === 'REGISTER'
      ? 'dang ky'
      : type === 'LOGIN' || type === '2FA_LOGIN'
        ? 'dang nhap 2 lop'
        : 'dat lai mat khau';

    const smsContent = `[UniEat Campus] Ma xac thuc OTP ${actionDesc} cua ban la: ${code}. Hieu luc trong 5 phut. Khong chia se ma nay cho bat ky ai.`;

    console.log(`
================================================================================
📱 [UniEat SMS GATEWAY - Brandname: UniEat]:
Số điện thoại nhận: ${phone}
Mã OTP: [ ${code} ]
Tin nhắn gửi: "${smsContent}"
Thời hạn: 5 phút hiệu lực trong Redis
================================================================================
    `);
  }
}

export const otpService = OtpService.getInstance();
