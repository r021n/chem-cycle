import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { CommentSection } from '../../components/materials/CommentSection';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Volume2,
  ArrowLeft,
} from 'lucide-react';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const MaterialDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { materials } = useDataStore();
  const { setScreenReaderActive } = useAccessibilityStore();

  const published = useMemo(() => {
    return [...materials]
      .filter((m) => m.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [materials]);

  const currentIndex = published.findIndex((m) => m.slug === slug || m.id === slug);
  const material = published[currentIndex];

  const prevMaterial = currentIndex > 0 ? published[currentIndex - 1] : null;
  const nextMaterial = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;

  if (!material) {
    return (
      <div className="min-h-screen bg-chem-paper lab-grid-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-chem-border text-center max-w-md space-y-4 shadow-subtle">
          <h2 className="font-serif text-xl font-bold text-chem-dark">Bab Materi Tidak Ditemukan</h2>
          <p className="text-xs text-chem-ash">
            Materi yang Anda cari mungkin sedang dalam tahap revisi atau belum diterbitkan.
          </p>
          <button
            type="button"
            onClick={() => navigate('/materi')}
            className="px-5 py-2.5 bg-chem-forest text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Kembali ke Katalog Materi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark py-8 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex items-center gap-2 text-xs text-chem-ash" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-chem-forest flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
            <Link to="/materi" className="hover:text-chem-forest transition-colors">
              Katalog Materi
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
            <span className="font-semibold text-chem-dark line-clamp-1 max-w-[200px]">
              {material.title}
            </span>
          </nav>

          <Link
            to="/materi"
            className="text-xs font-semibold text-chem-forest hover:text-chem-moss flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Katalog</span>
          </Link>
        </div>

        <article>
          {/* Article Header */}
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-chem-sage">
              Bab {material.orderIndex}
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-chem-dark leading-[1.1] mt-3">
              {material.title}
            </h1>
            {material.summary && (
              <p className="text-base sm:text-lg text-chem-ash leading-relaxed mt-4">
                {material.summary}
              </p>
            )}

            {/* Byline & Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-6 pb-6 border-b border-chem-border text-xs text-chem-ash">
              <span>Diperbarui {formatDate(material.updatedAt || material.createdAt)}</span>
              <button
                type="button"
                onClick={() => setScreenReaderActive(true)}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 bg-chem-glow/60 hover:bg-chem-glow text-chem-forest font-semibold rounded-xl border border-chem-sage/30 transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-chem-sage" />
                <span>Dengarkan (TTS)</span>
              </button>
            </div>
          </header>

          {/* Cover Image */}
          {material.coverUrl && (
            <figure className="mb-10">
              <img
                src={material.coverUrl}
                alt={material.title}
                className="w-full h-56 sm:h-80 object-cover rounded-2xl"
              />
            </figure>
          )}

          <div className="space-y-12">
            {/* Pure Notion / Medium Blog Body */}
            <div className="prose max-w-none">
              <BlockAstViewer contentJson={material.contentJson} />
            </div>

            {/* Comments & Discussion */}
            <CommentSection materialId={material.id} />
          </div>

          {/* Prev / Next Navigation */}
          <nav className="mt-12 pt-6 border-t border-chem-border grid grid-cols-1 sm:grid-cols-2 gap-6" aria-label="Navigasi Antar Bab">
            {prevMaterial ? (
              <Link
                to={`/materi/${prevMaterial.slug || prevMaterial.id}`}
                className="group text-left"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Bab Sebelumnya
                </span>
                <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                  {prevMaterial.title}
                </span>
              </Link>
            ) : (
              <Link to="/materi" className="group text-left">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Katalog Materi
                </span>
                <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                  Kembali ke Katalog Materi
                </span>
              </Link>
            )}

            {nextMaterial ? (
              <Link
                to={`/materi/${nextMaterial.slug || nextMaterial.id}`}
                className="group text-right sm:col-start-2"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                  Bab Selanjutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                  {nextMaterial.title}
                </span>
              </Link>
            ) : (
              <Link to="/aktivitas" className="group text-right sm:col-start-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                  Langkah Berikutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                  Lanjut ke Modul Aktivitas
                </span>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
};
