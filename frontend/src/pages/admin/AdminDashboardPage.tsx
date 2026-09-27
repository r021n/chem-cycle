import React from "react";
import { Link } from "react-router-dom";
import { useDataStore } from "../../store/dataStore";
import {
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Plus,
  History,
} from "lucide-react";
import { formatDate } from "../../lib/utils";

export const AdminDashboardPage: React.FC = () => {
  const { materials, activities, quizzes, logs, settings } = useDataStore();

  const metrics = [
    {
      title: "Materi",
      value: materials.length,
      icon: BookOpen,
      link: "/admin/materi",
    },
    {
      title: "Aktivitas",
      value: activities.length,
      icon: FlaskConical,
      link: "/admin/aktivitas",
    },
    {
      title: "Kuis",
      value: quizzes.length,
      icon: CheckCircle2,
      link: "/admin/kuis",
    },
    {
      title: "Log",
      value: logs.length,
      icon: History,
      link: "#logs",
    },
  ];

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-chem-dark rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">
            Selamat Datang, {settings.adminProfile?.name || "Administrator"}
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Kelola konten kimia dari satu tempat.
          </p>
        </div>

        <Link
          to="/admin/materi"
          className="px-4 py-2.5 bg-chem-glow text-chem-forest rounded-xl text-xs font-bold hover:bg-white transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Materi</span>
        </Link>
      </div>

      {/* Metrik Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link
              key={idx}
              to={m.link}
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-chem-sage transition-all flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-chem-subtle flex items-center justify-center text-chem-forest">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-slate-900 block leading-tight">
                  {m.value}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {m.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Log Terakhir */}
      <div
        id="logs"
        className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3"
      >
        <h2 className="font-serif text-lg font-bold text-slate-900">
          Aktivitas Terakhir
        </h2>

        <div className="divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Belum ada aktivitas konten yang tercatat.
            </p>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md uppercase bg-slate-100 text-slate-600 shrink-0">
                    {log.action}
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    [{log.entityType}] {log.entityTitle}
                  </p>
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
  );
};
