// src/services/infrastructure/email.service.ts
import nodemailer, { Transporter, TestAccount } from 'nodemailer';

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  private testAccount: TestAccount | null = null;
  private testTransporter: Transporter | null = null;

  constructor() { }

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

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ea580c; text-align: center;">UniEat Campus - Xác thực OTP</h2>
        <p>Xin chào,</p>
        <p>Bạn đang thực hiện thao tác: <strong>${actionText}</strong> trên hệ thống UniEat Campus.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ea580c; background-color: #fff7ed; padding: 12px 24px; border-radius: 6px; border: 1px dashed #fdba74;">${code}</span>
        </div>
        <p>Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai khác.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">Đây là email tự động từ UniEat Campus. Vui lòng không trả lời thư này.</p>
      </div>
    `;

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
