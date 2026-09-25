import React from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import {
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Plus,
  History,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const AdminDashboardPage: React.FC = () => {
  const { materials, activities, quizzes, logs, settings } = useDataStore();

  const totalMaterials = materials.length;
  const publishedMaterials = materials.filter((m) => m.isPublished).length;

  const totalActivities = activities.length;
  const publishedActivities = activities.filter((a) => a.isPublished).length;

  const totalQuizzes = quizzes.length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);

  const metrics = [
    {
      title: 'Materi Pembelajaran',
      value: totalMaterials,
      subtext: `${publishedMaterials} Terbit • ${totalMaterials - publishedMaterials} Draf`,
      icon: BookOpen,
      color: 'bg-emerald-500 text-white',
      link: '/admin/materi',
    },
    {
      title: 'Modul Aktivitas Virtual',
      value: totalActivities,
      subtext: `${publishedActivities} Aktif Publik`,
      icon: FlaskConical,
      color: 'bg-blue-500 text-white',
      link: '/admin/aktivitas',
    },
    {
      title: 'Paket Latihan Soal',
      value: totalQuizzes,
      subtext: `${totalQuestions} Butir Bank Soal`,
      icon: CheckCircle2,
      color: 'bg-amber-500 text-white',
      link: '/admin/kuis',
    },
    {
      title: 'Audit Jejak Pembaruan',
      value: logs.length,
      subtext: 'Aktivitas CMS Terpantau',
      icon: History,
      color: 'bg-purple-500 text-white',
      link: '#logs',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-chem-dark via-chem-forest to-chem-moss rounded-3xl p-8 text-white shadow-float flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-chem-glow text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-chem-mint" />
            <span>Sistem Manajemen Konten Kurikulum 2026</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Selamat Datang, {settings.adminProfile.name}
          </h1>
          <p className="text-xs sm:text-sm text-chem-glow/80 leading-relaxed">
            Kelola materi kimia inklusif, simulasi interaktif, lembar kerja reflektif, serta paket evaluasi mandiri dari satu pusat kendali terintegrasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/materi"
            className="px-4 py-2.5 bg-chem-glow text-chem-forest rounded-xl text-xs font-bold hover:bg-white transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi</span>
          </Link>
          <Link
            to="/admin/aktivitas"
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Aktivitas</span>
          </Link>
        </div>
      </div>

      {/* 1. METRIK RINGKASAN KONTEN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link
              key={idx}
              to={m.link}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-subtle hover:border-chem-sage transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {m.title}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${m.color} shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-4">
                <span className="text-3xl font-bold font-mono text-slate-900 block">
                  {m.value}
                </span>
                <span className="text-xs text-slate-500 font-medium mt-1 block">
                  {m.subtext}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. QUICK ACTION PANEL & RECENT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Action Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <TrendingUp className="w-5 h-5 text-chem-forest" />
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Aksi Cepat Pengelolaan
            </h2>
          </div>

          <div className="space-y-3">
            <Link
              to="/admin/materi"
              className="w-full p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-950 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Kelola & Susun Bab Materi</span>
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </Link>

            <Link
              to="/admin/aktivitas"
              className="w-full p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 flex items-center justify-between text-xs font-bold text-blue-950 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <FlaskConical className="w-4 h-4 text-blue-700" />
                <span>Konfigurasi Modul & Simulasi</span>
              </span>
              <ArrowRight className="w-4 h-4 text-blue-700" />
            </Link>

            <Link
              to="/admin/kuis"
              className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-950 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700" />
                <span>Manajemen Bank Butir Soal</span>
              </span>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </Link>

            <Link
              to="/admin/pengaturan"
              className="w-full p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300 flex items-center justify-between text-xs font-bold text-slate-900 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Pengaturan Banner & SDGs</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-700" />
            </Link>
          </div>

          <div className="p-4 bg-chem-subtle/70 rounded-2xl border border-chem-border text-[11px] text-chem-ash leading-relaxed">
            <span className="font-bold text-chem-dark block mb-1">Status Sinkronisasi Data:</span>
            Penyimpanan aktif menggunakan berkas JSON terstruktur yang disinkronkan secara aman ke media persisten browser.
          </div>
        </div>

        {/* 3. LOG PEMBARUAN KONTEN (8 Cols) */}
        <div id="logs" className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-chem-forest" />
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Log Pembaruan Konten Terakhir
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {logs.length} catatan aktivitas
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">
                Belum ada aktivitas konten yang tercatat.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md uppercase ${
                        log.action === 'create'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'publish'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'delete'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.action}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        [{log.entityType}] {log.entityTitle}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Oleh: {log.author}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
