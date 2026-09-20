import { create } from 'zustand';
import { UserSession } from '../types/auth';

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserSession, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserSession>) => void;
  setRole: (role: 'admin' | 'student') => void;
}

const STORAGE_KEY_TOKEN = 'chemcycle_token';
const STORAGE_KEY_USER = 'chemcycle_user';

const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
let storedUser: UserSession | null = null;
try {
  const parsed = localStorage.getItem(STORAGE_KEY_USER);
  if (parsed) {
    storedUser = JSON.parse(parsed);
  }
} catch {
  storedUser = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken && !!storedUser,

  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (partialUser) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partialUser };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      return { user: updated };
    });
  },

  setRole: (role) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, role };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      return { user: updated };
    });
  },
}));
