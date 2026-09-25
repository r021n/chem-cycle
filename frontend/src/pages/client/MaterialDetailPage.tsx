import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { ChemFormula } from '../../components/common/ChemFormula';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Volume2,
  ArrowLeft,
  Lightbulb,
} from 'lucide-react';

export const MaterialDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { materials } = useDataStore();
  const { setScreenReaderActive } = useAccessibilityStore();

  const [openExampleIds, setOpenExampleIds] = useState<Record<string, boolean>>({ 'ex-1': true, 'ex-2': true, 'ex-3': true, 'ex-4': true });

  // Find published materials sorted by orderIndex
  const published = useMemo(() => {
    return [...materials]
      .filter((m) => m.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [materials]);

  // Current material
  const currentIndex = published.findIndex((m) => m.slug === slug || m.id === slug);
  const material = published[currentIndex];

  const prevMaterial = currentIndex > 0 ? published[currentIndex - 1] : null;
  const nextMaterial = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;

  const toggleAccordion = (id: string) => {
    setOpenExampleIds((prev) => ({ ...prev, [id]: !prev[id] }));
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
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

        {/* Reader Header Card */}
        <div className="bg-white rounded-3xl border border-chem-border shadow-subtle overflow-hidden">
          {/* Cover Hero Banner */}
          <div className="h-56 sm:h-72 w-full relative bg-slate-100">
            <img
              src={material.coverUrl}
              alt={material.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold bg-white text-chem-forest px-3 py-1 rounded-full shadow-xs">
                  Bab {material.orderIndex}
                </span>
                <span className="text-[11px] font-semibold bg-chem-forest/90 border border-white/20 text-chem-glow px-3 py-1 rounded-full">
                  {material.category}
                </span>
                <span className="text-[11px] text-white/80 flex items-center gap-1 ml-auto">
                  <Clock className="w-3.5 h-3.5" />
                  {material.estimatedReadTime} menit baca
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                {material.title}
              </h1>
            </div>
          </div>

          {/* Quick Reader Actions & Summary */}
          <div className="p-6 sm:p-8 space-y-4">
            <p className="text-xs sm:text-sm text-chem-ash leading-relaxed">
              {material.summary}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-chem-border/70">
              <button
                type="button"
                onClick={() => setScreenReaderActive(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-chem-glow/60 hover:bg-chem-glow text-chem-forest text-xs font-semibold rounded-xl border border-chem-sage/30 transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-chem-sage" />
                <span>Dengarkan Pembaca Layar (TTS)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. SECTION CAPAIAN PEMBELAJARAN */}
        {material.learningObjectives && material.learningObjectives.length > 0 && (
          <section
            aria-labelledby="learning-objectives-heading"
            className="bg-chem-subtle/80 rounded-3xl border border-chem-border p-6 sm:p-8 space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-chem-forest text-chem-glow flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 id="learning-objectives-heading" className="font-serif text-lg font-bold text-chem-dark">
                  Capaian Pembelajaran (Learning Objectives)
                </h2>
                <p className="text-[11px] text-chem-ash">
                  Sasaran kompetensi dan indikator kunci yang diharapkan dicapai peserta didik:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {material.learningObjectives.map((obj, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-2xl border border-chem-border flex items-start gap-2.5 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-chem-glow text-chem-forest text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-chem-dark/90 leading-relaxed">{obj}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. DYNAMIC CONTENT RENDERER (TEKS KAYA, FORMULA, BLOCK AST) */}
        <main className="bg-white rounded-3xl border border-chem-border p-6 sm:p-10 shadow-subtle space-y-6">
          <div className="prose max-w-none">
            <BlockAstViewer contentJson={material.contentJson} />
          </div>
        </main>

        {/* 3. SECTION KONTEKSTUAL & STUDI KASUS */}
        {material.contextualSection && (
          <section
            aria-labelledby="contextual-heading"
            className="rounded-3xl border-2 border-chem-sage/30 bg-gradient-to-br from-emerald-50/70 via-white to-chem-glow/40 p-6 sm:p-8 space-y-4 shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-chem-forest text-white">
                  {material.contextualSection.caseStudyTag}
                </span>
                {material.contextualSection.relatedSdg && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                    SDG {material.contextualSection.relatedSdg}
                  </span>
                )}
              </div>
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>

            <h2 id="contextual-heading" className="font-serif text-xl sm:text-2xl font-bold text-chem-forest leading-snug">
              {material.contextualSection.title}
            </h2>

            <p className="text-xs sm:text-sm text-chem-dark/90 leading-relaxed">
              {material.contextualSection.content}
            </p>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-300/60 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-chem-forest">Dampak Nyata & Implikasi:</p>
                <p className="text-xs text-chem-ash mt-0.5">
                  {material.contextualSection.impactHighlight}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 4. INTERACTIVE ACCORDION (CONTOH SOAL & PEMBAHASAN) */}
        {material.practiceExamples && material.practiceExamples.length > 0 && (
          <section
            aria-labelledby="practice-heading"
            className="bg-white rounded-3xl border border-chem-border p-6 sm:p-8 space-y-6 shadow-subtle"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-chem-glow text-chem-forest flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 id="practice-heading" className="font-serif text-xl font-bold text-chem-dark">
                  Contoh Soal Penerapan & Pembahasan Bertahap
                </h2>
                <p className="text-xs text-chem-ash">
                  Klik dropdown accordion di bawah ini untuk meninjau langkah-langkah penyelesaian terperinci.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {material.practiceExamples.map((ex, i) => {
                const isOpen = !!openExampleIds[ex.id];
                return (
                  <div
                    key={ex.id}
                    className="border border-chem-border rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(ex.id)}
                      className="w-full text-left p-5 bg-chem-subtle/40 hover:bg-chem-subtle/80 flex items-start justify-between gap-4 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <div className="space-y-2 flex-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-chem-sage px-2 py-0.5 rounded bg-chem-glow/60 border border-chem-sage/30">
                          Contoh Kasus {i + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-chem-dark leading-snug">
                          {ex.question}
                        </p>
                        {ex.chemicalFormula && (
                          <div className="pt-1">
                            <ChemFormula formula={ex.chemicalFormula} className="text-xs font-bold" />
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-chem-ash transition-transform duration-200 shrink-0 mt-1 ${
                          isOpen ? 'rotate-180 text-chem-forest' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-5 bg-white border-t border-chem-border space-y-4 animate-in fade-in">
                        {ex.contextHint && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Petunjuk Konsep:</strong> {ex.contextHint}
                            </span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-chem-forest">
                            Langkah Penyelesaian Sistematis:
                          </p>
                          <ol className="space-y-2 pl-4 list-decimal text-xs text-chem-dark leading-relaxed">
                            {ex.solutionSteps.map((step, sIdx) => (
                              <li key={sIdx} className="pl-1">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-950 font-bold">
                          <span>Hasil Akhir: </span>
                          <span className="font-mono">{ex.finalAnswer}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. NAVIGASI ANTAR-BAB (PAGINATION) */}
        <nav
          className="pt-6 border-t border-chem-border grid grid-cols-1 sm:grid-cols-2 gap-4"
          aria-label="Navigasi Antar Bab"
        >
          {prevMaterial ? (
            <Link
              to={`/materi/${prevMaterial.slug}`}
              className="p-4 rounded-2xl bg-white hover:bg-chem-subtle border border-chem-border transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-chem-subtle group-hover:bg-chem-glow flex items-center justify-center text-chem-forest shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-chem-ash uppercase block">
                  Bab Sebelumnya (Bab {prevMaterial.orderIndex})
                </span>
                <span className="text-xs font-bold text-chem-dark truncate block group-hover:text-chem-forest">
                  {prevMaterial.title}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/materi"
              className="p-4 rounded-2xl bg-white hover:bg-chem-subtle border border-chem-border transition-all flex items-center gap-3 text-left"
            >
              <ArrowLeft className="w-5 h-5 text-chem-ash" />
              <div>
                <span className="text-[10px] font-bold text-chem-ash uppercase block">Indeks Pembelajaran</span>
                <span className="text-xs font-bold text-chem-dark">Kembali ke Katalog Materi</span>
              </div>
            </Link>
          )}

          {nextMaterial ? (
            <Link
              to={`/materi/${nextMaterial.slug}`}
              className="p-4 rounded-2xl bg-chem-forest hover:bg-chem-moss text-white transition-all flex items-center justify-between text-right group shadow-xs sm:col-start-2"
            >
              <div className="overflow-hidden pr-2 text-left sm:text-right">
                <span className="text-[10px] font-bold text-chem-glow uppercase block">
                  Bab Selanjutnya (Bab {nextMaterial.orderIndex})
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {nextMaterial.title}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-chem-glow shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          ) : (
            <Link
              to="/aktivitas"
              className="p-4 rounded-2xl bg-chem-forest hover:bg-chem-moss text-white transition-all flex items-center justify-between text-right group shadow-xs sm:col-start-2"
            >
              <div className="overflow-hidden pr-2 text-left sm:text-right">
                <span className="text-[10px] font-bold text-chem-glow uppercase block">
                  Langkah Pembelajaran 2
                </span>
                <span className="text-xs font-bold text-white">Lanjut ke Modul Aktivitas & Simulasi</span>
              </div>
              <ChevronRight className="w-5 h-5 text-chem-glow shrink-0" />
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};
