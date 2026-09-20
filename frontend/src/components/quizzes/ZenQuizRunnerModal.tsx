import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, Question } from '../../types/quiz';
import { api, ApiError } from '../../lib/api-client';
import { useUiStore } from '../../stores/ui-store';
import { BlockAstViewer } from '../editor/block-ast-viewer';

interface ZenQuizRunnerModalProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (result: {
    attempt: QuizAttempt;
    totalScore: number;
    maxScore: number;
    isPassed: boolean;
    quiz: Quiz;
    questions: Question[];
    userAnswers: Record<string, string>;
  }) => void;
}

export const ZenQuizRunnerModal: React.FC<ZenQuizRunnerModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onCompleted,
}) => {
  const { addToast } = useUiStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [fullQuiz, setFullQuiz] = useState<Quiz | null>(null);

  // Load full quiz with questions and start/resume attempt
  useEffect(() => {
    if (quiz && isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setLoadingQuestions(true);

      // Fetch quiz details (with sanitized questions)
      api
        .get<{ success: boolean; data: Quiz }>(`/quizzes/${quiz.id}`)
        .then((res) => {
          if (res.success && res.data) {
            setFullQuiz(res.data);
          }
        })
        .catch((err) => {
          const msg = err instanceof ApiError ? err.message : 'Gagal memuat butir soal';
          addToast(msg, 'error');
        })
        .finally(() => {
          setLoadingQuestions(false);
        });

      // Start attempt
      api
        .post<{ success: boolean; data: QuizAttempt; message: string }>(
          `/quizzes/${quiz.id}/attempts`
        )
        .then((res) => {
          if (res.success && res.data) {
            setAttempt(res.data);
          }
        })
        .catch((err) => {
          const msg = err instanceof ApiError ? err.message : 'Gagal memulai sesi pengerjaan kuis';
          addToast(msg, 'error');
        });
    }
  }, [quiz, isOpen, addToast]);

  const questions = fullQuiz?.questions || quiz?.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attempt?.id) {
      addToast('Sesi pengerjaan belum siap. Mohon tunggu sejenak.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || undefined,
      }));

      const res = await api.post<{
        success: boolean;
        message: string;
        data: {
          attempt: QuizAttempt;
          totalScore: number;
          maxScore: number;
          isPassed: boolean;
          passingScore: number;
        };
      }>(`/attempts/${attempt.id}/submit`, {
        answers: answersPayload,
      });

      if (res.success && res.data) {
        addToast('Jawaban kuis berhasil dikumpulkan!', 'success');
        onCompleted({
          attempt: res.data.attempt,
          totalScore: res.data.totalScore,
          maxScore: res.data.maxScore,
          isPassed: res.data.isPassed,
          quiz: fullQuiz || quiz!,
          questions,
          userAnswers: selectedAnswers,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Gagal mengumpulkan jawaban kuis';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !quiz) return null;

  return (
    <div
      id="takeQuizModal"
      className="fixed inset-0 z-50 bg-chem-dark/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-sans"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-xl max-h-[92vh] rounded-3xl shadow-float flex flex-col overflow-hidden border border-chem-border">
        {/* Runner Minimalist Header */}
        <div className="px-6 py-4 border-b border-chem-border flex items-center justify-between bg-chem-paper shrink-0">
          <div>
            <h3 id="runnerQuizTitle" className="font-serif text-base font-semibold text-chem-dark">
              {quiz.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-chem-ash font-sans mt-0.5">
              <span id="runnerQuizCounter">
                {questions.length > 0
                  ? `Pertanyaan ${currentIndex + 1} dari ${questions.length}`
                  : 'Memuat butir soal...'}
              </span>
              <span className="hidden sm:inline text-chem-ash/70">• Santai tanpa timer mundur</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-chem-ash hover:text-chem-dark flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-chem-subtle transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
            <span>Keluar</span>
          </button>
        </div>

        {/* Question Contents Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {loadingQuestions || !currentQuestion ? (
            <div className="py-12 text-center text-xs text-chem-ash">
              <div className="w-8 h-8 mx-auto mb-3 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
              Memuat butir pertanyaan...
            </div>
          ) : (
            <>
              {/* Question Text / Prompt */}
              <div id="runnerQuestionContents" className="space-y-3">
                <div className="font-serif text-base sm:text-lg text-chem-dark font-medium leading-snug">
                  <BlockAstViewer contentJson={currentQuestion.promptJson} />
                </div>
              </div>

              {/* Choice Options */}
              <div id="runnerOptionsContainer" className="space-y-2.5 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  const letterKey = option.optionKey || ['A', 'B', 'C', 'D'][idx] || 'A';
                  const isSelected = selectedAnswers[currentQuestion.id] === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                        isSelected
                          ? 'border-chem-sage bg-chem-glow/40 shadow-xs'
                          : 'border-chem-border/90 bg-white hover:bg-chem-subtle/70 hover:border-chem-border'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-chem-forest text-chem-glow'
                            : 'bg-chem-subtle text-chem-dark'
                        }`}
                      >
                        {letterKey}
                      </div>

                      <div className="text-xs sm:text-sm text-chem-dark leading-relaxed flex-1">
                        {option.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="px-6 py-3.5 border-t border-chem-border bg-chem-subtle/40 flex items-center justify-between shrink-0">
          {currentIndex > 0 ? (
            <button
              type="button"
              id="runnerPrevBtn"
              onClick={handlePrev}
              className="px-4 py-2 bg-white border border-chem-border text-chem-dark text-xs font-semibold rounded-xl hover:bg-chem-subtle flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div />
          )}

          {!isLastQuestion ? (
            <button
              type="button"
              id="runnerNextBtn"
              onClick={handleNext}
              disabled={loadingQuestions}
              className="px-5 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <span>Berikutnya</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          ) : (
            <button
              type="button"
              id="runnerSubmitBtn"
              onClick={handleSubmit}
              disabled={isSubmitting || loadingQuestions}
              className="px-5 py-2 bg-chem-sage hover:bg-chem-moss text-white text-xs font-bold rounded-xl shadow-subtle flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <i className="fa-solid fa-check text-xs"></i>
              <span>{isSubmitting ? 'Mengumpulkan...' : 'Kirim Jawaban'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
