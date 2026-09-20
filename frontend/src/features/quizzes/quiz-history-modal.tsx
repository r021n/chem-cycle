import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { QuizAttempt, Quiz } from '../../types/quiz';
import { Modal } from '../../components/ui/modal';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';
import { AttemptReviewModal } from './attempt-review-modal';
import { Eye, Calendar, Award } from 'lucide-react';

interface QuizHistoryModalProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuizHistoryModal: React.FC<QuizHistoryModalProps> = ({
  quiz,
  isOpen,
  onClose,
}) => {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.quizzes.myAttempts(quiz?.id || ''),
    queryFn: () =>
      api.get<{ success: boolean; data: QuizAttempt[] }>(`/quizzes/${quiz?.id}/my-attempts`),
    enabled: !!quiz?.id && isOpen,
  });

  const attempts = data?.data || [];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Riwayat Percobaan Kuis"
        description={quiz ? `${quiz.title} • KKM: ${quiz.passingScore}` : ''}
        maxWidth="lg"
      >
        {isLoading ? (
          <Spinner label="Memuat riwayat pengerjaan..." />
        ) : attempts.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 text-xs text-slate-500">
            Kamu belum pernah mengerjakan kuis ini.
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      Percobaan #{attempt.attemptNumber}
                    </span>
                    <Badge variant={attempt.isPassed ? 'student' : 'default'}>
                      {attempt.isPassed ? 'Lulus' : 'Remediasi'}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 mt-2 flex items-center space-x-4">
                    <span className="flex items-center font-bold text-slate-800">
                      <Award className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Skor: {attempt.totalScore} / {attempt.maxScore}
                    </span>
                    <span className="flex items-center text-slate-400">
                      <Calendar className="w-3.5 h-3.5 mr-1" /> {formatDate(attempt.completedAt || attempt.startedAt)}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAttemptId(attempt.id)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Review Jawaban
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Deep Attempt Review Inspector */}
      {selectedAttemptId && (
        <AttemptReviewModal
          attemptId={selectedAttemptId}
          isOpen={!!selectedAttemptId}
          onClose={() => setSelectedAttemptId(null)}
        />
      )}
    </>
  );
};
