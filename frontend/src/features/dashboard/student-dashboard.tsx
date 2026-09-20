import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Quiz } from '../../types/quiz';
import { Activity } from '../../types/activity';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Flame,
  FileCheck,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data: quizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: queryKeys.quizzes.list,
    queryFn: () => api.get<{ success: boolean; data: Quiz[] }>('/quizzes'),
  });

  const { data: activitiesData, isLoading: loadingActivities } = useQuery({
    queryKey: queryKeys.activities.stream,
    queryFn: () => api.get<{ success: boolean; data: Activity[] }>('/activities'),
  });

  const quizzes = quizzesData?.data || [];
  const activities = activitiesData?.data || [];

  if (loadingQuizzes || loadingActivities) {
    return <Spinner label="Memuat dashboard belajar siswa..." />;
  }

  const completedActivitiesCount = activities.filter((a) => a.isDone).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="border border-slate-200 p-6 bg-white rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="student">Ruang Belajar Siswa</Badge>
            <span className="text-xs text-slate-500 font-medium">
              NISN: {user?.identityNumber || '0054321987'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Halo, {user?.fullName || 'Siswa'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lanjutkan tahapan siklus belajar kimiamu hari ini.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/latihan">
            <Button size="md" variant="primary">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Ujian Kuis
            </Button>
          </Link>
          <Link to="/materi">
            <Button size="md" variant="outline">
              <BookOpen className="w-4 h-4 mr-1.5" /> Baca Modul
            </Button>
          </Link>
        </div>
      </div>

      {/* Learning Cycle Progress Tracker (5E Learning Stages) */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Status Siklus Belajar Kimia (5E Learning Cycle)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Bab: Termokimia & Perubahan Entalpi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/50">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
              <span>TAHAP 1: EKSPLORASI</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">Sistem & Lingkungan</div>
            <div className="text-xs text-emerald-700 mt-2">
              Status: <span className="font-semibold">Selesai (100%)</span>
            </div>
          </div>

          <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/60">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-800 mb-1">
              <span>TAHAP 2: PENGENALAN</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">Reaksi Eksoterm & Endoterm</div>
            <div className="text-xs text-indigo-700 mt-2">
              Status: <span className="font-semibold">Sedang Aktif</span>
            </div>
          </div>

          <div className="border border-slate-200 border-dashed rounded-xl p-4 bg-slate-50/60 opacity-80">
            <div className="text-xs font-semibold mb-1 text-slate-400">
              TAHAP 3: APLIKASI
            </div>
            <div className="text-sm font-semibold text-slate-700">Praktikum Kalorimeter</div>
            <div className="text-xs text-slate-400 mt-2">Status: Menunggu Kuis</div>
          </div>

          <div className="border border-slate-200 border-dashed rounded-xl p-4 bg-slate-50/60 opacity-80">
            <div className="text-xs font-semibold mb-1 text-slate-400">
              TAHAP 4: EVALUASI
            </div>
            <div className="text-sm font-semibold text-slate-700">Evaluasi Sumatif Bab</div>
            <div className="text-xs text-slate-400 mt-2">Status: Terkunci</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Quizzes & Classroom Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quizzes to Take */}
        <Card className="p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Latihan Soal & Uji Mandiri</h3>
              </div>
              <Link to="/latihan" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Lihat Semua ({quizzes.length})
              </Link>
            </div>

            <div className="space-y-3">
              {quizzes.slice(0, 3).map((quiz) => (
                <div key={quiz.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/70 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-slate-900 line-clamp-1">{quiz.title}</span>
                    <Badge variant="outline">KKM: {quiz.passingScore}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>{quiz.totalQuestions || 0} Soal</span>
                    <span>•</span>
                    <span>{quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} Menit` : 'Tanpa Batas Waktu'}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400">
                      Maks {quiz.maxAttempts ? `${quiz.maxAttempts}x Percobaan` : 'Bebas Percobaan'}
                    </span>
                    <Link to={`/latihan/${quiz.id}/exam`}>
                      <button
                        type="button"
                        className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
                      >
                        Mulai Ujian
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/latihan" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
              Buka Katalog Ujian & Riwayat Nilai <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </Card>

        {/* Classroom Activities */}
        <Card className="p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Tugas Kelas Terkini</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {completedActivitiesCount}/{activities.length} Selesai
              </span>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 3).map((act) => (
                <div key={act.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/70 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-slate-900 line-clamp-1">{act.title}</span>
                    <Badge variant={act.isDone ? 'student' : 'default'}>
                      {act.isDone ? 'Selesai' : 'Belum'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{act.instruction}</p>
                  {act.dueDate && (
                    <div className="mt-2 text-[11px] text-slate-400">
                      Tenggat: {formatDate(act.dueDate)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link to="/aktivitas" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
              Periksa Semua Aktivitas <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <Link to="/diskusi" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Diskusi
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
