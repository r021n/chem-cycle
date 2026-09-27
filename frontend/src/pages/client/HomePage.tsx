import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Recycle,
  GraduationCap,
  CloudRain,
  ChevronRight,
} from "lucide-react";

const HERO = {
  title: "Eksplorasi Kimia Hijau & Siklus Energi Terbuka",
  subtitle:
    "Platform kimia interaktif berbasis UDL dan WCAG 2.1 AA, dengan modul termokimia, kinetika, dan ekonomi sirkular.",
  bannerImage:
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1400&q=80",
  primaryCtaText: "Mulai Sekarang",
  primaryCtaLink: "/materi",
  secondaryCtaText: "Buka Aktivitas",
  secondaryCtaLink: "/aktivitas",
};

const LEARNING_FLOW = [
  {
    step: 1,
    title: "1. Pahami Konsep",
    desc: "Baca materi terstruktur dengan notasi kimia yang jelas.",
    Icon: BookOpen,
    route: "/materi",
  },
  {
    step: 2,
    title: "2. Eksplorasi Fenomena",
    desc: "Jalankan simulasi untuk menguji suhu, konsentrasi, dan katalis.",
    Icon: FlaskConical,
    route: "/aktivitas",
  },
  {
    step: 3,
    title: "3. Analisis Lembar Kerja",
    desc: "Isi refleksi dan uji hipotesis mandiri.",
    Icon: CheckCircle2,
    route: "/aktivitas",
  },
  {
    step: 4,
    title: "4. Evaluasi Mandiri",
    desc: "Uji penguasaan lewat latihan instan dengan pembahasan.",
    Icon: CheckCircle2,
    route: "/kuis",
  },
];

const SDG_GOALS = [
  {
    number: 4,
    title: "Pendidikan Berkualitas",
    description:
      "Akses pembelajaran sains terbuka dan inklusif bagi semua profil belajar.",
    color: "#c5192d",
    Icon: GraduationCap,
  },
  {
    number: 12,
    title: "Konsumsi & Produksi Bertanggung Jawab",
    description:
      "Prinsip 12 Kimia Hijau: cegah limbah, katalisis ramah lingkungan, daur ulang polimer.",
    color: "#cf8d2a",
    Icon: Recycle,
  },
  {
    number: 13,
    title: "Penanganan Perubahan Iklim",
    description:
      "Neraca massa dan termodinamika penangkapan karbon untuk masa depan net-zero.",
    color: "#3f7e44",
    Icon: CloudRain,
  },
];

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark flex flex-col font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-20 border-b border-chem-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-chem-dark leading-[1.15]">
                {HERO.title}
              </h1>

              <p className="text-sm sm:text-base text-chem-ash leading-relaxed max-w-2xl">
                {HERO.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <Link
                  to={HERO.primaryCtaLink}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 sm:py-3.5 bg-chem-forest hover:bg-chem-moss text-white rounded-2xl text-xs font-bold shadow-float transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>{HERO.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 text-chem-glow" />
                </Link>

                <Link
                  to={HERO.secondaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 px-5 py-4 sm:py-3.5 bg-white hover:bg-chem-subtle text-chem-dark border border-chem-border rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-chem-sage" />
                  <span>{HERO.secondaryCtaText}</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-float border-2 border-chem-border bg-white group">
                <img
                  src={HERO.bannerImage}
                  alt="Laboratorium Pembelajaran Kimia Sirkular"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-chem-dark/80 via-transparent to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500 text-black font-bold">
                      Studi Kasus
                    </span>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-1">
                    Reduksi Emisi Industri via Termodinamika
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PETA ALUR BELAJAR (LEARNING FLOW) */}
      <section className="py-12 sm:py-16 bg-chem-subtle/50 border-b border-chem-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-chem-dark">
              Peta Alur Belajar
            </h2>
            <p className="text-xs sm:text-sm text-chem-ash">
              Empat tahapan untuk memahami prinsip kimia dan penerapannya.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-4 lg:gap-6">
            {LEARNING_FLOW.map((step) => {
              const StepIcon = step.Icon;

              return (
                <Link
                  key={step.step}
                  to={step.route}
                  className="group flex gap-4 lg:flex-col lg:gap-4 lg:bg-white lg:p-6 lg:rounded-3xl lg:border lg:border-chem-border lg:shadow-subtle lg:hover:shadow-float lg:hover:border-chem-sage transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center shrink-0 lg:items-start">
                    <div className="w-12 h-12 rounded-2xl bg-chem-glow/70 text-chem-forest flex items-center justify-center group-hover:scale-110 transition-transform shadow-subtle">
                      <StepIcon className="w-6 h-6 text-chem-forest" />
                    </div>
                    {step.step < LEARNING_FLOW.length && (
                      <div
                        className="w-px flex-1 min-h-8 my-1 bg-chem-border lg:hidden"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pb-1 lg:pb-0 lg:flex lg:flex-col lg:justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-chem-dark group-hover:text-chem-forest transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs text-chem-ash mt-1.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 lg:pt-4 lg:mt-4 lg:border-t lg:border-chem-border/60 flex items-center text-xs font-semibold text-chem-forest group-hover:translate-x-1 transition-transform">
                      <span>Langkah {step.step}</span>
                      <ChevronRight className="w-4 h-4 ml-1 text-chem-sage" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SECTION INFORMASI & DAMPAK (SDG ALIGNMENT) */}
      <section className="py-12 sm:py-16 bg-chem-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
              Keselarasan Tujuan Pembangunan Berkelanjutan (SDGs)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SDG_GOALS.map((g) => {
              const GoalIcon = g.Icon;

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
