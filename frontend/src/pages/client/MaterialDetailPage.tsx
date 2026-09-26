import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { ChemFormula } from '../../components/common/ChemFormula';
import { CommentSection } from '../../components/materials/CommentSection';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Volume2,
  ArrowLeft,
  Lightbulb,
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

  const [openExampleIds, setOpenExampleIds] = useState<string[]>([]);

  const published = useMemo(() => {
    return [...materials]
      .filter((m) => m.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [materials]);

  const currentIndex = published.findIndex((m) => m.slug === slug || m.id === slug);
  const material = published[currentIndex];

  const prevMaterial = currentIndex > 0 ? published[currentIndex - 1] : null;
  const nextMaterial = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;

  const toggleAccordion = (id: string) => {
    setOpenExampleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
        {/* Breadcrumb */}
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
              Bab {material.orderIndex} · {material.category}
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-chem-dark leading-[1.1] mt-3">
              {material.title}
            </h1>
            <p className="text-base sm:text-lg text-chem-ash leading-relaxed mt-4">
              {material.summary}
            </p>

            {/* Byline & Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-6 pb-6 border-b border-chem-border text-xs text-chem-ash">
              <span>Diperbarui {formatDate(material.updatedAt)}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-chem-sage" />
                {material.estimatedReadTime} menit baca
              </span>
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
          <figure className="mb-10">
            <img
              src={material.coverUrl}
              alt={material.title}
              className="w-full h-56 sm:h-80 object-cover rounded-2xl"
            />
          </figure>

          <div className="space-y-10">
            {/* Learning Objectives */}
            {material.learningObjectives && material.learningObjectives.length > 0 && (
              <section aria-labelledby="learning-objectives-heading">
                <h2
                  id="learning-objectives-heading"
                  className="font-serif text-xl font-bold text-chem-dark mb-3"
                >
                  Capaian Pembelajaran
                </h2>
                <ul className="space-y-2.5 border-l-2 border-chem-sage/50 pl-5">
                  {material.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-chem-dark/85">
                      <CheckCircle2 className="w-4 h-4 text-chem-sage shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Main Article Body */}
            <div className="prose max-w-none">
              <BlockAstViewer contentJson={material.contentJson} />
            </div>

            {/* Contextual Case Study */}
            {material.contextualSection && (
              <aside
                aria-labelledby="contextual-heading"
                className="border-l-4 border-chem-sage bg-chem-subtle/70 rounded-r-2xl px-5 sm:px-6 py-5 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-chem-forest">{material.contextualSection.caseStudyTag}</span>
                  {material.contextualSection.relatedSdg && (
                    <span className="text-chem-sage">· SDG {material.contextualSection.relatedSdg}</span>
                  )}
                </div>
                <h2
                  id="contextual-heading"
                  className="font-serif text-lg sm:text-xl font-bold text-chem-forest leading-snug"
                >
                  {material.contextualSection.title}
                </h2>
                <p className="text-sm text-chem-dark/85 leading-relaxed">
                  {material.contextualSection.content}
                </p>
                <p className="flex items-start gap-2 text-xs text-chem-ash italic">
                  <Lightbulb className="w-4 h-4 text-chem-warm shrink-0 mt-0.5 not-italic" />
                  <span>
                    <strong className="not-italic text-chem-forest">Dampak Nyata:</strong>{' '}
                    {material.contextualSection.impactHighlight}
                  </span>
                </p>
              </aside>
            )}

            {/* Practice Examples Accordion */}
            {material.practiceExamples && material.practiceExamples.length > 0 && (
              <section aria-labelledby="practice-heading">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-chem-sage" />
                  <h2
                    id="practice-heading"
                    className="font-serif text-xl font-bold text-chem-dark"
                  >
                    Contoh Soal & Pembahasan
                  </h2>
                </div>

                <div className="divide-y divide-chem-border border-y border-chem-border">
                  {material.practiceExamples.map((ex, i) => {
                    const isOpen = openExampleIds.includes(ex.id);
                    return (
                      <div key={ex.id}>
                        <button
                          type="button"
                          onClick={() => toggleAccordion(ex.id)}
                          className="w-full text-left py-4 flex items-start justify-between gap-4 hover:bg-chem-subtle/50 transition-colors cursor-pointer"
                          aria-expanded={isOpen}
                        >
                          <div className="space-y-1.5 flex-1 px-1">
                            <span className="text-[10px] font-mono font-bold uppercase text-chem-sage">
                              Contoh {i + 1}
                            </span>
                            <p className="text-sm font-semibold text-chem-dark leading-snug">
                              {ex.question}
                            </p>
                            {ex.chemicalFormula && (
                              <ChemFormula formula={ex.chemicalFormula} className="text-xs font-bold" />
                            )}
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-chem-ash transition-transform duration-200 shrink-0 mt-1 ${
                              isOpen ? 'rotate-180 text-chem-forest' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="pb-5 px-1 space-y-4">
                            {ex.contextHint && (
                              <p className="text-xs text-chem-dark/85 flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-chem-warm shrink-0 mt-0.5" />
                                <span>
                                  <strong>Petunjuk Konsep:</strong> {ex.contextHint}
                                </span>
                              </p>
                            )}

                            <ol className="space-y-2 pl-4 list-decimal text-xs sm:text-sm text-chem-dark leading-relaxed">
                              {ex.solutionSteps.map((step, sIdx) => (
                                <li key={sIdx} className="pl-1">
                                  {step}
                                </li>
                              ))}
                            </ol>

                            <p className="text-xs font-bold text-chem-forest">
                              <span>Hasil Akhir: </span>
                              <span className="font-mono">{ex.finalAnswer}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Comments */}
            <CommentSection materialId={material.id} />
          </div>

          {/* Prev / Next Navigation */}
          <nav className="mt-12 pt-6 border-t border-chem-border grid grid-cols-1 sm:grid-cols-2 gap-6" aria-label="Navigasi Antar Bab">
            {prevMaterial ? (
              <Link
                to={`/materi/${prevMaterial.slug}`}
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
                  Indeks Pembelajaran
                </span>
                <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                  Kembali ke Katalog Materi
                </span>
              </Link>
            )}

            {nextMaterial ? (
              <Link
                to={`/materi/${nextMaterial.slug}`}
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
