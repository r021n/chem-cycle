import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Quiz } from '../../types/quiz';
import { Activity } from '../../types/activity';
import { Material } from '../../types/material';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';
import {
  Users,
  BookOpen,
  HelpCircle,
  Calendar,
  Plus,
  ArrowRight,
  Eye,
  FileEdit,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { data: quizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: queryKeys.quizzes.list,
    queryFn: () => api.get<{ success: boolean; data: Quiz[] }>('/quizzes'),
  });

  const { data: activitiesData, isLoading: loadingActivities } = useQuery({
    queryKey: queryKeys.activities.stream,
    queryFn: () => api.get<{ success: boolean; data: Activity[] }>('/activities'),
  });

  const { data: materialsData, isLoading: loadingMaterials } = useQuery({
    queryKey: queryKeys.materials.list,
    queryFn: () => api.get<{ success: boolean; data: Material[] }>('/materials'),
  });

  const quizzes = quizzesData?.data || [];
  const activities = activitiesData?.data || [];
  const materials = materialsData?.data || [];

  const totalMaterials = materials.length;

  if (loadingQuizzes || loadingActivities || loadingMaterials) {
    return <Spinner label="Memuat metrik dashboard guru..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="border border-slate-200 p-6 bg-white rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="teacher">Portal Guru</Badge>
            <span className="text-xs text-slate-500 font-medium">Administrator Pembelajaran</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Dashboard Manajemen Kelas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring aktivitas kelas, analisis jawaban kuis siswa, dan publikasi materi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link to="/materi">
            <Button size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" /> Buat Materi
            </Button>
          </Link>
          <Link to="/latihan">
            <Button size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" /> Buat Kuis
            </Button>
          </Link>
          <Link to="/aktivitas">
            <Button size="sm" variant="primary">
              <Plus className="w-3.5 h-3.5 mr-1" /> Buat Pengumuman
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalMaterials}</div>
            <div className="text-xs text-slate-500 font-medium">Materi Terbit</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{quizzes.length}</div>
            <div className="text-xs text-slate-500 font-medium">Kuis Aktif</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activities.length}</div>
            <div className="text-xs text-slate-500 font-medium">Tugas & Aktivitas</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">36</div>
            <div className="text-xs text-slate-500 font-medium">Siswa Terdaftar</div>
          </div>
        </Card>
      </div>

      {/* Monitoring Table: Quizzes & Student Progress */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Monitoring Kuis & Evaluasi Hasil Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau rekap skor pengerjaan, tingkat kelulusan, dan lembar jawaban siswa per soal.
            </p>
          </div>
          <Link to="/latihan" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
            Semua Kuis <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Belum ada kuis yang dibuat. Klik tombol "+ Buat Kuis" untuk menambahkan kuis pertama.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="p-3">Judul Kuis</th>
                  <th className="p-3">Jumlah Soal</th>
                  <th className="p-3">Batas Waktu</th>
                  <th className="p-3">KKM</th>
                  <th className="p-3">Maks Percobaan</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">
                      {quiz.title}
                    </td>
                    <td className="p-3 text-slate-600">{quiz.totalQuestions || 0} Soal</td>
                    <td className="p-3 text-slate-600">{quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} Menit` : 'Tanpa Batas'}</td>
                    <td className="p-3 font-semibold text-slate-900">{quiz.passingScore}</td>
                    <td className="p-3 text-slate-600">{quiz.maxAttempts ? `${quiz.maxAttempts}x` : 'Bebas'}</td>
                    <td className="p-3 text-right space-x-2">
                      <Link to={`/latihan/${quiz.id}/monitoring`}>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 mr-1" /> Nilai Siswa
                        </button>
                      </Link>
                      <Link to={`/latihan/${quiz.id}/edit`}>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <FileEdit className="w-3 h-3 mr-1" /> Edit
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Activities & Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-sm text-slate-900">Aktivitas Kelas Terbaru</h3>
            <Link to="/aktivitas" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Kelola
            </Link>
          </div>
          <div className="space-y-3">
            {activities.slice(0, 3).map((act) => (
              <div key={act.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/70 hover:border-slate-200 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-xs text-slate-900 truncate">{act.title}</span>
                  {act.isPinned && <Badge variant="solid">Tersemat</Badge>}
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{act.instruction}</p>
                <div className="mt-2 text-[11px] text-slate-400">
                  {act.attachments.length} Lampiran Dokumen/Tautan
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Materials Overview */}
        <Card className="p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-sm text-slate-900">Materi Pembelajaran</h3>
            <Link to="/materi" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Semua Materi
            </Link>
          </div>
          <div className="space-y-3">
            {materials.slice(0, 3).map((mat) => (
              <Link
                key={mat.id}
                to={`/materi/${mat.slug}`}
                className="block border border-slate-100 rounded-xl p-3.5 bg-slate-50/70 hover:border-slate-200 transition-colors"
              >
                <div className="font-semibold text-xs text-slate-900">{mat.title}</div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {mat.summary || 'Tidak ada ringkasan.'}
                </p>
                <div className="mt-2 text-[11px] text-slate-400">
                  {mat.estimatedReadTime || 10} menit baca
                </div>
              </Link>
            ))}
            {materials.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">
                Belum ada materi yang dibuat.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
