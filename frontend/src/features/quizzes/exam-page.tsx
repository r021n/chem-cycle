import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { Spinner } from '../../components/ui/spinner';
import { AttemptReviewModal } from './attempt-review-modal';
import { useUiStore } from '../../stores/ui-store';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    attempt: QuizAttempt;
    totalScore: number;
    maxScore: number;
    isPassed: boolean;
    passingScore: number;
  } | null>(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // 1. Fetch Quiz Details (Questions & Options)
  const { data: quizData, isLoading: loadingQuiz } = useQuery({
    queryKey: queryKeys.quizzes.detail(id || ''),
    queryFn: () => api.get<{ success: boolean; data: Quiz }>(`/quizzes/${id}`),
    enabled: !!id,
  });

  const quiz = quizData?.data;

  // 2. Start or Resume Attempt
  const { data: attemptData, isLoading: loadingAttempt, error: attemptError } = useQuery({
    queryKey: ['quizzes', id, 'active-attempt'],
    queryFn: () =>
      api.post<{ success: boolean; data: QuizAttempt; message: string }>(`/quizzes/${id}/attempts`),
    enabled: !!id && !submittedResult,
    retry: false,
  });

  const attempt = attemptData?.data;

  const submitRef = useRef<() => void>(() => {});

  // Timer countdown
  useEffect(() => {
    if (quiz?.timeLimitMinutes && timeLeft === null) {
      setTimeLeft(quiz.timeLimitMinutes * 60);
    }
  }, [quiz?.timeLimitMinutes, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || submittedResult) return;
    if (timeLeft <= 0) {
      submitRef.current();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, submittedResult]);

  // Submit Attempt Mutation
  const submitMutation = useMutation({
    mutationFn: (answersPayload: { questionId: string; selectedOptionId?: string }[]) => {
      if (!attempt?.id) throw new Error('Attempt id not found');
      return api.post<{
        success: boolean;
        data: {
          attempt: QuizAttempt;
          totalScore: number;
          maxScore: number;
          isPassed: boolean;
          passingScore: number;
        };
      }>(`/attempts/${attempt.id}/submit`, { answers: answersPayload });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.list });
      setSubmittedResult(res.data);
      setConfirmModalOpen(false);
      addToast(
        res.data.isPassed
          ? 'Selamat! Anda lulus kuis ini.'
          : 'Kuis selesai. Nilai belum memenuhi KKM.',
        res.data.isPassed ? 'success' : 'info'
      );
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal mengumpulkan kuis';
      addToast(msg, 'error');
    },
  });

  const handleSubmitExam = () => {
    const questions = quiz?.questions || [];
    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id] || undefined,
    }));
    submitMutation.mutate(answersPayload);
  };

  submitRef.current = handleSubmitExam;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  if (loadingQuiz || loadingAttempt) {
    return <Spinner label="Menyiapkan lembar ujian kuis..." />;
  }

  // Attempt limit reached or error starting attempt
  if (attemptError) {
    const errorMsg = attemptError instanceof ApiError ? attemptError.message : 'Tidak dapat memulai ujian';
    return (
      <div className="border border-slate-200 p-8 text-center bg-white rounded-2xl max-w-lg mx-auto shadow-xs space-y-4">
        <div className="inline-flex p-3 rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Batas Percobaan Tercapai</h2>
        <p className="text-xs text-slate-500">{errorMsg}</p>
        <div className="pt-2 flex justify-center space-x-3">
          <Button variant="primary" onClick={() => navigate('/latihan')}>
            Kembali ke Katalog Kuis
          </Button>
        </div>
      </div>
    );
  }

  const questions = quiz?.questions || [];
  const currentQuestion = questions[activeQuestionIndex];
  const unansweredCount = questions.filter((q) => !selectedAnswers[q.id]).length;

  // Format countdown string
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Result View when submitted
  if (submittedResult) {
    const isPassed = submittedResult.isPassed;

    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="border border-chem-border p-8 bg-white/90 backdrop-blur-xs rounded-3xl shadow-subtle text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-chem-glow text-chem-forest">
            {isPassed ? <CheckCircle2 className="w-10 h-10 text-emerald-700" /> : <RotateCcw className="w-10 h-10 text-chem-forest" />}
          </div>

          <div>
            <span className="text-xs font-semibold text-chem-muted tracking-wider uppercase">
              Evaluasi Akhir Percobaan #{submittedResult.attempt.attemptNumber}
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-chem-dark mt-1">
              {isPassed ? 'Selamat, Kamu Lulus!' : 'Perlu Remediasi Mandiri'}
            </h1>
            <p className="text-xs text-chem-muted mt-1">
              Kuis: <span className="font-semibold text-chem-dark">{quiz?.title}</span>
            </p>
          </div>

          {/* Score Box */}
          <div className="border border-chem-border rounded-2xl p-6 bg-chem-subtle/60 max-w-sm mx-auto flex items-center justify-around shadow-subtle">
            <div>
              <div className="text-xs font-semibold text-chem-muted uppercase tracking-wider">Nilai Akhir</div>
              <div className="text-4xl font-serif font-bold text-chem-dark mt-1">{submittedResult.totalScore}</div>
            </div>
            <div className="h-10 border-r border-chem-border" />
            <div>
              <div className="text-xs font-semibold text-chem-muted uppercase tracking-wider">KKM Minimum</div>
              <div className="text-2xl font-serif font-bold text-chem-charcoal mt-1">{submittedResult.passingScore}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={() => setReviewModalOpen(true)}
            >
              Review Jawaban & Pembahasan
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setSubmittedResult(null);
                setSelectedAnswers({});
                setActiveQuestionIndex(0);
                queryClient.invalidateQueries({ queryKey: ['quizzes', id, 'active-attempt'] });
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Ulangi Kuis
            </Button>

            <Link to="/materi">
              <Button variant="secondary">
                <BookOpen className="w-3.5 h-3.5 mr-1" /> Kembali ke Materi
              </Button>
            </Link>
          </div>
        </div>

        {/* Answer Review Modal */}
        {reviewModalOpen && (
          <AttemptReviewModal
            attemptId={submittedResult.attempt.id}
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
          />
        )}
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="border border-chem-border p-8 text-center bg-white/90 backdrop-blur-xs rounded-3xl max-w-lg mx-auto shadow-subtle space-y-3">
        <h2 className="text-xl font-serif font-bold text-chem-dark">Kuis Belum Memiliki Soal</h2>
        <p className="text-xs text-chem-muted">
          Admin belum menambahkan pertanyaan untuk kuis ini.
        </p>
        <Button variant="primary" onClick={() => navigate('/latihan')} className="mt-2">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <div className="border border-chem-border p-5 bg-white/90 backdrop-blur-xs rounded-2xl shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="teacher">
              Percobaan #{attempt?.attemptNumber || 1}
            </Badge>
            <span className="text-xs text-chem-muted font-medium">KKM: {quiz.passingScore}</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-chem-dark mt-1">
            {quiz.title}
          </h1>
        </div>

        {/* Timer Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
          {timeLeft !== null && (
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                timeLeft <= 300
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Sisa Waktu: {formatTime(timeLeft)}</span>
            </div>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={() => setConfirmModalOpen(true)}
            isLoading={submitMutation.isPending}
          >
            Selesai Ujian
          </Button>
        </div>
      </div>

      {/* Main Exam Grid: Left Active Question (3 cols), Right Palette (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Question Prompt & Options (3 cols) */}
        <div className="lg:col-span-3 border border-chem-border p-6 md:p-8 bg-white/90 backdrop-blur-xs rounded-2xl shadow-subtle space-y-6">
          {/* Question Index Badge */}
          <div className="flex items-center justify-between border-b border-chem-border/60 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-serif font-bold text-chem-dark">
                Soal Nomor {activeQuestionIndex + 1}
              </span>
              <span className="text-xs text-chem-muted">
                dari {questions.length} Soal
              </span>
            </div>
            <span className="text-xs font-semibold text-chem-muted">
              Bobot: {currentQuestion.scoreWeight} Poin
            </span>
          </div>

          {/* Question Multi-Content AST Viewer */}
          <div className="py-2 min-h-[120px]">
            <BlockAstViewer contentJson={currentQuestion.promptJson} />
          </div>

          {/* Options Selection (A, B, C, D, E) */}
          <div className="space-y-2.5 pt-4 border-t border-chem-border/60">
            <div className="text-xs font-semibold text-chem-muted mb-2 tracking-wide">
              PILIH SATU JAWABAN YANG PALING TEPAT:
            </div>

            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswers[currentQuestion.id] === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 select-none cursor-pointer ${
                    isSelected
                      ? 'border-chem-forest bg-chem-glow/40 text-chem-dark ring-1 ring-chem-forest font-semibold shadow-xs'
                      : 'border-chem-border bg-white hover:border-chem-sage hover:bg-chem-subtle/50 text-chem-charcoal'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isSelected ? 'bg-chem-forest text-chem-glow' : 'bg-chem-subtle text-chem-charcoal'
                    }`}
                  >
                    {opt.optionKey}
                  </div>
                  <div className="text-xs md:text-sm leading-relaxed min-w-0 break-words">{opt.content}</div>
                </div>
              );
            })}
          </div>

          {/* Prev / Next Question Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-6 border-t border-chem-border/60">
            <Button
              size="sm"
              variant="outline"
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Soal Sebelumnya
            </Button>

            <span className="text-xs text-chem-muted font-medium">
              {activeQuestionIndex + 1} / {questions.length}
            </span>

            {activeQuestionIndex < questions.length - 1 ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
              >
                Soal Berikutnya <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setConfirmModalOpen(true)}
              >
                Kumpulkan Ujian
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette Grid (1 col) */}
        <div className="border border-chem-border p-5 bg-white/90 backdrop-blur-xs rounded-2xl shadow-subtle space-y-4 h-fit sticky top-20">
          <div className="border-b border-chem-border/60 pb-2">
            <h3 className="text-xs font-serif font-bold text-chem-dark uppercase tracking-wider">
              Navigasi Nomor Soal
            </h3>
            <p className="text-[11px] text-chem-muted mt-0.5">
              Klik nomor untuk langsung melompat ke soal.
            </p>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = idx === activeQuestionIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`h-9 rounded-lg flex items-center justify-center font-medium text-xs border transition-all cursor-pointer ${
                    isCurrent
                      ? 'ring-2 ring-chem-forest ring-offset-1 border-chem-forest font-bold'
                      : 'border-chem-border'
                  } ${
                    isAnswered
                      ? 'bg-chem-forest text-chem-glow border-chem-forest font-bold'
                      : 'bg-chem-subtle/70 text-chem-charcoal hover:bg-chem-subtle'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="pt-3 border-t border-chem-border/60 space-y-1.5 text-xs text-chem-muted">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-chem-forest rounded-sm inline-block" />
              <span>Sudah Dijawab ({Object.keys(selectedAnswers).length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-chem-subtle border border-chem-border rounded-sm inline-block" />
              <span>Belum Dijawab ({unansweredCount})</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              variant="primary"
              className="w-full"
              onClick={() => setConfirmModalOpen(true)}
            >
              Kumpulkan Ujian
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Konfirmasi Pengumpulan Jawaban"
        description="Seluruh soal telah berhasil Anda jawab. Pastikan jawaban telah diperiksa kembali sebelum dikumpulkan."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-chem-border bg-chem-subtle/50 text-xs text-chem-charcoal space-y-2">
            <div className="flex justify-between">
              <span>Total Soal:</span>
              <span className="font-bold text-chem-dark">{questions.length} Soal</span>
            </div>
            <div className="flex justify-between">
              <span>Sudah Dijawab:</span>
              <span className="font-bold text-emerald-700">
                {Object.keys(selectedAnswers).length} Soal
              </span>
            </div>
            <div className="flex justify-between">
              <span>Belum Dijawab:</span>
              <span className="font-bold text-rose-700">
                {unansweredCount} Soal
              </span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
              ⚠️ Masih ada {unansweredCount} soal yang belum Anda jawab. Tetap ingin mengumpulkan?
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
            >
              Periksa Kembali
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitExam}
              isLoading={submitMutation.isPending}
            >
              Ya, Kumpulkan Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
