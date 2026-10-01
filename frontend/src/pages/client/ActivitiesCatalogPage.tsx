import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDataStore } from "../../store/dataStore";
import {
  ChevronRight,
  Home,
  Paperclip,
  ArrowRight,
  FlaskConical,
} from "lucide-react";

export const ActivitiesCatalogPage: React.FC = () => {
  const { activities, fetchActivities, isLoading } = useDataStore();

  React.useEffect(() => {
    if (activities.length === 0) {
      fetchActivities();
    }
  }, [activities.length, fetchActivities]);

  const publishedActivities = useMemo(() => {
    return [...activities]
      .filter((a) => a.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [activities]);

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav
          className="flex items-center gap-2 text-xs text-chem-ash"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-chem-forest flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
          <span className="font-semibold text-chem-dark">Modul Aktivitas</span>
        </nav>

        <div className="space-y-3 pb-6 border-b border-chem-border">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-chem-dark">
            Modul Aktivitas & Penugasan
          </h1>
          <p className="text-xs sm:text-sm text-chem-ash max-w-2xl leading-relaxed">
            Instruksi kegiatan belajar mandiri, petunjuk observasi kimia, dan
            berkas lampiran pendukung.
          </p>
        </div>

        {publishedActivities.length === 0 ? (
          <div className="bg-chem-card rounded-3xl border border-chem-card-border p-8 sm:p-12 text-center text-chem-ash">
            <Paperclip className="w-12 h-12 mx-auto text-chem-sage mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-chem-dark">
              {isLoading
                ? "Memuat modul aktivitas..."
                : "Belum Ada Modul Aktivitas"}
            </h3>
            <p className="text-xs text-chem-ash mt-1">
              {isLoading
                ? "Sedang mengambil data dari server."
                : "Modul aktivitas dan penugasan belum diterbitkan atau sedang disiapkan."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: compact rows */}
            <ul className="md:hidden space-y-3">
              {publishedActivities.map((act) => {
                const attachmentCount = act.attachments?.length || 0;
                return (
                  <li key={act.id}>
                    <Link
                      to={`/aktivitas/${act.id}`}
                      className="flex items-center gap-3.5 bg-chem-card rounded-2xl border border-chem-card-border p-3.5 shadow-subtle active:border-chem-forest transition-colors"
                    >
                      <div className="w-22 h-22 shrink-0 rounded-xl bg-white border border-chem-card-border flex flex-col items-center justify-center">
                        <FlaskConical className="w-6 h-6 text-chem-forest" />
                        <span className="text-[10px] font-mono font-bold text-chem-sage mt-1">
                          No. {act.orderIndex}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-sm font-bold text-chem-dark leading-snug line-clamp-2">
                          {act.title}
                        </h3>
                        {act.summary && (
                          <p className="text-[11px] text-chem-ash line-clamp-1 leading-relaxed mt-1">
                            {act.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] text-chem-ash mt-1.5">
                          <Paperclip className="w-3 h-3 text-chem-sage" />
                          <span>
                            {attachmentCount > 0
                              ? `${attachmentCount} lampiran`
                              : "Tanpa lampiran"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-chem-ash shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Tablet & desktop: card grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedActivities.map((act) => {
                const attachmentCount = act.attachments?.length || 0;
                return (
                  <Link
                    key={act.id}
                    to={`/aktivitas/${act.id}`}
                    className="bg-chem-card rounded-3xl border border-chem-card-border p-6 shadow-subtle hover:shadow-float hover:border-chem-forest transition-all flex flex-col gap-4 group"
                  >
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-chem-dark group-hover:text-chem-forest transition-colors leading-snug">
                        {act.title}
                      </h3>
                      {act.summary && (
                        <p className="text-xs text-chem-ash leading-relaxed line-clamp-3">
                          {act.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-chem-ash">
                      <Paperclip className="w-3.5 h-3.5 text-chem-sage" />
                      <span>
                        {attachmentCount > 0
                          ? `${attachmentCount} lampiran berkas`
                          : "Tidak ada lampiran"}
                      </span>
                    </div>

                    <div className="mt-auto pt-2 flex items-center justify-between text-xs font-bold text-chem-forest border-t border-chem-border/50">
                      <span>Buka Aktivitas</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
