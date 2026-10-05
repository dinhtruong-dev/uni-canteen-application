/**
 * ==============================================================================
 * DỊCH VỤ GỬI EMAIL THẬT (REAL NODEMAILER SMTP SERVICE)
 * ==============================================================================
 * Gửi thư email thật tới hòm thư sinh viên/khách hàng qua giao thức SMTP (Gmail,
 * Outlook, Edu Mail, hoặc Custom SMTP Server).
 * ==============================================================================
 */

import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  private constructor() {
    this.initTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Khởi tạo Transporter Nodemailer từ cấu hình .env
   */
  private initTransporter(): void {
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
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      this.isConfigured = true;
      console.log(`[Email Service] ✅ Đã khởi tạo cổng gửi Email SMTP qua tài khoản: ${user} (${host}:${port})`);
    } else {
      this.isConfigured = false;
      console.warn(`[Email Service] ⚠️ Chưa điền SMTP_USER / SMTP_PASS trong file backend/.env! Thư sẽ được gửi bằng Ethereal Test Relay hoặc hiển thị chi tiết log.`);
    }
  }

  /**
   * Gửi mã OTP xác thực tới địa chỉ email thực tế
   */
  public async sendOtpEmail(toEmail: string, code: string, type: string): Promise<boolean> {
    const fromName = process.env.SMTP_FROM_NAME || 'UniEat Campus';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@unieat.campus.edu.vn';

    const actionText =
      type === 'REGISTER'
        ? 'đăng ký tài khoản sinh viên mới'
        : type === 'LOGIN' || type === '2FA_LOGIN'
          ? 'xác minh bảo mật 2 lớp đăng nhập'
          : 'khôi phục mật khẩu tài khoản';

    const subject = `[UniEat Campus] Mã xác thực OTP của bạn là: ${code}`;

    const htmlContent = `
    <!DOCTYPE html> 
    <html lang="vi"> 
      <head> 
        <meta charset="utf-8"> 
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        <title>${subject}</title>
        </head>  
            <body style=" margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; color: #222222; "> <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 16px;" > <tr> <td align="center"> <!-- Main Container -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style=" max-width: 560px; background-color: #ffffff; border: 1px solid #e5e5e5; " > <!-- Header --> <tr> <td style=" padding: 28px 36px; border-bottom: 1px solid #e5e5e5; " > <div style=" font-size: 20px; font-weight: 700; color: #111111; margin-bottom: 6px; " > UniEat Campus </div> <div style=" font-size: 13px; color: #666666; " > Hệ thống căng tin trường học </div> </td> </tr> <!-- Content --> <tr> <td style="padding: 36px;"> <h1 style=" margin: 0 0 18px 0; font-size: 22px; line-height: 1.4; font-weight: 600; color: #111111; " > Xác thực tài khoản </h1> <p style=" margin: 0 0 18px 0; font-size: 14px; line-height: 1.7; color: #444444; " > Xin chào, </p> <p style=" margin: 0 0 24px 0; font-size: 14px; line-height: 1.7; color: #444444; " > Hệ thống UniEat đã nhận được yêu cầu <strong>${actionText}</strong> cho tài khoản sử dụng địa chỉ email: </p> <p style=" margin: 0 0 28px 0; font-size: 14px; font-weight: 600; color: #111111; " > ${toEmail} </p> <!-- OTP --> <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;" > <tr> <td align="center" style=" padding: 24px; background-color: #fafafa; border: 1px solid #dddddd; " > <div style=" font-family: 'Courier New', Courier, monospace; font-size: 34px; line-height: 1.2; font-weight: 700; letter-spacing: 8px; color: #111111; " > ${code} </div> </td> </tr> </table> <p style=" margin: 0 0 28px 0; font-size: 13px; line-height: 1.6; color: #666666; text-align: center; " > Mã xác thực có hiệu lực trong <strong>5 phút</strong>. </p> <!-- Security Notice --> <div style=" padding: 16px; background-color: #f8f8f8; border: 1px solid #e5e5e5; margin-bottom: 28px; " > <p style=" margin: 0; font-size: 12px; line-height: 1.6; color: #555555; " > <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã xác thực này với bất kỳ người nào. Nhân viên UniEat sẽ không yêu cầu bạn cung cấp mã OTP. </p> </div> <p style=" margin: 0; font-size: 12px; line-height: 1.6; color: #888888; " > Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email. Tài khoản của bạn sẽ không bị thay đổi nếu mã xác thực không được sử dụng. </p> </td> </tr> <!-- Footer --> <tr> <td style=" padding: 20px 36px; background-color: #fafafa; border-top: 1px solid #e5e5e5; text-align: center; " > <p style=" margin: 0 0 6px 0; font-size: 11px; color: #777777; " > UniEat Campus System </p> <p style=" margin: 0; font-size: 11px; color: #999999; " > Email này được gửi tự động. Vui lòng không trả lời email này. </p> </td> </tr> </table> </td> </tr> </table> </body> </html>
    `;

    // 1. Nếu đã cấu hình SMTP trong .env -> Gửi mail thật ngay lập tức!
    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: toEmail,
          subject,
          html: htmlContent,
          text: `[UniEat Campus] Mã xác thực OTP của bạn là: ${code}. Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai!`,
        });

        console.log(`[Email Service] 🚀 ĐÃ GỬI THÀNH CÔNG THƯ THẬT tới: ${toEmail} (MessageId: ${info.messageId})`);
        return true;
      } catch (err: any) {
        console.error(`[Email Service Error] ❌ Lỗi gửi email thật qua SMTP:`, err.message);
        // Tiếp tục thử test account nếu SMTP bị lỗi
      }
    }

    // 2. Nếu chưa cấu hình SMTP_USER trong .env -> Tự động dùng Ethereal Real Email Test Transporter
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: `"${fromName}" <${testAccount.user}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`================================================================================`);
      console.log(`📧 [EMAIL SENT REAL TEST]: Đã gửi thư thành công tới: ${toEmail}`);
      console.log(`Mã OTP: [ ${code} ]`);
      if (previewUrl) {
        console.log(`🔗 Link xem trực tiếp hộp thư thực tế: ${previewUrl}`);
      }
      console.log(`================================================================================`);
      return true;
    } catch (testErr: any) {
      console.warn('[Email Service Fallback]:', testErr.message);
      return false;
    }
  }
}

export const emailService = EmailService.getInstance();
