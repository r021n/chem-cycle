import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { AttemptDetailResponse } from '../../types/quiz';
import { Modal } from '../../components/ui/modal';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AttemptReviewModalProps {
  attemptId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttemptReviewModal: React.FC<AttemptReviewModalProps> = ({
  attemptId,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lembar Jawaban & Pembahasan Kuis"
      description={details ? `Percobaan #${details.attempt.attemptNumber} • Skor: ${details.attempt.totalScore}/${details.attempt.maxScore}` : ''}
      maxWidth="2xl"
    >
      {isLoading ? (
        <Spinner label="Memuat rincian evaluasi jawaban..." />
      ) : !details ? (
        <div className="p-4 text-center text-xs text-slate-500">
          Gagal memuat rincian lembar jawaban.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase">Hasil Evaluasi</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {details.attempt.totalScore} / {details.attempt.maxScore} Poin
              </div>
            </div>
            <Badge variant={details.attempt.isPassed ? 'student' : 'default'}>
              {details.attempt.isPassed ? 'Lulus KKM' : 'Belum Lulus'}
            </Badge>
          </div>

          {/* Questions Review List */}
          <div className="space-y-4">
            {details.questions.map((q, idx) => {
              const studentAns = q.studentAnswer;
              const isCorrect = studentAns?.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`border rounded-xl p-5 bg-white transition-colors ${
                    isCorrect ? 'border-emerald-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        Soal {idx + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Bobot: {q.scoreWeight} Poin
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs font-semibold">
                      {isCorrect ? (
                        <span className="text-emerald-700 flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Benar (+{studentAns?.scoreEarned || q.scoreWeight})
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center">
                          <XCircle className="w-4 h-4 mr-1 text-rose-500" /> Salah (0 Poin)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question AST Prompt */}
                  <div className="mb-4">
                    <BlockAstViewer contentJson={q.promptJson} />
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt) => {
                      const isSelected = studentAns?.selectedOptionId === opt.id;
                      const isAnswerKey = opt.isCorrect;

                      let rowClass = 'border border-slate-200 bg-white text-slate-700';
                      if (isAnswerKey && isSelected) {
                        rowClass = 'border border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium';
                      } else if (isAnswerKey) {
                        rowClass = 'border border-emerald-200 bg-emerald-50/40 text-emerald-900 font-medium';
                      } else if (isSelected) {
                        rowClass = 'border border-rose-300 bg-rose-50/70 text-rose-950 font-medium';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors ${rowClass}`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0">
                              {opt.optionKey}
                            </span>
                            <span className="min-w-0 break-words">{opt.content}</span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {isSelected && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                                Jawaban Anda
                              </span>
                            )}
                            {isAnswerKey && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Kunci Benar
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  {q.explanationJson && (
                    <div className="border border-indigo-100 rounded-lg p-3 bg-indigo-50/40">
                      <div className="text-xs font-semibold text-indigo-900 mb-1">
                        💡 Pembahasan Soal:
                      </div>
                      <div className="text-xs text-slate-700">
                        <BlockAstViewer contentJson={q.explanationJson} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};
