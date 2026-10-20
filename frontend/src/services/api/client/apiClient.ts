const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('unieat_token') || localStorage.getItem('unieat_jwt');
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...customConfig } = options;

    let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const token = this.getToken();
    let currentUserId: string | null = null;
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('unieat_current_user') : null;
      if (userStr) {
        currentUserId = JSON.parse(userStr)?.id || null;
      }
    } catch {}

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(currentUserId ? { 'X-User-Id': currentUserId } : {}),
        ...headers,
      },
      ...customConfig,
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn(`[ApiClient Error] ${endpoint}:`, err);
      throw err;
    }
  }

  public get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  public post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }
}

export const apiClient = new ApiClient();
