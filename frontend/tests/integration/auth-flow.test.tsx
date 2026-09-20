import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../src/features/auth/login-page';
import { RegisterPage } from '../../src/features/auth/register-page';
import { api } from '../../src/lib/api-client';
import { useAuthStore } from '../../src/stores/auth-store';

describe('Auth Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
    vi.restoreAllMocks();
  });

  it('should render LoginPage and populate demo teacher credentials on click', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Masuk ChemCycle/i })).toBeInTheDocument();

    const quickTeacherBtn = screen.getByRole('button', { name: /Akun Guru/i });
    fireEvent.click(quickTeacherBtn);

    const emailInput = screen.getByLabelText(/Email atau Username/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Kata Sandi/i) as HTMLInputElement;

    expect(emailInput.value).toBe('guru@chemcycle.id');
    expect(passwordInput.value).toBe('admin123');
  });

  it('should call api.post on login submit and set authenticated user in store', async () => {
    const mockPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      success: true,
      message: 'Login berhasil',
      data: {
        token: 'test-token-jwt',
        user: {
          id: 'u-1',
          username: 'gurukimia',
          email: 'guru@chemcycle.id',
          fullName: 'Siti Nurhaliza',
          role: 'admin',
        },
      },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email atau Username/i), {
      target: { value: 'guru@chemcycle.id' },
    });
    fireEvent.change(screen.getByLabelText(/Kata Sandi/i), {
      target: { value: 'admin123' },
    });

    const submitBtn = screen.getByRole('button', { name: /Masuk ke Akun/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        identifier: 'guru@chemcycle.id',
        password: 'admin123',
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.role).toBe('admin');
    });
  });

  it('should render RegisterPage and allow switching role selection between student and teacher', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Daftar Akun Baru/i })).toBeInTheDocument();

    const teacherRoleBtn = screen.getByRole('button', { name: /Guru \(Admin\)/i });
    fireEvent.click(teacherRoleBtn);

    expect(screen.getByLabelText(/Nomor Induk Pegawai \(NIP\)/i)).toBeInTheDocument();

    const studentRoleBtn = screen.getByRole('button', { name: /Siswa \(Student\)/i });
    fireEvent.click(studentRoleBtn);

    expect(screen.getByLabelText(/Nomor Induk Siswa Nasional \(NISN\)/i)).toBeInTheDocument();
  });
});
