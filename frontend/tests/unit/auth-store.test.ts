import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/stores/auth-store';
import { UserSession } from '../../src/types/auth';

describe('Auth Store Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
  });

  it('should initialize with empty state when localStorage is clean', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set auth state and persist to localStorage', () => {
    const mockUser: UserSession = {
      id: 'usr-1',
      username: 'siswakimia',
      email: 'siswa@chemcycle.id',
      fullName: 'Budi Pratama',
      role: 'student',
    };
    const mockToken = 'mock-jwt-token-123';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe('usr-1');
    expect(state.token).toBe(mockToken);
    expect(localStorage.getItem('chemcycle_token')).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem('chemcycle_user') || '{}').username).toBe('siswakimia');
  });

  it('should clear auth state and remove tokens on clearAuth', () => {
    const mockUser: UserSession = {
      id: 'usr-2',
      username: 'gurukimia',
      email: 'guru@chemcycle.id',
      fullName: 'Siti Nurhaliza',
      role: 'admin',
    };
    useAuthStore.getState().setAuth(mockUser, 'mock-token');

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('chemcycle_token')).toBeNull();
  });

  it('should update user fields reactively', () => {
    const mockUser: UserSession = {
      id: 'usr-3',
      username: 'siswa3',
      email: 'siswa3@chemcycle.id',
      fullName: 'Old Name',
      role: 'student',
    };
    useAuthStore.getState().setAuth(mockUser, 'mock-token');

    useAuthStore.getState().updateUser({ fullName: 'New Updated Name', bio: 'Chem fan' });

    const state = useAuthStore.getState();
    expect(state.user?.fullName).toBe('New Updated Name');
    expect(state.user?.bio).toBe('Chem fan');
  });

  it('should explicitly set role using setRole', () => {
    const mockUser: UserSession = {
      id: 'usr-5',
      username: 'user5',
      email: 'user5@chemcycle.id',
      fullName: 'User 5',
      role: 'student',
    };
    useAuthStore.getState().setAuth(mockUser, 'mock-token');

    useAuthStore.getState().setRole('admin');
    expect(useAuthStore.getState().user?.role).toBe('admin');

    useAuthStore.getState().setRole('student');
    expect(useAuthStore.getState().user?.role).toBe('student');
  });
});
