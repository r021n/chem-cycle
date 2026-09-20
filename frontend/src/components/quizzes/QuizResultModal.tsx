import React, { useEffect, useState } from 'react';
import { AttemptDetailResponse, QuizResultData } from '../../types/quiz';
import { api } from '../../lib/api-client';
import { BlockAstViewer } from '../editor/block-ast-viewer';

interface QuizResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
  resultData: QuizResultData | null;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  isOpen,
  onClose,
  onRetake,
  resultData,
}) => {
  const [attemptDetails, setAttemptDetails] = useState<AttemptDetailResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (resultData?.attempt?.id && isOpen) {
      setLoadingDetails(true);
      api
        .get<{ success: boolean; data: AttemptDetailResponse }>(
          `/attempts/${resultData.attempt.id}/details`
        )
        .then((res) => {
          if (res.success && res.data) {
            setAttemptDetails(res.data);
          }
        })
        .catch(() => {
          // If fail, fallback to local questions
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [resultData?.attempt?.id, isOpen]);

  if (!isOpen || !resultData) return null;

  const isGreat = resultData.totalScore >= 80;

  return (
    <div
      id="quizResultModal"
      className="fixed inset-0 z-50 bg-chem-dark/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-sans"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-float flex flex-col overflow-hidden border border-chem-border">
        {/* Dial & Appreciation Banner */}
        <div className="p-6 text-center border-b border-chem-border bg-chem-subtle/40 shrink-0">
          <div
            id="resultModalIcon"
            className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl mb-2 ${
              isGreat
                ? 'bg-chem-glow/70 text-chem-forest border border-chem-sage/40'
                : 'bg-amber-100 text-chem-warm border border-amber-200'
            }`}
          >
            <i className={`fa-solid ${isGreat ? 'fa-award' : 'fa-circle-check'}`}></i>
          </div>

          <h3 id="resultModalTitle" className="font-serif text-xl font-bold text-chem-dark">
            {isGreat ? 'Pemahaman Sangat Baik!' : 'Tinjau Kembali Pembahasan'}
          </h3>
          <p id="resultModalSub" className="text-xs text-chem-ash mt-0.5">
            Anda dapat mengulang kuis ini kapan saja untuk menguatkan pemahaman.
          </p>

          <div
            id="resultModalScore"
            className="font-sans text-4xl font-bold text-chem-forest mt-3"
          >
            {resultData.totalScore} / {resultData.maxScore}
          </div>
        </div>

        {/* Question Review List */}
        <div id="resultModalReviewList" className="flex-1 overflow-y-auto p-5 space-y-4">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-chem-ash block">
            Ulasan Lembar Jawaban & Pembahasan Ilmiah:
          </span>

          {loadingDetails ? (
            <div className="py-6 text-center text-xs text-chem-ash">
              <div className="w-6 h-6 mx-auto mb-2 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
              Memuat ulasan pembahasan...
            </div>
          ) : attemptDetails?.questions ? (
            attemptDetails.questions.map((q, idx) => {
              const isCorrect = q.studentAnswer?.isCorrect ?? false;
              const correctOption = q.options.find((o) => o.isCorrect);
              const studentOption = q.options.find(
                (o) => o.id === q.studentAnswer?.selectedOptionId
              );

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
                    <span className="text-chem-dark">Soal #{idx + 1}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        isCorrect
                          ? 'bg-chem-glow text-chem-forest border border-chem-sage/30'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isCorrect ? '✓ Tepat' : '✕ Kurang Tepat'}
                    </span>
                  </div>

                  <div className="text-chem-dark font-medium">
                    <BlockAstViewer contentJson={q.promptJson} />
                  </div>

                  {/* Comparison: Student choice vs Key */}
                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="flex items-start gap-1 text-chem-ash">
                      <span className="font-semibold text-chem-dark">Pilihan Anda:</span>
                      <span className={isCorrect ? 'text-chem-forest font-medium' : 'text-rose-600 line-through'}>
                        {studentOption
                          ? `${studentOption.optionKey}. ${studentOption.content}`
                          : 'Tidak dijawab'}
                      </span>
                    </div>

                    {!isCorrect && correctOption && (
                      <div className="flex items-start gap-1 text-chem-forest font-semibold">
                        <span>Kunci Benar:</span>
                        <span>{correctOption.optionKey}. {correctOption.content}</span>
                      </div>
                    )}
                  </div>

                  {/* Scientific Explanation */}
                  {q.explanationJson && (
                    <div className="p-2.5 bg-white rounded-xl border border-chem-border/70 text-[11px] text-chem-ash leading-relaxed">
                      <span className="block font-bold text-chem-forest uppercase text-[10px] mb-0.5">
                        Pembahasan Konsep:
                      </span>
                      <BlockAstViewer contentJson={q.explanationJson} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-chem-ash italic text-center py-4">
              Ulasan butir soal siap ditinjau.
            </p>
          )}
        </div>

        {/* Modal Action Controls */}
        <div className="p-4 border-t border-chem-border bg-chem-subtle/40 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onRetake}
            className="px-4 py-2 bg-white border border-chem-border text-chem-dark text-xs font-semibold rounded-xl hover:bg-chem-subtle flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-rotate-right text-[10px]"></i>
            <span>Kerjakan Ulang</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-bold rounded-xl shadow-subtle transition-transform active:scale-95 cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
