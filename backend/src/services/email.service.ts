// src/services/email.service.ts
import nodemailer, { Transporter, TestAccount } from 'nodemailer';

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  private testAccount: TestAccount | null = null;
  private testTransporter: Transporter | null = null;

  constructor() {
  }

  private initTransporter(): void {
    if (this.isConfigured) return;

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        // ✅ KHÔNG dùng tls.rejectUnauthorized: false
      });
      this.isConfigured = true;
      console.log(
        `[EmailService] Đã khởi tạo SMTP qua: ${user} (${host}:${port}, secure=${secure})`
      );
    } else {
      this.isConfigured = false;
      console.warn(
        '[EmailService] Chưa cấu hình SMTP_USER/SMTP_PASS. Sẽ dùng Ethereal để test.'
      );
    }
  }

  private async getTestTransporter(): Promise<Transporter> {
    if (!this.testAccount) {
      this.testAccount = await nodemailer.createTestAccount();
    }
    if (!this.testTransporter) {
      this.testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: this.testAccount.user,
          pass: this.testAccount.pass,
        },
      });
    }
    return this.testTransporter;
  }

  public async sendOtpEmail(
    toEmail: string,
    code: string,
    type: string
  ): Promise<boolean> {
    // Lazy init lần đầu gọi
    if (!this.isConfigured && !this.transporter) {
      this.initTransporter();
    }

    const fromName = process.env.SMTP_FROM_NAME || 'UniEat Campus';
    const fromEmail =
      process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_USER ||
      'no-reply@unieat.campus.edu.vn';

    const actionText =
      type === 'REGISTER'
        ? 'đăng ký tài khoản sinh viên mới'
        : type === 'LOGIN' || type === '2FA_LOGIN'
          ? 'xác minh bảo mật 2 lớp đăng nhập'
          : 'khôi phục mật khẩu tài khoản';

    const subject = `[UniEat Campus] Mã xác thực OTP của bạn là: ${code}`;

    const htmlContent = `... (giữ nguyên template HTML cũ) ...`;

    // 1. SMTP thật
    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: toEmail,
          subject,
          html: htmlContent,
          text: `[UniEat Campus] Mã xác thực OTP của bạn là: ${code}. Mã có hiệu lực trong 5 phút.`,
        });
        console.log(`[EmailService] Đã gửi thư tới ${toEmail} (${info.messageId})`);
        return true;
      } catch (err: any) {
        console.error(`[EmailService] Lỗi gửi SMTP:`, err.message);
      }
    }

    try {
      const testTransporter = await this.getTestTransporter();
      const info = await testTransporter.sendMail({
        from: `"${fromName}" <${this.testAccount!.user}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📧 [Ethereal] Đã gửi tới: ${toEmail}`);
      console.log(`Mã OTP: [ ${code} ]`);
      if (previewUrl) console.log(`🔗 Preview: ${previewUrl}`);
      return true;
    } catch (err: any) {
      console.warn('[EmailService] Ethereal fallback lỗi:', err.message);
      return false;
    }
  }
}

export const emailService = new EmailService();