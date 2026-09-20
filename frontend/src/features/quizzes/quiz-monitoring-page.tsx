import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { QuizMonitoringData } from '../../types/quiz';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';
import { AttemptReviewModal } from './attempt-review-modal';
import {
  ArrowLeft,
  Download,
  Eye,
  Award,
  Users,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const QuizMonitoringPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.quizzes.monitoring(id || ''),
    queryFn: () =>
      api.get<{ success: boolean; data: QuizMonitoringData }>(`/quizzes/${id}/monitoring`),
    enabled: !!id,
  });

  const monitoring = data?.data;

  const handleExportCsv = () => {
    if (!monitoring) return;

    const headers = ['Nama Siswa', 'NISN', 'Email', 'Jumlah Percobaan', 'Nilai Tertinggi', 'Nilai Terakhir', 'Status Terakhir', 'Tanggal'];
    const rows = monitoring.studentRecap.map((s) => [
      `"${s.fullName}"`,
      `"${s.identityNumber || '-'}"`,
      `"${s.email}"`,
      s.attemptsCount,
      s.highestScore,
      s.latestScore,
      s.isPassedLatest ? 'LULUS' : 'REMIDI',
      `"${formatDate(s.lastAttemptDate)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_${monitoring.quiz.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <Spinner label="Menyiapkan data monitoring nilai siswa..." />;
  }

  if (!monitoring) {
    return (
      <div className="border border-slate-200 p-8 text-center bg-white rounded-2xl max-w-lg mx-auto shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Data Monitoring Tidak Ditemukan</h2>
        <Button variant="primary" onClick={() => navigate('/latihan')} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  const { quiz, studentRecap, totalStudentsAttempted, totalAttempts } = monitoring;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border border-slate-200 p-6 bg-white rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to={`/latihan/${quiz.id}/edit`}>
            <Button size="sm" variant="outline">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Edit Kuis
            </Button>
          </Link>
          <div>
            <div className="text-xs font-semibold text-indigo-600">
              Monitoring & Analisis Jawaban Siswa
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
              {quiz.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="primary" onClick={handleExportCsv}>
            <Download className="w-3.5 h-3.5 mr-1" /> Ekspor Rekap CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalStudentsAttempted}</div>
            <div className="text-xs text-slate-500 font-medium">Siswa Mengerjakan</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalAttempts}</div>
            <div className="text-xs text-slate-500 font-medium">Total Sesi Ujian</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{quiz.passingScore}</div>
            <div className="text-xs text-slate-500 font-medium">Batas KKM Minimum</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {studentRecap.filter((s) => s.highestScore >= quiz.passingScore).length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Siswa Tuntas KKM</div>
          </div>
        </Card>
      </div>

      {/* Students Recap Table */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Rekapitulasi Nilai Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik tombol 'Periksa Jawaban' pada siswa untuk melihat analisis lembar jawaban per soal.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {studentRecap.length} Rekaman
          </span>
        </div>

        {studentRecap.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 text-xs text-slate-500">
            Belum ada siswa yang mengerjakan kuis ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3 text-center">Percobaan</th>
                  <th className="p-3 text-center">Nilai Terbaik</th>
                  <th className="p-3 text-center">Nilai Terakhir</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Waktu Pengerjaan</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRecap.map((st) => (
                  <tr key={st.userId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{st.fullName}</td>
                    <td className="p-3 text-slate-500">{st.identityNumber || '-'}</td>
                    <td className="p-3 text-center">{st.attemptsCount}x</td>
                    <td className="p-3 text-center font-bold text-slate-900 text-sm">
                      {st.highestScore}
                    </td>
                    <td className="p-3 text-center">{st.latestScore}</td>
                    <td className="p-3 text-center">
                      <Badge variant={st.highestScore >= quiz.passingScore ? 'student' : 'default'}>
                        {st.highestScore >= quiz.passingScore ? 'Tuntas' : 'Belum'}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(st.lastAttemptDate)}</td>
                    <td className="p-3 text-right">
                      {st.attempts && st.attempts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedAttemptId(st.attempts[st.attempts.length - 1].id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center cursor-pointer"
                        >
                          <Eye className="w-3 h-3 mr-1" /> Periksa Jawaban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Answer Inspector Modal */}
      {selectedAttemptId && (
        <AttemptReviewModal
          attemptId={selectedAttemptId}
          isOpen={!!selectedAttemptId}
          onClose={() => setSelectedAttemptId(null)}
        />
      )}
    </div>
  );
};
