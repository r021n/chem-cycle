import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuizzesPage } from '../../src/features/quizzes/quizzes-page';
import { api } from '../../src/lib/api-client';
import { useAuthStore } from '../../src/stores/auth-store';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });

const mockQuiz = {
  id: 'quiz-1',
  title: 'Kuis Termokimia Dasar',
  slug: 'kuis-termokimia-dasar',
  passingScore: 70,
  timeLimitMinutes: 10,
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalQuestions: 2,
};

const renderPage = () =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/latihan']}>
        <Routes>
          <Route path="/latihan" element={<QuizzesPage />} />
          <Route path="/latihan/baru" element={<div>Create Quiz Page</div>} />
          <Route path="/latihan/:id/exam" element={<div>Exam Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('QuizzesPage Navigation Refactor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/my-attempts')) {
        return { success: true, data: [] };
      }
      if (url.endsWith('/quizzes')) {
        return { success: true, data: [mockQuiz] };
      }
      return { success: false, data: [] };
    });
  });

  it('navigates to the full exam page when starting a quiz (no modal)', async () => {
    useAuthStore.getState().setAuth(
      {
        id: 'std-1',
        username: 'siswa',
        email: 'siswa@chemcycle.id',
        fullName: 'Budi Pratama',
        role: 'student',
      },
      'fake-token'
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Kuis Termokimia Dasar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Mulai Kuis/i }));

    await waitFor(() => {
      expect(screen.getByText('Exam Page')).toBeInTheDocument();
    });
  });

  it('navigates admin to the full quiz editor page when creating a quiz (no modal)', async () => {
    useAuthStore.getState().setAuth(
      {
        id: 'adm-1',
        username: 'guru',
        email: 'guru@chemcycle.id',
        fullName: 'Dra. Siti',
        role: 'admin',
      },
      'fake-token'
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Buat Kuis Baru/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Buat Kuis Baru/i }));

    await waitFor(() => {
      expect(screen.getByText('Create Quiz Page')).toBeInTheDocument();
    });
  });
});