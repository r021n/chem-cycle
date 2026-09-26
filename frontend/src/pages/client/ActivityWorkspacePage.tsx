import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { GeneralSimulatorRenderer } from '../../components/activities/GeneralSimulatorRenderer';
import {
  ChevronRight,
  ChevronLeft,
  Home,
  Clock,
  CheckCircle2,
  Send,
  Eye,
  ArrowRight,
  FileText,
  Lightbulb,
} from 'lucide-react';

export const ActivityWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities } = useDataStore();

  const published = useMemo(() => {
    return [...activities]
      .filter((a) => a.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [activities]);

  const currentIndex = published.findIndex((a) => a.id === id);
  const activity = published[currentIndex];

  const nextActivity = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;

  // Student worksheet answers state
  const [worksheetAnswers, setWorksheetAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [revealedInsights, setRevealedInsights] = useState<Record<string, boolean>>({});

  const handleAnswerChange = (qId: string, val: string) => {
    setWorksheetAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Reveal all insights upon submission
    const allRevealed: Record<string, boolean> = {};
    activity?.worksheet.forEach((q) => {
      allRevealed[q.id] = true;
    });
    setRevealedInsights(allRevealed);
  };

  const toggleInsight = (qId: string) => {
    setRevealedInsights((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-chem-paper lab-grid-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-chem-border text-center max-w-md space-y-4 shadow-subtle">
          <h2 className="font-serif text-xl font-bold text-chem-dark">Modul Aktivitas Tidak Ditemukan</h2>
          <p className="text-xs text-chem-ash">
            Aktivitas yang Anda tuju mungkin belum aktif atau telah diperbarui.
          </p>
          <button
            type="button"
            onClick={() => navigate('/aktivitas')}
            className="px-5 py-2.5 bg-chem-forest text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Kembali ke Katalog Aktivitas
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(worksheetAnswers).filter((v) => v.trim().length > 0).length;
  const totalQuestions = activity.worksheet.length;

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark py-8 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-chem-ash" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-chem-forest flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
            <Link to="/aktivitas" className="hover:text-chem-forest transition-colors">
              Katalog Aktivitas
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
            <span className="font-semibold text-chem-dark line-clamp-1 max-w-[220px]">
              {activity.title}
            </span>
          </nav>
        </div>

        {/* Workspace Title & Scope */}
        <div className="space-y-3 pb-6 border-b border-chem-border">
          <div className="flex items-center gap-2 text-xs text-chem-ash">
            <Clock className="w-3.5 h-3.5" />
            <span>Estimasi Durasi: {activity.estimatedTime} menit eksplorasi mandiri</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-chem-dark leading-tight">
            {activity.title}
          </h1>
          <p className="text-xs sm:text-sm text-chem-ash max-w-3xl leading-relaxed">
            {activity.summary}
          </p>
        </div>

        {/* 1. SECTION PENGANTAR FENOMENA & TRIGGER QUESTIONS */}
        <section
          aria-labelledby="phenomenon-heading"
          className="bg-white rounded-3xl border border-chem-border p-6 sm:p-8 shadow-subtle space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-700">
                Fase Pemantik Kritis
              </span>
              <h2 id="phenomenon-heading" className="font-serif text-xl font-bold text-chem-dark">
                {activity.phenomenonIntro.title}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {activity.phenomenonIntro.imageUrl && (
              <div className="lg:col-span-4 rounded-2xl overflow-hidden border border-chem-border h-48 bg-slate-100">
                <img
                  src={activity.phenomenonIntro.imageUrl}
                  alt={activity.phenomenonIntro.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className={`${activity.phenomenonIntro.imageUrl ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
              <p className="text-xs sm:text-sm text-chem-dark/90 leading-relaxed">
                {activity.phenomenonIntro.narrative}
              </p>

              {/* Trigger Questions Callout */}
              <div className="p-4 bg-chem-subtle/70 rounded-2xl border border-chem-border space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-chem-forest block">
                  Pertanyaan Pemantik Analisis:
                </span>
                <ul className="space-y-1.5 list-disc pl-5 text-xs text-chem-dark leading-relaxed">
                  {activity.phenomenonIntro.triggerQuestions.map((tq, idx) => (
                    <li key={idx} className="pl-1">
                      {tq}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 2. KONTAINER MODUL INTERAKTIF / SIMULATOR */}
        <section aria-label="Modul Laboratorium Simulasi Interaktif">
          <GeneralSimulatorRenderer config={activity.interactiveModule} />
        </section>

        {/* 3. DYNAMIC ANALYSIS FORM / WORKSHEET */}
        <section
          aria-labelledby="worksheet-heading"
          className="bg-white rounded-3xl border border-chem-border p-6 sm:p-8 shadow-subtle space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-chem-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-chem-glow text-chem-forest flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 id="worksheet-heading" className="font-serif text-xl font-bold text-chem-dark">
                  Lembar Kerja Respons & Analisis Hubungan Sebab-Akibat
                </h2>
                <p className="text-xs text-chem-ash">
                  Kemukakan hasil pengamatan Anda dari simulator di atas secara mandiri dan argumentatif.
                </p>
              </div>
            </div>

            <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-chem-subtle text-chem-forest border border-chem-border self-start sm:self-center">
              Progres: {answeredCount} dari {totalQuestions} terjawab
            </div>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-6">
            {activity.worksheet.map((item) => {
              const currentVal = worksheetAnswers[item.id] || '';
              const isRevealed = !!revealedInsights[item.id];

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-chem-border bg-chem-paper/60 space-y-3"
                >
                  <label htmlFor={`input-${item.id}`} className="block text-xs sm:text-sm font-bold text-chem-dark leading-snug">
                    {item.prompt}
                  </label>

                  <textarea
                    id={`input-${item.id}`}
                    rows={4}
                    value={currentVal}
                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                    placeholder={item.placeholder}
                    className="w-full p-3.5 bg-white text-xs sm:text-sm text-chem-dark border border-chem-border rounded-xl focus:border-chem-sage focus:outline-none transition-colors"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-chem-ash">
                    <span>{currentVal.length} karakter ditulis</span>

                    <button
                      type="button"
                      onClick={() => toggleInsight(item.id)}
                      className="text-chem-forest hover:text-chem-moss font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isRevealed ? 'Sembunyikan Wawasan Konsep' : 'Lihat Wawasan Konsep / Kunci Analisis'}</span>
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-in fade-in">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Wawasan Analisis yang Diharapkan:
                      </p>
                      <p className="leading-relaxed opacity-90 pl-5">
                        {item.sampleExpectedInsight}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 4. TOMBOL EVALUASI & NAVIGASI */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-chem-border">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-chem-forest hover:bg-chem-moss text-white rounded-2xl text-xs font-bold shadow-float transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-chem-glow" />
                <span>Simpan Isian & Tinjau Evaluasi Mandiri</span>
              </button>

              {isSubmitted && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Lembar kerja berhasil divalidasi! Wawasan telah dibuka.</span>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Workspace Footer Navigation */}
        <div className="pt-6 border-t border-chem-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/aktivitas"
            className="text-xs font-semibold text-chem-forest hover:text-chem-moss flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Aktivitas</span>
          </Link>

          {nextActivity ? (
            <Link
              to={`/aktivitas/${nextActivity.id}`}
              className="px-5 py-3 rounded-2xl bg-chem-forest text-white text-xs font-bold hover:bg-chem-moss flex items-center gap-2 transition-all shadow-xs"
            >
              <span>Aktivitas Selanjutnya: {nextActivity.title}</span>
              <ChevronRight className="w-4 h-4 text-chem-glow" />
            </Link>
          ) : (
            <Link
              to="/kuis"
              className="px-5 py-3 rounded-2xl bg-chem-forest text-white text-xs font-bold hover:bg-chem-moss flex items-center gap-2 transition-all shadow-xs"
            >
              <span>Lanjut ke Tahap 4: Uji Pemahaman Mandiri (Kuis)</span>
              <ArrowRight className="w-4 h-4 text-chem-glow" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
