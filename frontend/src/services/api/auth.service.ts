import { apiClient } from './apiClient';
import { User } from '../../types';

export class AuthService {
  public async login(credentials: { email: string; password?: string }) {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', credentials);
    if (res?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('unieat_token', res.data.token);
    }
    return res;
  }

  public async register(userData: Partial<User> & { password?: string }) {
    const res = await apiClient.post<{ success: boolean; data: { user: User; token: string } }>('/auth/register', userData);
    if (res?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('unieat_token', res.data.token);
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
  }
}

export const authService = new AuthService();
