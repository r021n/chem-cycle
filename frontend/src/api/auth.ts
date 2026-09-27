import { apiClient, setStoredToken, removeStoredToken } from './client';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AdminUser;
}

export const authApi = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const res = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    if (res.token) {
      setStoredToken(res.token);
    }

    return res;
  },

  async logout(): Promise<void> {
    removeStoredToken();
  },

  async getMe(): Promise<{ success: boolean; user: AdminUser }> {
    return apiClient('/auth/me', { method: 'GET' });
  },

  async updateProfile(profile: Partial<AdminUser>): Promise<{ success: boolean; message: string }> {
    return apiClient('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  async changePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  },
};
