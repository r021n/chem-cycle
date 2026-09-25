import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import {
  Search,
  BookOpen,
  Clock,
  ChevronRight,
  Filter,
  CheckCircle,
  Home,
} from 'lucide-react';

export const MaterialsCatalogPage: React.FC = () => {
  const { materials } = useDataStore();
  const { language } = useAccessibilityStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter only published materials and sort by orderIndex
  const publishedMaterials = useMemo(() => {
    return [...materials]
      .filter((m) => m.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [materials]);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set(publishedMaterials.map((m) => m.category));
    return ['all', ...Array.from(set)];
  }, [publishedMaterials]);

  // Filter based on search & category
  const filteredMaterials = useMemo(() => {
    return publishedMaterials.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [publishedMaterials, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center gap-2 text-xs text-chem-ash"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-chem-forest flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
          <span className="font-semibold text-chem-dark">Katalog Materi</span>
        </nav>

        {/* Page Header */}
        <div className="space-y-3 pb-6 border-b border-chem-border">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chem-glow/70 border border-chem-sage/30 text-chem-forest text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-chem-sage" />
            <span>{language === 'id' ? 'Kurikulum Kimia Sirkular' : 'Circular Chemistry Curriculum'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-chem-dark">
            Katalog Modul Pembelajaran
          </h1>
          <p className="text-xs sm:text-sm text-chem-ash max-w-2xl leading-relaxed">
            Eksplorasi bab-bab materi kimia secara berurutan. Setiap bab dirancang dengan capaian pembelajaran terukur, studi kasus industri hijau, dan panduan latihan bertahap.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-chem-border shadow-subtle">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-chem-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul bab atau topik kimia..."
              className="w-full pl-10 pr-4 py-2.5 bg-chem-subtle/50 focus:bg-white text-xs text-chem-dark rounded-2xl border border-chem-border focus:border-chem-sage focus:outline-none transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-chem-ash shrink-0 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-chem-forest text-white shadow-xs'
                    : 'bg-chem-subtle/70 text-chem-ash hover:text-chem-dark hover:bg-chem-border/60'
                }`}
              >
                {cat === 'all' ? 'Semua Topik' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-chem-border p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-chem-ash mx-auto opacity-50" />
            <h3 className="font-serif text-lg font-bold text-chem-dark">
              Tidak ada materi yang cocok dengan pencarian
            </h3>
            <p className="text-xs text-chem-ash">
              Coba gunakan kata kunci pencarian yang lebih umum atau setel ulang filter kategori.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-3xl border border-chem-border overflow-hidden shadow-subtle hover:shadow-float hover:border-chem-sage transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail & Order Status Indicator */}
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    <img
                      src={mat.coverUrl}
                      alt={mat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-[11px] font-bold bg-chem-dark/85 backdrop-blur-xs text-white px-3 py-1 rounded-full shadow-xs border border-white/20">
                        Bab {mat.orderIndex}
                      </span>
                      <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-chem-forest px-2.5 py-1 rounded-full border border-chem-border">
                        {mat.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="text-[10px] font-medium bg-black/60 backdrop-blur-xs text-chem-glow px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mat.estimatedReadTime} mnt
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-chem-dark group-hover:text-chem-forest transition-colors leading-tight">
                        {mat.title}
                      </h3>
                      <p className="text-xs text-chem-ash mt-2 line-clamp-2 leading-relaxed">
                        {mat.summary}
                      </p>
                    </div>

                    {/* Learning Objectives Preview */}
                    {mat.learningObjectives && mat.learningObjectives.length > 0 && (
                      <div className="pt-3 border-t border-chem-border/60 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-chem-ash block">
                          Indikator Capaian Utama:
                        </span>
                        <div className="space-y-1">
                          {mat.learningObjectives.slice(0, 2).map((obj, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-chem-dark/85">
                              <CheckCircle className="w-3.5 h-3.5 text-chem-sage shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="p-6 pt-0">
                  <Link
                    to={`/materi/${mat.slug}`}
                    className="w-full py-3 px-4 rounded-2xl bg-chem-subtle/80 hover:bg-chem-forest text-chem-forest hover:text-white flex items-center justify-between text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Mulai Membaca Bab</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
