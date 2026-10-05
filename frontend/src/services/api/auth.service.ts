import { apiClient } from './apiClient';
import { User } from '../../types';

export type OtpChannel = 'SMS' | 'EMAIL';
export type OtpType = 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | '2FA_LOGIN';

export interface SendOtpResponse {
  success: boolean;
  message: string;
  data: {
    recipient: string;
    maskedRecipient: string;
    channel: OtpChannel;
    type: OtpType;
    expiresInSeconds: number;
    debugOtp?: string;
  };
}

export class AuthService {
  public async login(credentials: { email: string; password?: string }) {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string }; message?: string }>('/auth/login', credentials);
    if (res?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('unieat_token', res.data.token);
      localStorage.setItem('unieat_jwt', res.data.token);
    }
    return res;
  }

  public async register(userData: Partial<User> & { password?: string }) {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string }; message?: string }>('/auth/register', userData);
    if (res?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('unieat_token', res.data.token);
      localStorage.setItem('unieat_jwt', res.data.token);
    }
    return res;
  }

  /**
   * Gửi mã OTP xác thực qua SMS hoặc Email
   */
  public async sendOtp(params: {
    recipient: string;
    channel: OtpChannel;
    type: OtpType;
  }): Promise<SendOtpResponse> {
    return apiClient.post<SendOtpResponse>('/auth/otp/send', params);
  }

  /**
   * Xác thực mã OTP độc lập
   */
  public async verifyOtp(params: {
    recipient: string;
    code: string;
    type: OtpType;
  }) {
    return apiClient.post<{ success: boolean; message: string; data?: { valid: boolean } }>('/auth/otp/verify', params);
  }

  /**
   * Đăng ký tài khoản kèm bước xác thực OTP SMS / Email
   */
  public async registerWithOtp(userData: Partial<User> & {
    password?: string;
    otpCode: string;
    channel: OtpChannel;
  }) {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string }; message?: string }>(
      '/auth/register-with-otp',
      userData
    );
    if (res?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('unieat_token', res.data.token);
      localStorage.setItem('unieat_jwt', res.data.token);
    }
    return res;
  }

  /**
   * Đăng nhập nhanh bằng mã OTP SMS / Email
   */
  public async loginWithOtp(params: { recipient: string; otpCode: string }) {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string }; message?: string }>(
      '/auth/login-with-otp',
      params
    );
    if (res?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('unieat_token', res.data.token);
      localStorage.setItem('unieat_jwt', res.data.token);
    }
    return res;
  }

  /**
   * Khởi tạo bảo mật 2 lớp 2FA cho đăng nhập mật khẩu
   */
  public async initiate2faLogin(credentials: {
    email: string;
    password: string;
    preferredChannel?: OtpChannel;
  }) {
    return apiClient.post<{
      success: boolean;
      require2FA: boolean;
      message: string;
      data: {
        userId: string;
        email: string;
        phone: string;
        channel: OtpChannel;
        recipient: string;
        maskedRecipient: string;
        debugOtp?: string;
      };
    }>('/auth/login-2fa-init', credentials);
  }

  /**
   * Xác thực mã 2FA để hoàn tất đăng nhập an toàn
   */
  public async verify2faLogin(params: { recipient: string; code: string }) {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string }; message?: string }>(
      '/auth/login-2fa-verify',
      params
    );
    if (res?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('unieat_token', res.data.token);
      localStorage.setItem('unieat_jwt', res.data.token);
    }
    return res;
  }

  public async getProfile(): Promise<User | null> {
    const res = await apiClient.get<{ success: boolean; data: User }>('/users/profile');
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  }

  public async updateProfile(data: Partial<User>): Promise<User | null> {
    const res = await apiClient.put<{ success: boolean; data: User }>('/users/profile', data);
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  }

  public logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('unieat_token');
    localStorage.removeItem('unieat_jwt');
  }
}

export const authService = new AuthService();
