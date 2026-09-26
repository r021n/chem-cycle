import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { Search, BookOpen, ChevronRight, Home } from 'lucide-react';

export const MaterialsCatalogPage: React.FC = () => {
  const { materials } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');

  const publishedMaterials = useMemo(() => {
    return [...materials]
      .filter((m) => m.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return publishedMaterials.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.summary || '').toLowerCase().includes(q)
    );
  }, [publishedMaterials, searchQuery]);

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
          <span className="font-semibold text-chem-dark">Katalog Materi</span>
        </nav>

        <div className="space-y-3 pb-6 border-b border-chem-border">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-chem-dark">
            Katalog Modul Pembelajaran
          </h1>
          <p className="text-xs sm:text-sm text-chem-ash max-w-2xl leading-relaxed">
            Eksplorasi modul materi kimia terbuka secara bertahap dan terstruktur.
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-chem-border shadow-subtle">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-chem-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul bab kimia..."
              className="w-full pl-10 pr-4 py-2.5 bg-chem-subtle/50 focus:bg-white text-xs text-chem-dark rounded-2xl border border-chem-border focus:border-chem-sage focus:outline-none transition-all"
            />
          </div>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-chem-border p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-chem-ash mx-auto opacity-50" />
            <h3 className="font-serif text-lg font-bold text-chem-dark">
              Tidak ada materi yang cocok
            </h3>
            <p className="text-xs text-chem-ash">
              Coba gunakan kata kunci pencarian yang lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((mat) => (
              <Link
                key={mat.id}
                to={`/materi/${mat.slug || mat.id}`}
                className="bg-white rounded-3xl border border-chem-border overflow-hidden shadow-subtle hover:shadow-float hover:border-chem-sage transition-all flex flex-col group"
              >
                {mat.coverUrl && (
                  <div className="h-44 overflow-hidden relative bg-slate-100">
                    <img
                      src={mat.coverUrl}
                      alt={mat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 text-[11px] font-bold bg-chem-dark/85 backdrop-blur-xs text-white px-3 py-1 rounded-full shadow-xs border border-white/20">
                      Bab {mat.orderIndex}
                    </span>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1 gap-2">
                  <h3 className="font-serif text-lg font-bold text-chem-dark group-hover:text-chem-forest transition-colors leading-tight">
                    {mat.title}
                  </h3>
                  {mat.summary && (
                    <p className="text-xs text-chem-ash line-clamp-3 leading-relaxed">
                      {mat.summary}
                    </p>
                  )}

                  <div className="mt-auto pt-3 flex items-center justify-between text-xs font-bold text-chem-forest">
                    <span>Baca Artikel</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
