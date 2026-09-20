import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { AttemptDetailResponse } from '../../types/quiz';
import { BlockAstViewer } from '../editor/block-ast-viewer';

interface AdminInspectionModalProps {
  attemptId: string | null;
  studentName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminInspectionModal: React.FC<AdminInspectionModalProps> = ({
  attemptId,
  studentName,
  isOpen,
  onClose,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['attempts', attemptId, 'details'],
    queryFn: () =>
      api.get<{ success: boolean; data: AttemptDetailResponse }>(`/attempts/${attemptId}/details`),
    enabled: !!attemptId && isOpen,
  });

  const details = data?.data;

  if (!isOpen || !attemptId) return null;

  return (
    <div
      id="adminInspectionModal"
      className="fixed inset-0 z-50 bg-chem-dark/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-sans"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-xl max-h-[90vh] rounded-3xl shadow-float flex flex-col overflow-hidden border border-chem-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-chem-border flex items-center justify-between shrink-0">
          <div>
            <h3
              id="inspectStudentName"
              className="font-serif text-base font-semibold text-chem-dark"
            >
              Lembar Jawaban Siswa: {details?.attempt?.userName || studentName || 'Siswa'}
            </h3>
            <p id="inspectQuizMeta" className="text-xs text-chem-ash font-sans mt-0.5">
              {details?.quiz?.title || 'Kuis Siklus'} • Percobaan Ke-{details?.attempt?.attemptNumber || 1} • Nilai: {details?.attempt?.totalScore || 0}/{details?.attempt?.maxScore || 100}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-chem-ash hover:text-chem-dark hover:bg-chem-subtle rounded-lg cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Body Content */}
        <div id="inspectQuestionsBody" className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-chem-ash">
              <div className="w-6 h-6 mx-auto mb-2 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
              Memuat lembar rekaman jawaban siswa...
            </div>
          ) : !details ? (
            <p className="text-xs text-chem-ash italic text-center py-4">
              Gagal memuat detail lembar jawaban siswa.
            </p>
          ) : (
            details.questions.map((q, idx) => {
              const studentAnswer = q.studentAnswer;
              const isCorrect = studentAnswer?.isCorrect ?? false;

              return (
                <div
                  key={q.id || idx}
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                    isCorrect
                      ? 'border-chem-sage/50 bg-chem-glow/20'
                      : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-chem-dark">Nomor #{idx + 1}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        isCorrect
                          ? 'bg-chem-glow text-chem-forest border border-chem-sage/30'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isCorrect ? '✓ Tepat' : '✕ Keliru'}
                    </span>
                  </div>

                  <div className="text-chem-dark font-medium leading-relaxed">
                    <BlockAstViewer contentJson={q.promptJson} />
                  </div>

                  {/* Options Inspection */}
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt) => {
                      const isChosen = opt.id === studentAnswer?.selectedOptionId;
                      const isKey = !!opt.isCorrect;

                      return (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between ${
                            isKey
                              ? 'bg-chem-glow/50 border border-chem-sage/40 text-chem-forest font-semibold'
                              : isChosen && !isKey
                              ? 'bg-rose-100 border border-rose-200 text-rose-800 line-through'
                              : 'bg-white border border-chem-border/60 text-chem-dark'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{opt.optionKey}.</span>
                            <span>{opt.content}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px]">
                            {isChosen && (
                              <span className="px-1.5 py-0.5 rounded bg-white/70 font-semibold uppercase">
                                [Pilihan Siswa]
                              </span>
                            )}
                            {isKey && (
                              <span className="px-1.5 py-0.5 rounded bg-chem-forest text-chem-glow font-bold uppercase">
                                [Kunci Benar]
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Scientific Explanation */}
                  {q.explanationJson && (
                    <div className="p-2.5 bg-white rounded-xl border border-chem-border/70 text-[11px] text-chem-ash leading-relaxed">
                      <span className="block font-bold text-chem-forest uppercase text-[10px] mb-0.5">
                        Pembahasan Ilmiah:
                      </span>
                      <BlockAstViewer contentJson={q.explanationJson} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-chem-border bg-chem-subtle/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-chem-subtle hover:bg-chem-glow/60 text-chem-dark text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
