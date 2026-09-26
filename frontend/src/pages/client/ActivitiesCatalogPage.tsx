import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDataStore } from "../../store/dataStore";
import { Clock, ChevronRight, Home, Zap } from "lucide-react";

export const ActivitiesCatalogPage: React.FC = () => {
  const { activities } = useDataStore();

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
          <span className="font-semibold text-chem-dark">
            Modul Aktivitas Interaktif
          </span>
        </nav>

        <div className="space-y-3 pb-6 border-b border-chem-border">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-chem-dark">
            Modul Aktivitas
          </h1>
          <p className="text-xs sm:text-sm text-chem-ash max-w-2xl leading-relaxed">
            Terapkan konsep kimia melalui simulasi interaktif dan penyusunan
            hipotesis pada lembar kerja reflektif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedActivities.map((act) => (
            <Link
              key={act.id}
              to={`/aktivitas/${act.id}`}
              className="bg-white rounded-3xl border border-chem-border p-5 shadow-subtle hover:shadow-float hover:border-chem-sage transition-all flex flex-col gap-3 group"
            >
              <div>
                <h3 className="font-serif text-lg font-bold text-chem-dark group-hover:text-chem-forest transition-colors leading-snug">
                  {act.title}
                </h3>
                <p className="text-xs text-chem-ash mt-2 leading-relaxed line-clamp-2">
                  {act.summary}
                </p>
              </div>

              <div className="flex items-center justify-start">
                <span className="text-xs text-chem-ash flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {act.estimatedTime} menit
                </span>
              </div>

              <div className="mt-auto pt-1 flex items-center justify-between text-xs font-bold text-chem-forest">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-chem-sage" />
                  Buka Modul Aktivitas
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
