import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExamPage } from '../../src/features/quizzes/exam-page';
import { api } from '../../src/lib/api-client';
import { useAuthStore } from '../../src/stores/auth-store';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });

describe('Exam Engine Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
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
    vi.restoreAllMocks();
  });

  it('should load quiz questions and allow student to select options and submit', async () => {
    const mockQuiz = {
      id: 'quiz-1',
      title: 'Kuis Termokimia Dasar',
      passingScore: 70,
      timeLimitMinutes: 10,
      maxAttempts: 3,
      questions: [
        {
          id: 'q-1',
          promptJson: JSON.stringify([
            { id: 'b-1', type: 'paragraph', content: [{ type: 'text', text: 'Reaksi eksoterm adalah...' }] },
          ]),
          scoreWeight: 50,
          options: [
            { id: 'opt-a', optionKey: 'A', content: 'Menyerap kalor dari lingkungan' },
            { id: 'opt-b', optionKey: 'B', content: 'Melepaskan kalor ke lingkungan' },
          ],
        },
        {
          id: 'q-2',
          promptJson: JSON.stringify([
            { id: 'b-2', type: 'paragraph', content: [{ type: 'text', text: 'Satuan kalor adalah...' }] },
          ]),
          scoreWeight: 50,
          options: [
            { id: 'opt-c', optionKey: 'A', content: 'Joule atau Kalori' },
            { id: 'opt-d', optionKey: 'B', content: 'Meter per detik' },
          ],
        },
      ],
    };

    const mockAttempt = {
      id: 'att-1',
      quizId: 'quiz-1',
      userId: 'std-1',
      attemptNumber: 1,
      totalScore: 0,
      maxScore: 100,
      isPassed: false,
      startedAt: new Date().toISOString(),
    };

    vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/quizzes/quiz-1')) {
        return { success: true, data: mockQuiz };
      }
      return { success: false };
    });

    vi.spyOn(api, 'post').mockImplementation(async (url: string) => {
      if (url.includes('/quizzes/quiz-1/attempts')) {
        return { success: true, data: mockAttempt, message: 'Attempt created' };
      }
      if (url.includes('/attempts/att-1/submit')) {
        return {
          success: true,
          message: 'Jawaban dinilai',
          data: {
            attempt: { ...mockAttempt, totalScore: 100, isPassed: true },
            totalScore: 100,
            maxScore: 100,
            isPassed: true,
            passingScore: 70,
          },
        };
      }
      return { success: false };
    });

    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/latihan/quiz-1/exam']}>
          <Routes>
            <Route path="/latihan/:id/exam" element={<ExamPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for quiz title and questions to render
    await waitFor(() => {
      expect(screen.getByText('Kuis Termokimia Dasar')).toBeInTheDocument();
      expect(screen.getByText('Reaksi eksoterm adalah...')).toBeInTheDocument();
    });

    // Option selection
    const optionB = screen.getByText('Melepaskan kalor ke lingkungan');
    fireEvent.click(optionB);

    // Navigate to next question
    const nextBtn = screen.getByRole('button', { name: /Soal Berikutnya/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText('Satuan kalor adalah...')).toBeInTheDocument();
    });

    // Select option for Question 2
    const optionC = screen.getByText('Joule atau Kalori');
    fireEvent.click(optionC);

    // Submit exam
    const submitBtn = screen.getAllByRole('button', { name: /Kumpulkan Ujian/i })[0];
    fireEvent.click(submitBtn);

    // Confirmation modal should show
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Konfirmasi Pengumpulan Jawaban/i })).toBeInTheDocument();
      expect(screen.getByText('telah berhasil Anda jawab.', { exact: false })).toBeInTheDocument();
    });

    // Confirm submission
    const confirmSubmitBtn = screen.getByRole('button', { name: /Ya, Kumpulkan Sekarang/i });
    fireEvent.click(confirmSubmitBtn);

    // Expect instant result screen to appear with Passed badge and score 100
    await waitFor(() => {
      expect(screen.getByText(/Selamat, Kamu Lulus!/i)).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });
});
