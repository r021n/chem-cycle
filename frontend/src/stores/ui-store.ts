import { create } from 'zustand';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  mobileNavOpen: boolean;
  toasts: ToastItem[];
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  toasts: [],

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((s) => ({
      toasts: [...s.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((s) => ({
        toasts: s.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
}));
