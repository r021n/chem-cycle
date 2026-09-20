import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ZenQuizRunnerModal } from '../../src/components/quizzes/ZenQuizRunnerModal';
import { QuizResultModal } from '../../src/components/quizzes/QuizResultModal';
import { Quiz, QuizAttempt } from '../../src/types/quiz';
import { api } from '../../src/lib/api-client';

describe('Zen Assessment Experience Integration Tests', () => {
  const mockQuiz: Quiz = {
    id: 'quiz-zen-1',
    title: 'Evaluasi Daur Fosfor & Sulfur',
    slug: 'daur-fosfor-sulfur',
    passingScore: 75,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-1',
        promptJson: JSON.stringify([
          { id: 'b1', type: 'paragraph', content: [{ type: 'text', text: 'Peran utama bakteri pereduksi sulfat adalah...' }] },
        ]),
        questionType: 'multiple_choice',
        scoreWeight: 50,
        orderIndex: 1,
        options: [
          { id: 'opt-1', optionKey: 'A', content: 'Mengubah sulfat menjadi gas H2S' },
          { id: 'opt-2', optionKey: 'B', content: 'Mengendapkan fosfat ke bebatuan' },
        ],
      },
      {
        id: 'q-2',
        promptJson: JSON.stringify([
          { id: 'b2', type: 'paragraph', content: [{ type: 'text', text: 'Siklus biogeokimia fosfor tidak melewati fase gas di...' }] },
        ]),
        questionType: 'multiple_choice',
        scoreWeight: 50,
        orderIndex: 2,
        options: [
          { id: 'opt-3', optionKey: 'A', content: 'Atmosfer bumi' },
          { id: 'opt-4', optionKey: 'B', content: 'Litosfer' },
        ],
      },
    ],
  };

  const mockAttempt: QuizAttempt = {
    id: 'att-zen-1',
    quizId: 'quiz-zen-1',
    userId: 'user-1',
    attemptNumber: 1,
    totalScore: 100,
    maxScore: 100,
    isPassed: true,
    startedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate through zen questions smoothly and allow option selection', async () => {
    vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/quizzes/quiz-zen-1')) {
        return { success: true, data: mockQuiz };
      }
      return { success: false };
    });

    vi.spyOn(api, 'post').mockImplementation(async (url: string) => {
      if (url.includes('/quizzes/quiz-zen-1/attempts')) {
        return { success: true, data: mockAttempt, message: 'Attempt created' };
      }
      return { success: false };
    });

    const handleClose = vi.fn();
    const handleCompleted = vi.fn();

    render(
      <ZenQuizRunnerModal
        isOpen={true}
        onClose={handleClose}
        quiz={mockQuiz}
        onCompleted={handleCompleted}
      />
    );

    // Wait for quiz title and questions to load
    await waitFor(() => {
      expect(screen.getByText('Evaluasi Daur Fosfor & Sulfur')).toBeInTheDocument();
      expect(screen.getByText('Pertanyaan 1 dari 2')).toBeInTheDocument();
      expect(screen.getByText('Peran utama bakteri pereduksi sulfat adalah...')).toBeInTheDocument();
    });

    // Select option A
    const optA = screen.getByText('Mengubah sulfat menjadi gas H2S');
    fireEvent.click(optA);

    // Click Next
    const nextBtn = screen.getByRole('button', { name: /Berikutnya/i });
    fireEvent.click(nextBtn);

    // Second question verification
    await waitFor(() => {
      expect(screen.getByText('Pertanyaan 2 dari 2')).toBeInTheDocument();
      expect(screen.getByText('Siklus biogeokimia fosfor tidak melewati fase gas di...')).toBeInTheDocument();
    });

    // Select option A
    const optAtmosfer = screen.getByText('Atmosfer bumi');
    fireEvent.click(optAtmosfer);

    // Previous button should work
    const prevBtn = screen.getByRole('button', { name: /Sebelumnya/i });
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(screen.getByText('Pertanyaan 1 dari 2')).toBeInTheDocument();
    });
  });

  it('should render calm QuizResultModal with score, pass state, and appreciation', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      success: true,
      data: {
        attempt: mockAttempt,
        questions: [],
      },
    });

    const handleClose = vi.fn();
    const handleRetake = vi.fn();

    render(
      <QuizResultModal
        isOpen={true}
        onClose={handleClose}
        onRetake={handleRetake}
        resultData={{
          attempt: mockAttempt,
          totalScore: 100,
          maxScore: 100,
          isPassed: true,
          quiz: mockQuiz,
        }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Pemahaman Sangat Baik!')).toBeInTheDocument();
      expect(screen.getByText('100 / 100')).toBeInTheDocument();
    });

    // Retake button
    const retakeBtn = screen.getByRole('button', { name: /Kerjakan Ulang/i });
    fireEvent.click(retakeBtn);
    expect(handleRetake).toHaveBeenCalledTimes(1);

    // Close / Selesai button
    const closeBtn = screen.getByRole('button', { name: /Selesai/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
