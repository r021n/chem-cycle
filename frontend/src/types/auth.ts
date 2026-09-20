export type UserRole = 'admin' | 'student';

export interface UserSession {
  id: string;
  username: string;
  email: string;
  fullName: string;
  identityNumber?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: UserSession;
  };
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
  identityNumber?: string;
  role?: UserRole;
  bio?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
