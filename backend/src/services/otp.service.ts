// src/services/otp.service.ts
import { redisService } from './redis.service';
import { redisConfig } from '../config/redis.config';
import { emailService } from './email.service';
import type {
  OtpChannel,
  OtpType,
  OtpRecord,
  SendOtpResult,
  SendOtpParams,
  VerifyOtpParams,
  VerifyOtpResult,
} from '../types/otp.types';

export type {
  OtpChannel,
  OtpType,
  OtpRecord,
  SendOtpResult,
  SendOtpParams,
  VerifyOtpParams,
  VerifyOtpResult,
} from '../types/otp.types';

export class OtpService {
  private readonly OTP_TTL_SECONDS = 5 * 60;
  private readonly RESEND_COOLDOWN_SECONDS = 45;
  private readonly MAX_ATTEMPTS = 5;

  private getRedisKey(type: OtpType, recipient: string): string {
    const clean = recipient.trim().toLowerCase();
    return `${redisConfig.prefixes.OTP}${type}:${clean}`;
  }

  private getCooldownKey(type: OtpType, recipient: string): string {
    const clean = recipient.trim().toLowerCase();
    return `${redisConfig.prefixes.OTP}cooldown:${type}:${clean}`;
  }

  public generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public maskRecipient(recipient: string, channel: OtpChannel): string {
    const raw = recipient.trim();

    if (channel === 'EMAIL' || raw.includes('@')) {
      const [name, domain = 'university.edu.vn'] = raw.split('@');
      if (!name) return `***@${domain}`;
      if (name.length <= 2) return `${name[0] || '*'}***@${domain}`;
      return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
    }

    const cleaned = raw.replace(/\s+/g, '');
    if (cleaned.length <= 4) return cleaned;
    return `${cleaned.slice(0, 3)}****${cleaned.slice(-3)}`;
  }

  // 👈 Dùng SendOtpParams thay vì inline
  public async sendOtp(params: SendOtpParams): Promise<SendOtpResult> {
    const cleanRecipient = params.recipient.trim().toLowerCase();
    const redisKey = this.getRedisKey(params.type, cleanRecipient);
    const cooldownKey = this.getCooldownKey(params.type, cleanRecipient);
    const now = Date.now();

    const remainingCooldown = await redisService.ttl(cooldownKey);
    if (remainingCooldown > 0) {
      throw new Error(
        `Vui lòng đợi ${remainingCooldown} giây nữa trước khi yêu cầu gửi lại mã OTP.`
      );
    }

    const code = this.generateOtpCode();
    console.log(`🔑 [DEV] OTP của ${cleanRecipient} là: ${code}`);

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

    await redisService.set(redisKey, record, this.OTP_TTL_SECONDS);
    await redisService.set(cooldownKey, '1', this.RESEND_COOLDOWN_SECONDS);

    if (params.channel === 'EMAIL') {
      const ok = await this.dispatchEmail(cleanRecipient, code, params.type);
      if (!ok) {
        await this.consumeOtp(cleanRecipient, params.type);
        throw new Error('Không thể gửi email xác thực. Vui lòng thử lại.');
      }
    } else {
      await this.dispatchSms(cleanRecipient, code, params.type);
    }

    const masked = this.maskRecipient(cleanRecipient, params.channel);
    const channelName = params.channel === 'EMAIL' ? 'hộp thư Email' : 'số điện thoại SMS';

    const result: SendOtpResult = {
      success: true,
      message: `Đã gửi mã OTP 6 chữ số đến ${channelName} (${masked})`,
      recipient: cleanRecipient,
      maskedRecipient: masked,
      channel: params.channel,
      type: params.type,
      expiresInSeconds: this.OTP_TTL_SECONDS,
    };

    if (process.env.NODE_ENV !== 'production') {
      result.debugOtp = code;
    }

    return result;
  }

  // 👈 Dùng VerifyOtpParams / VerifyOtpResult
  public async verifyOtp(params: VerifyOtpParams): Promise<VerifyOtpResult> {
    const cleanRecipient = params.recipient.trim().toLowerCase();
    const redisKey = this.getRedisKey(params.type, cleanRecipient);

    const record = await redisService.get<OtpRecord>(redisKey);
    if (!record) {
      throw new Error('Chưa có mã OTP nào được gửi hoặc phiên xác thực đã hết hạn.');
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      await this.consumeOtp(cleanRecipient, params.type);
      throw new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.');
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      await this.consumeOtp(cleanRecipient, params.type);
      throw new Error('Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.');
    }

    if (record.code !== params.code.trim()) {
      record.attempts += 1;
      const remaining = this.MAX_ATTEMPTS - record.attempts;

      if (record.attempts >= this.MAX_ATTEMPTS) {
        await this.consumeOtp(cleanRecipient, params.type);
        throw new Error('Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.');
      }

      const remTtl = await redisService.ttl(redisKey);
      const ttlToSet = remTtl > 0 ? remTtl : 60;
      await redisService.set(redisKey, record, ttlToSet);

      throw new Error(`Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`);
    }

    record.verified = true;
    const remTtl = await redisService.ttl(redisKey);
    const ttlToSet = remTtl > 0 ? remTtl : this.OTP_TTL_SECONDS;
    await redisService.set(redisKey, record, ttlToSet);

    return { valid: true, message: 'Xác thực OTP thành công!' };
  }

  public async consumeOtp(recipient: string, type: OtpType): Promise<void> {
    const cleanRecipient = recipient.trim().toLowerCase();
    await redisService.del(this.getRedisKey(type, cleanRecipient));
    await redisService.del(this.getCooldownKey(type, cleanRecipient));
  }

  public async isVerified(recipient: string, type: OtpType): Promise<boolean> {
    const cleanRecipient = recipient.trim().toLowerCase();
    const record = await redisService.get<OtpRecord>(this.getRedisKey(type, cleanRecipient));
    return Boolean(record && record.verified && Date.now() <= record.expiresAt);
  }

  public async seedDemoOtps(): Promise<void> {
    const demoOtps: Array<{
      recipient: string;
      code: string;
      channel: OtpChannel;
      type: OtpType;
    }> = [
        { recipient: 'student@university.edu.vn', code: '888888', channel: 'EMAIL', type: 'LOGIN' },
        { recipient: 'minh.dh22@university.edu.vn', code: '123456', channel: 'EMAIL', type: 'REGISTER' },
        { recipient: '0987654321', code: '666666', channel: 'SMS', type: 'LOGIN' },
        { recipient: 'sv001', code: '555555', channel: 'SMS', type: 'LOGIN' },
        { recipient: 'dinhtruongbg11@gmail.com', code: '999999', channel: 'EMAIL', type: 'FORGOT_PASSWORD' },
      ];

    const now = Date.now();
    for (const demo of demoOtps) {
      const record: OtpRecord = {
        recipient: demo.recipient.toLowerCase(),
        code: demo.code,
        channel: demo.channel,
        type: demo.type,
        expiresAt: now + 3600 * 24 * 1000,
        attempts: 0,
        lastSentAt: now,
        verified: false,
      };
      await redisService.set(this.getRedisKey(demo.type, demo.recipient), record, 86400);
    }
    console.log(`[Redis OTP] 🚀 Đã seed ${demoOtps.length} OTP demo vào Redis!`);
  }

  private async dispatchEmail(email: string, code: string, type: OtpType): Promise<boolean> {
    try {
      return await emailService.sendOtpEmail(email, code, type);
    } catch (err: any) {
      console.error(`[OtpService] Lỗi gửi email tới ${email}:`, err.message);
      return false;
    }
  }

  private async dispatchSms(phone: string, code: string, type: OtpType): Promise<void> {
    const actionDesc =
      type === 'REGISTER'
        ? 'dang ky'
        : type === 'LOGIN' || type === '2FA_LOGIN'
          ? 'dang nhap 2 lop'
          : 'dat lai mat khau';

    const smsContent = `[UniEat Campus] Ma xac thuc OTP ${actionDesc} cua ban la: ${code}. Hieu luc trong 5 phut. Khong chia se ma nay cho bat ky ai.`;

    console.log(`
================================================================================
📱 [UniEat SMS GATEWAY - Brandname: UniEat]
Số điện thoại nhận: ${phone}
Mã OTP: [ ${code} ]
Tin nhắn gửi: "${smsContent}"
Thời hạn: 5 phút hiệu lực trong Redis
================================================================================
    `);
  }
}

export const otpService = new OtpService();