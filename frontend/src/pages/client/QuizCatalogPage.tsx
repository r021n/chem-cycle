import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import {
  Clock,
  ChevronRight,
  HelpCircle,
  Home,
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

        {/* Dynamic Quiz Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedQuizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/kuis/${quiz.id}`}
              className="bg-white rounded-3xl border border-chem-border p-5 shadow-subtle hover:shadow-float hover:border-chem-sage transition-all flex flex-col gap-3 group"
            >
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
                  {quiz.difficulty}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-chem-dark group-hover:text-chem-forest transition-colors leading-snug">
                  {quiz.title}
                </h3>
                <p className="text-xs text-chem-ash mt-2 leading-relaxed line-clamp-2">
                  {quiz.description}
                </p>
              </div>

              <div className="mt-auto pt-1 flex items-center justify-between text-xs font-bold text-chem-forest">
                <span className="flex items-center gap-3 text-chem-ash font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-chem-sage" />
                    {quiz.durationMinutes} mnt
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-chem-sage" />
                    {quiz.questions.length} soal
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  Mulai
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
