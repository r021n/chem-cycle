import React from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Clock,
  Sparkles,
  Recycle,
  GraduationCap,
  CloudRain,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { materials, activities, settings } = useDataStore();
  const { language, toggleOpen } = useAccessibilityStore();

  const publishedMaterials = materials.filter((m) => m.isPublished).slice(0, 3);
  const publishedActivities = activities.filter((a) => a.isPublished).slice(0, 3);

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark flex flex-col font-sans">
      {/* 1. HERO SECTION DINAMIS */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-chem-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chem-glow/80 border border-chem-sage/40 text-chem-forest text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-chem-sage" />
                <span>{settings.hero.badge}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-chem-dark leading-[1.15]">
                {settings.hero.title}
              </h1>

              <p className="text-sm sm:text-base text-chem-ash leading-relaxed max-w-2xl">
                {settings.hero.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={settings.hero.primaryCtaLink}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-chem-forest hover:bg-chem-moss text-white rounded-2xl text-xs font-bold shadow-float transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>{settings.hero.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 text-chem-glow" />
                </Link>

                <Link
                  to={settings.hero.secondaryCtaLink}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-chem-subtle text-chem-dark border border-chem-border rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-chem-sage" />
                  <span>{settings.hero.secondaryCtaText}</span>
                </Link>

                <button
                  type="button"
                  onClick={toggleOpen}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold text-chem-forest hover:bg-chem-glow/40 rounded-2xl border border-chem-sage/30 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-chem-sage" />
                  <span>UDL & Aksesibilitas</span>
                </button>
              </div>

              {/* Badges bar */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-[11px] text-chem-ash border-t border-chem-border/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  WCAG 2.1 AA Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Simulasi Laboratorium Real-time
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Evaluasi Mandiri Tanpa Login
                </span>
              </div>
            </div>

            {/* Right Hero Visual Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-float border-2 border-chem-border bg-white group">
                <img
                  src={settings.hero.bannerImage}
                  alt="Laboratorium Pembelajaran Kimia Sirkular"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chem-dark/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500 text-black font-bold">
                      Studi Kasus Kontekstual
                    </span>
                    <span className="text-xs text-white/80">Katalisis Sirkular 2026</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mt-1">
                    Reduksi Jejak Emisi Industri Melalui Termodinamika Efisien
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PETA ALUR BELAJAR (LEARNING FLOW) */}
      <section className="py-16 bg-chem-subtle/50 border-b border-chem-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-chem-sage px-2.5 py-1 rounded-full bg-chem-glow/60 border border-chem-sage/30">
              {language === 'id' ? 'Panduan Pembelajaran Mandiri' : 'Self-Paced Learning Path'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-chem-dark">
              Peta Alur Belajar Terstruktur
            </h2>
            <p className="text-xs sm:text-sm text-chem-ash">
              Ikuti empat tahapan belajar komprehensif untuk memahami prinsip kimia dan penerapannya di biosfer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {settings.learningFlow.map((step) => {
              const icons = {
                BookOpen,
                FlaskConical,
                FileText: CheckCircle2,
                CheckCircle2,
              };
              const StepIcon = (icons as any)[step.iconName] || BookOpen;

              return (
                <Link
                  key={step.step}
                  to={step.route}
                  className="bg-white p-6 rounded-3xl border border-chem-border shadow-subtle hover:shadow-float hover:border-chem-sage transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-chem-glow/70 text-chem-forest flex items-center justify-center group-hover:scale-110 transition-transform">
                      <StepIcon className="w-6 h-6 text-chem-forest" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-chem-dark group-hover:text-chem-forest transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs text-chem-ash mt-1.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-chem-border/60 flex items-center text-xs font-semibold text-chem-forest group-hover:translate-x-1 transition-transform">
                    <span>Mulai Langkah {step.step}</span>
                    <ChevronRight className="w-4 h-4 ml-1 text-chem-sage" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC CONTENT CARDS (MATERI UNGGULAN & AKTIVITAS) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Modul Materi Pembelajaran */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-chem-sage">
                Katalog Materi Interaktif
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-chem-dark mt-1">
                Modul Pembelajaran Pilihan
              </h2>
            </div>
            <Link
              to="/materi"
              className="text-xs font-bold text-chem-forest hover:text-chem-moss flex items-center gap-1 group"
            >
              <span>Lihat Seluruh Materi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishedMaterials.map((mat) => (
              <Link
                key={mat.id}
                to={`/materi/${mat.slug}`}
                className="bg-white rounded-3xl border border-chem-border overflow-hidden shadow-subtle hover:shadow-float hover:border-chem-sage transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="h-44 overflow-hidden relative bg-slate-100">
                    <img
                      src={mat.coverUrl}
                      alt={mat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-chem-forest px-2.5 py-1 rounded-full border border-chem-border">
                        Bab {mat.orderIndex} • {mat.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-chem-ash">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{mat.estimatedReadTime} menit baca</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-chem-dark group-hover:text-chem-forest transition-colors line-clamp-2">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-chem-ash line-clamp-2 leading-relaxed">
                      {mat.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="py-2.5 px-3 rounded-xl bg-chem-subtle/70 group-hover:bg-chem-glow/50 flex items-center justify-between text-xs font-semibold text-chem-forest transition-colors">
                    <span>Baca Bab Selengkapnya</span>
                    <ChevronRight className="w-4 h-4 text-chem-sage" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Modul Aktivitas & Simulasi Unggulan */}
        <div className="space-y-6 pt-6 border-t border-chem-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-700">
                Eksplorasi Laboratorium
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-chem-dark mt-1">
                Ruang Aktivitas & Simulasi Interaktif
              </h2>
            </div>
            <Link
              to="/aktivitas"
              className="text-xs font-bold text-chem-forest hover:text-chem-moss flex items-center gap-1 group"
            >
              <span>Lihat Semua Aktivitas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishedActivities.map((act) => (
              <Link
                key={act.id}
                to={`/aktivitas/${act.id}`}
                className="bg-white rounded-3xl border border-chem-border p-5 shadow-subtle hover:shadow-float hover:border-chem-mint transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-chem-glow text-chem-forest border border-chem-sage/30">
                      {act.badgeLabel}
                    </span>
                    <span className="text-[11px] text-chem-ash flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {act.estimatedTime} menit
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-chem-dark group-hover:text-chem-forest transition-colors">
                    {act.title}
                  </h3>

                  <p className="text-xs text-chem-ash leading-relaxed line-clamp-3">
                    {act.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-chem-border/60 flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Buka Laboratorium Virtual
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION INFORMASI & DAMPAK (SDG ALIGNMENT) */}
      <section className="py-16 bg-chem-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-chem-mint px-3 py-1 rounded-full bg-chem-forest border border-chem-mint/30">
              Komitmen Capaian Global
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
              {settings.sdgImpact.tagline}
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              {settings.sdgImpact.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settings.sdgImpact.goals.map((g) => {
              const icons = {
                GraduationCap,
                Recycle,
                CloudRain,
              };
              const GoalIcon = (icons as any)[g.iconName] || Recycle;

              return (
                <div
                  key={g.number}
                  className="p-6 rounded-3xl bg-chem-forest/60 border border-white/10 hover:border-chem-mint/40 transition-colors space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xs"
                      style={{ backgroundColor: g.color }}
                    >
                      {g.number}
                    </div>
                    <GoalIcon className="w-6 h-6 text-chem-mint" />
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      SDG {g.number}: {g.title}
                    </h3>
                    <p className="text-xs text-white/75 mt-2 leading-relaxed">
                      {g.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
