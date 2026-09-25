import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  HelpCircle,
  Home,
  Zap,
  Award,
} from 'lucide-react';

export const QuizCatalogPage: React.FC = () => {
  const { quizzes } = useDataStore();

  const publishedQuizzes = useMemo(() => {
    return [...quizzes]
      .filter((q) => q.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [quizzes]);

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
          <span className="font-semibold text-chem-dark">Katalog Latihan Soal</span>
        </nav>

        {/* Header & Open-Access Description */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-chem-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chem-glow/70 border border-chem-sage/30 text-chem-forest text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-chem-sage" />
              <span>Evaluasi Mandiri Tanpa Hambatan (Open-Access)</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-chem-dark">
              Pusat Latihan & Evaluasi Konsep
            </h1>
            <p className="text-xs sm:text-sm text-chem-ash leading-relaxed">
              Semua paket latihan soal dapat dikerjakan secara langsung tanpa perlu membuat akun atau login. Dapatkan umpan balik instan (Instant Feedback Engine) lengkap dengan pembahasan mendalam di setiap butir soal.
            </p>
          </div>

          <div className="p-4 bg-chem-subtle/80 rounded-2xl border border-chem-border shrink-0 text-center space-y-1">
            <Award className="w-8 h-8 text-chem-forest mx-auto" />
            <p className="text-xs font-bold text-chem-dark">Evaluasi Formatif</p>
            <p className="text-[10px] text-chem-ash">Bebas kecemasan & terarah</p>
          </div>
        </div>

        {/* Dynamic Quiz Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-3xl border border-chem-border p-6 shadow-subtle hover:shadow-float hover:border-chem-sage transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-chem-glow text-chem-forest border border-chem-sage/40">
                    {quiz.topic}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      quiz.difficulty === 'Dasar'
                        ? 'bg-blue-100 text-blue-800'
                        : quiz.difficulty === 'Menengah'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Tingkat: {quiz.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-chem-dark group-hover:text-chem-forest transition-colors leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-chem-ash mt-2.5 leading-relaxed line-clamp-3">
                    {quiz.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-chem-ash pt-2 border-t border-chem-border/60">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-chem-sage" />
                    {quiz.durationMinutes} menit
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-chem-sage" />
                    {quiz.questions.length} butir soal
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-chem-border/60">
                <Link
                  to={`/kuis/${quiz.id}`}
                  className="w-full py-3 px-4 rounded-2xl bg-chem-forest hover:bg-chem-moss text-white flex items-center justify-between text-xs font-bold transition-all shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-chem-glow" />
                    Mulai Kerjakan Kuis
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
