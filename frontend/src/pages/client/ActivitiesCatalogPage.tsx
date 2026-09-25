import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import {
  FlaskConical,
  Clock,
  ChevronRight,
  Home,
  Zap,
  Sparkles,
} from 'lucide-react';

export const ActivitiesCatalogPage: React.FC = () => {
  const { activities } = useDataStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const publishedActivities = useMemo(() => {
    return [...activities]
      .filter((a) => a.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return publishedActivities;
    return publishedActivities.filter((a) => a.category === selectedCategory);
  }, [publishedActivities, selectedCategory]);

  const filterTabs = [
    { id: 'all', label: 'Semua Modul' },
    { id: 'simulasi', label: 'Pemodelan Interaktif' },
    { id: 'studi_kasus', label: 'Studi Kasus Kontekstual' },
    { id: 'analisis_data', label: 'Analisis Data Oseanografi' },
  ];

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-chem-ash" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-chem-forest flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
          <span className="font-semibold text-chem-dark">Modul Aktivitas Interaktif</span>
        </nav>

        {/* Page Header */}
        <div className="space-y-3 pb-6 border-b border-chem-border">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
            <span>Laboratorium Eksplorasi Virtual</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-chem-dark">
            Ruang Kerja & Modul Aktivitas
          </h1>
          <p className="text-xs sm:text-sm text-chem-ash max-w-2xl leading-relaxed">
            Terapkan pemahaman konsep kimia melalui simulasi interaktif, analisis fenomena krisis lingkungan, dan penyusunan hipotesis pada lembar kerja reflektif mandiri.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-chem-forest text-white shadow-xs'
                  : 'bg-white border border-chem-border text-chem-ash hover:text-chem-dark hover:bg-chem-subtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-3xl border border-chem-border p-6 shadow-subtle hover:shadow-float hover:border-chem-sage transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-chem-glow text-chem-forest border border-chem-sage/40">
                    {act.badgeLabel}
                  </span>
                  <span className="text-xs text-chem-ash flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {act.estimatedTime} menit
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-chem-dark group-hover:text-chem-forest transition-colors leading-snug">
                    {act.title}
                  </h3>
                  <p className="text-xs text-chem-ash mt-2.5 leading-relaxed line-clamp-3">
                    {act.summary}
                  </p>
                </div>

                {/* Scope Indicators */}
                <div className="p-3 bg-chem-subtle/70 rounded-2xl border border-chem-border space-y-1.5 text-[11px] text-chem-ash">
                  <div className="flex items-center gap-1.5 text-chem-forest font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-chem-sage" />
                    <span>Ruang Lingkup Eksplorasi:</span>
                  </div>
                  <p className="text-chem-dark/80 line-clamp-2">
                    {act.phenomenonIntro.title}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-chem-border/60">
                <Link
                  to={`/aktivitas/${act.id}`}
                  className="w-full py-3 px-4 rounded-2xl bg-chem-forest hover:bg-chem-moss text-white flex items-center justify-between text-xs font-bold transition-all shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-chem-glow" />
                    Buka Ruang Kerja
                  </span>
                  <ChevronRight className="w-4 h-4 text-chem-glow" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
