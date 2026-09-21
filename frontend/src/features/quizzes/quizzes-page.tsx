import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { AdminInspectionModal } from '../../components/quizzes/AdminInspectionModal';
import { formatDate } from '../../lib/utils';

export const QuizzesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'list' | 'history'>('list');

  const [inspectAttemptId, setInspectAttemptId] = useState<string | null>(null);
  const [inspectStudentName, setInspectStudentName] = useState<string>('');

  // 1. Fetch Quizzes List
  const { data: quizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: queryKeys.quizzes.list,
    queryFn: () => api.get<{ success: boolean; data: Quiz[] }>('/quizzes'),
  });

  const quizzes = quizzesData?.data || [];

  // 2. Fetch User Attempts across all quizzes (for History tab)
  const { data: userAttemptsData } = useQuery({
    queryKey: ['quizzes', 'all-user-attempts', user?.id],
    queryFn: async () => {
      if (!quizzes.length) return [];
      const promises = quizzes.map((q) =>
        api
          .get<{ success: boolean; data: QuizAttempt[] }>(`/quizzes/${q.id}/my-attempts`)
          .then((res) => (res.success ? res.data.map((att) => ({ ...att, quizTitle: q.title })) : []))
          .catch(() => [])
      );
      const results = await Promise.all(promises);
      return results.flat().sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    },
    enabled: quizzes.length > 0 && !!user,
  });

  const userAttempts = userAttemptsData || [];

  // Delete Quiz Mutation
  const deleteQuizMutation = useMutation({
    mutationFn: (quizId: string) => api.delete(`/quizzes/${quizId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.list });
      addToast('Kuis berhasil dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus kuis';
      addToast(msg, 'error');
    },
  });

  // Calculate best score & attempt count per quiz
  const getQuizStats = (quizId: string) => {
    const attempts = userAttempts.filter((a) => a.quizId === quizId && a.completedAt);
    const count = attempts.length;
    const bestScore = count > 0 ? Math.max(...attempts.map((a) => a.totalScore)) : null;
    return { count, bestScore };
  };

  const handleStartQuiz = (quiz: Quiz) => {
    navigate(`/latihan/${quiz.id}/exam`);
  };

  const handleInspection = (attemptId: string, studentName: string) => {
    setInspectAttemptId(attemptId);
    setInspectStudentName(studentName);
  };

  const tabClass = (active: boolean) =>
    `px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
      active ? 'bg-white text-chem-forest shadow-xs' : 'text-chem-ash hover:text-chem-dark'
    }`;

  return (
    <section id="page-latihan" className="page-view max-w-3xl mx-auto space-y-6 font-sans">
      {/* Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-chem-border pb-3">
        <div className="flex items-center gap-1 p-1 bg-chem-subtle rounded-xl text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            id="qtab-list"
            className={tabClass(activeTab === 'list')}
          >
            Kuis Tersedia
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            id="qtab-history"
            className={tabClass(activeTab === 'history')}
          >
            Riwayat Pengerjaan
          </button>
        </div>

        {isAdmin && (
          <div id="adminQuizCreateBtn" className="shrink-0">
            <button
              type="button"
              onClick={() => navigate('/latihan/baru')}
              className="px-3.5 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>Buat Kuis Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Kuis Tersedia */}
      {activeTab === 'list' && (
        <div id="quizView-list" className="space-y-3">
          {loadingQuizzes ? (
            <div className="py-12 text-center text-xs text-chem-ash">
              <div className="w-8 h-8 mx-auto mb-3 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
              Memuat daftar kuis pembelajaran...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-chem-border text-xs text-chem-ash">
              Belum ada kuis yang tersedia.
            </div>
          ) : (
            quizzes.map((quiz) => {
              const { count, bestScore } = getQuizStats(quiz.id);
              const hasAttempted = count > 0;

              return (
                <div
                  key={quiz.id}
                  className="bg-white rounded-2xl border border-chem-border p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                        Kuis
                      </span>
                      <span className="text-[10px] text-chem-ash/70">• {quiz.totalQuestions || 0} Soal</span>
                      <span className="text-[10px] text-chem-ash/70">• ~{quiz.timeLimitMinutes || 10} Menit</span>
                    </div>

                    <h3 className="font-serif text-base font-semibold text-chem-dark truncate">
                      {quiz.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-chem-ash">
                      {hasAttempted ? (
                        <>
                          <span className="px-2 py-0.5 rounded-full bg-chem-subtle text-chem-forest text-[11px] font-semibold whitespace-nowrap">
                            Pengerjaan: {count}x
                          </span>
                          <span className="text-[11px] font-medium text-chem-sage whitespace-nowrap">
                            Skor Terbaik: {bestScore}
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] text-chem-ash italic">
                          Belum pernah dikerjakan
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-4 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <i className={`fa-solid ${hasAttempted ? 'fa-rotate-right' : 'fa-play'} text-[10px]`}></i>
                      <span>{hasAttempted ? 'Kerjakan Ulang' : 'Mulai Kuis'}</span>
                    </button>

                    <Link
                      to={`/latihan/${quiz.id}/exam`}
                      className="p-2 text-chem-ash hover:text-chem-forest rounded-xl hover:bg-chem-subtle transition-colors cursor-pointer border border-chem-border/60 bg-white shrink-0"
                      title="Buka Mode Ujian Halaman Penuh"
                    >
                      <i className="fa-solid fa-expand text-xs"></i>
                    </Link>

                    {isAdmin && (
                      <div className="flex items-center gap-1 pl-1 border-l border-chem-border">
                        <Link
                          to={`/latihan/${quiz.id}/edit`}
                          className="p-1.5 text-chem-ash hover:text-chem-forest rounded-lg hover:bg-chem-subtle transition-colors cursor-pointer shrink-0"
                          title="Edit Kuis"
                        >
                          <i className="fa-solid fa-file-pen text-xs"></i>
                        </Link>
                        <Link
                          to={`/latihan/${quiz.id}/monitoring`}
                          className="p-1.5 text-chem-ash hover:text-chem-forest rounded-lg hover:bg-chem-subtle transition-colors cursor-pointer shrink-0"
                          title="Monitoring Siswa"
                        >
                          <i className="fa-solid fa-chart-line text-xs"></i>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus kuis '${quiz.title}'?`)) {
                              deleteQuizMutation.mutate(quiz.id);
                            }
                          }}
                          className="p-1.5 text-chem-ash hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Hapus Kuis"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Riwayat Pengerjaan */}
      {activeTab === 'history' && (
        <div id="quizView-history" className="space-y-3">
          <div className="bg-white rounded-2xl border border-chem-border p-5 shadow-subtle">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="font-serif text-base text-chem-dark">Rekam Jejak Pengerjaan</h3>
                <p className="text-xs text-chem-ash">
                  Anda dapat mengulang kuis kapan saja tanpa batasan untuk meningkatkan penguasaan materi.
                </p>
              </div>
              <span
                id="userHistoryTotalBadge"
                className="text-xs font-sans font-semibold px-3 py-1 rounded-full bg-chem-subtle text-chem-forest whitespace-nowrap shrink-0"
              >
                {userAttempts.length} Percobaan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-y border-chem-border bg-chem-subtle/50 text-chem-ash uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Kuis</th>
                    <th className="py-2.5 px-3 text-center">Percobaan</th>
                    <th className="py-2.5 px-3 text-center">Skor</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody id="quizHistoryBody" className="divide-y divide-chem-border/60">
                  {userAttempts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-chem-ash italic">
                        Belum ada riwayat pengerjaan kuis.
                      </td>
                    </tr>
                  ) : (
                    userAttempts.map((att) => {
                      const isHigh = att.totalScore >= 80;
                      return (
                        <tr key={att.id} className="hover:bg-chem-subtle/30 transition-colors">
                          <td className="py-3 px-3 text-chem-ash whitespace-nowrap">{formatDate(att.startedAt)}</td>
                          <td className="py-3 px-3 font-semibold text-chem-dark">
                            {att.quizTitle || 'Kuis'}
                          </td>
                          <td className="py-3 px-3 text-center text-chem-ash whitespace-nowrap">
                            Ke-{att.attemptNumber}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isHigh
                                  ? 'bg-chem-glow text-chem-forest border border-chem-sage/30'
                                  : 'bg-amber-100 text-chem-warm border border-amber-200'
                              }`}
                            >
                              {att.totalScore}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleInspection(att.id, user?.fullName || 'Siswa')}
                                className="px-2.5 py-1 text-xs font-semibold text-chem-dark hover:text-chem-forest bg-chem-subtle hover:bg-chem-glow/60 border border-chem-border/70 rounded-lg transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                                title="Lihat Lembar Jawaban & Pembahasan Ilmiah"
                              >
                                <i className="fa-solid fa-file-lines text-[10px] text-chem-sage"></i>
                                <span>Lembar Jawaban</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const qz = quizzes.find((q) => q.id === att.quizId);
                                  if (qz) handleStartQuiz(qz);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-chem-forest hover:bg-chem-glow/50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                              >
                                Ulangi
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Answer Inspector Modal (read-only review) */}
      <AdminInspectionModal
        isOpen={!!inspectAttemptId}
        attemptId={inspectAttemptId}
        studentName={inspectStudentName}
        onClose={() => setInspectAttemptId(null)}
      />
    </section>
  );
};

export default QuizzesPage;