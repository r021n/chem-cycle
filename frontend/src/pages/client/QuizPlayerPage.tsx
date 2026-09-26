import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { ChemFormula } from '../../components/common/ChemFormula';
import { QuizSectionViewer } from '../../components/editor/quiz-section-viewer';
import { getCorrectAnswerIds } from '../../lib/quiz';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

const sameSelection = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort().join('|');
  const sortedB = [...b].sort().join('|');
  return sortedA === sortedB;
};

export const QuizPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quizzes } = useDataStore();

  const quiz = useMemo(() => {
    return quizzes.find((q) => q.id === id);
  }, [quizzes, id]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const currentSelectedChoices = currentQ ? selectedAnswers[currentQ.id] || [] : [];
  const isCurrentSubmitted = currentQ ? !!submittedAnswers[currentQ.id] : false;
  const currentCorrectIds = currentQ ? getCorrectAnswerIds(currentQ) : [];
  const isCurrentMulti = currentCorrectIds.length > 1;
  const isCurrentCorrect = currentQ
    ? sameSelection(currentSelectedChoices, currentCorrectIds)
    : false;

  const handleSelectOption = (choiceId: string) => {
    if (isCurrentSubmitted) return;
    if (!currentQ) return;
    setSelectedAnswers((prev) => {
      const current = prev[currentQ.id] || [];
      if (isCurrentMulti) {
        const next = current.includes(choiceId)
          ? current.filter((c) => c !== choiceId)
          : [...current, choiceId];
        return { ...prev, [currentQ.id]: next };
      }
      return { ...prev, [currentQ.id]: [choiceId] };
    });
  };

  const handleSubmitCurrent = () => {
    if (!currentQ || currentSelectedChoices.length === 0) return;
    setSubmittedAnswers((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizCompleted(false);
  };

  // Calculate final score summary
  const scoreStats = useMemo(() => {
    let correctCount = 0;
    questions.forEach((q) => {
      const selection = selectedAnswers[q.id] || [];
      if (selection.length > 0 && sameSelection(selection, getCorrectAnswerIds(q))) {
        correctCount++;
      }
    });
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    return {
      correctCount,
      totalCount: totalQuestions,
      percentage,
      passed: percentage >= 70,
    };
  }, [questions, selectedAnswers, totalQuestions]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-chem-paper lab-grid-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-chem-border text-center max-w-md space-y-4 shadow-subtle">
          <h2 className="font-serif text-xl font-bold text-chem-dark">Paket Soal Tidak Ditemukan</h2>
          <p className="text-xs text-chem-ash">
            Paket latihan yang Anda tuju mungkin tidak tersedia.
          </p>
          <button
            type="button"
            onClick={() => navigate('/kuis')}
            className="px-5 py-2.5 bg-chem-forest text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Kembali ke Menu Kuis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark py-8 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-chem-ash" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-chem-forest flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
            <Link to="/kuis" className="hover:text-chem-forest transition-colors">
              Menu Kuis
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
            <span className="font-semibold text-chem-dark truncate max-w-[200px]">
              {quiz.title}
            </span>
          </nav>

          <span className="text-xs font-semibold text-chem-forest bg-chem-glow/60 px-3 py-1 rounded-full border border-chem-sage/30">
            {quiz.topic}
          </span>
        </div>

        {/* 1. SCORE SUMMARY CARD (IF COMPLETED) */}
        {isQuizCompleted ? (
          <div className="bg-white rounded-3xl border border-chem-border p-8 shadow-float text-center space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-chem-glow text-chem-forest shadow-subtle">
              <Award className="w-10 h-10 text-chem-forest animate-bounce-short" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-chem-sage px-3 py-1 rounded-full bg-chem-glow/60 border border-chem-sage/30">
                Rekapitulasi Evaluasi Mandiri
              </span>
              <h2 className="font-serif text-3xl font-bold text-chem-dark">
                {scoreStats.passed ? 'Luar Biasa! Pemahaman Sangat Baik' : 'Tetap Semangat! Tinjau Kembali Konsep'}
              </h2>
              <p className="text-xs sm:text-sm text-chem-ash max-w-lg mx-auto">
                {scoreStats.passed
                  ? 'Anda berhasil menguasai indikator kompetensi pada paket materi ini dengan memuaskan.'
                  : 'Pelajari kembali pembahasan dan catatan konsep di materi untuk memperkuat penalaran sains Anda.'}
              </p>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
              <div className="p-4 bg-chem-subtle rounded-2xl border border-chem-border">
                <span className="text-[10px] text-chem-ash block uppercase font-bold">Skor Akhir</span>
                <span className="text-3xl font-mono font-bold text-chem-forest">{scoreStats.percentage}%</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block uppercase font-bold">Jawaban Benar</span>
                <span className="text-3xl font-mono font-bold text-emerald-700">{scoreStats.correctCount}</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="text-[10px] text-rose-800 block uppercase font-bold">Perlu Perbaikan</span>
                <span className="text-3xl font-mono font-bold text-rose-700">
                  {scoreStats.totalCount - scoreStats.correctCount}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 border-t border-chem-border">
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="px-6 py-3 bg-white hover:bg-chem-subtle text-chem-dark border border-chem-border rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-chem-sage" />
                <span>Ulangi Latihan</span>
              </button>

              <Link
                to="/kuis"
                className="px-6 py-3 bg-chem-forest hover:bg-chem-moss text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Kembali ke Menu Kuis</span>
                <ArrowRight className="w-4 h-4 text-chem-glow" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 2. STEPPER / QUESTION TRACKER */}
            <div className="bg-white p-5 rounded-3xl border border-chem-border shadow-subtle space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-chem-forest">
                  Soal No. {currentQuestionIndex + 1} dari {totalQuestions}
                </span>
                <span className="text-chem-ash">
                  {Object.keys(submittedAnswers).length} dari {totalQuestions} terjawab
                </span>
              </div>

              {/* Step indicator pills */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {questions.map((q, idx) => {
                  const isSubmitted = !!submittedAnswers[q.id];
                  const selection = selectedAnswers[q.id] || [];
                  const isCorrect =
                    selection.length > 0 && sameSelection(selection, getCorrectAnswerIds(q));
                  const isCurrent = idx === currentQuestionIndex;

                  let bgClass = 'bg-chem-subtle text-chem-ash border-chem-border';
                  if (isCurrent) {
                    bgClass = 'ring-2 ring-chem-forest bg-chem-paper text-chem-forest font-bold';
                  } else if (isSubmitted) {
                    bgClass = isCorrect
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. DYNAMIC QUESTION CARD */}
            {currentQ && (
              <div className="bg-white rounded-3xl border border-chem-border shadow-subtle p-6 sm:p-8 space-y-6">
                {/* Question content sections (Notion-style blocks) */}
                {currentQ.sections && currentQ.sections.length > 0 ? (
                  <QuizSectionViewer sections={currentQ.sections} />
                ) : (
                  <>
                    {/* Question stimulus image (legacy) */}
                    {currentQ.stimulusImage && (
                      <div className="h-52 w-full rounded-2xl overflow-hidden border border-chem-border bg-slate-100">
                        <img
                          src={currentQ.stimulusImage}
                          alt="Stimulus Soal Kimia"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Question Text (legacy) */}
                    <div className="space-y-3">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-chem-dark leading-snug">
                        {currentQ.questionText}
                      </h3>
                    </div>
                  </>
                )}

                {currentQ.chemicalFormula && (
                  <div className="p-3 bg-chem-subtle/80 rounded-xl border border-chem-border">
                    <ChemFormula formula={currentQ.chemicalFormula} className="text-sm font-bold text-chem-forest" />
                  </div>
                )}

                {isCurrentMulti && !isCurrentSubmitted && (
                  <p className="text-xs font-semibold text-chem-forest bg-chem-glow/60 border border-chem-sage/30 rounded-xl px-3 py-2">
                    Soal ini memiliki lebih dari satu jawaban benar. Pilih semua jawaban yang
                    Anda anggap benar sebelum mengunci jawaban.
                  </p>
                )}

                {/* Multiple Choices List */}
                <div className="space-y-3 pt-2">
                  {currentQ.choices.map((choice, choiceIndex) => {
                    const isSelected = currentSelectedChoices.includes(choice.id);
                    const isCorrect = currentCorrectIds.includes(choice.id);

                    let choiceStyle = 'bg-white border-chem-border text-chem-dark hover:border-chem-sage hover:bg-chem-subtle/50';

                    if (isCurrentSubmitted) {
                      if (isCorrect) {
                        choiceStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400';
                      } else if (isSelected && !isCorrect) {
                        choiceStyle = 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-400';
                      } else {
                        choiceStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    } else if (isSelected) {
                      choiceStyle = 'bg-chem-glow/60 border-chem-forest text-chem-forest ring-2 ring-chem-forest font-semibold';
                    }

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => handleSelectOption(choice.id)}
                        disabled={isCurrentSubmitted}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${choiceStyle}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold ${
                            isSelected || (isCurrentSubmitted && isCorrect)
                              ? 'bg-chem-forest text-white border-chem-forest'
                              : 'border-slate-300 text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + choiceIndex)}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed flex-1">
                          {choice.text}
                        </span>
                        {isCurrentMulti && isSelected && !isCurrentSubmitted && (
                          <CheckCircle2 className="w-5 h-5 text-chem-forest shrink-0" />
                        )}
                        {isCurrentSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isCurrentSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit button if not yet submitted */}
                {!isCurrentSubmitted && (
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitCurrent}
                      disabled={currentSelectedChoices.length === 0}
                      className="px-6 py-3 bg-chem-forest hover:bg-chem-moss disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Kunci Jawaban & Lihat Pembahasan
                    </button>
                  </div>
                )}

                {/* 4. INSTANT FEEDBACK ENGINE */}
                {isCurrentSubmitted && (
                  <div
                    className={`p-6 rounded-2xl border space-y-3 animate-in fade-in ${
                      isCurrentCorrect
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50/80 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCurrentCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                            Jawaban Anda Benar!
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-600" />
                          <span className="font-bold text-xs uppercase tracking-wider text-rose-800">
                            Jawaban Anda Kurang Tepat
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-xs space-y-1.5 pl-7">
                      <p className="font-semibold text-chem-dark">
                        {!isCurrentCorrect && currentQ.wrongAnswerExplanation?.trim()
                          ? 'Penjelasan Jawaban Salah:'
                          : 'Pembahasan:'}
                      </p>
                      <p className="leading-relaxed opacity-90">
                        {!isCurrentCorrect && currentQ.wrongAnswerExplanation?.trim()
                          ? currentQ.wrongAnswerExplanation
                          : currentQ.explanation}
                      </p>
                    </div>

                    <div className="mt-3 p-3 bg-white/90 rounded-xl border border-chem-border/70 flex items-start gap-2.5 text-xs text-chem-forest">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Penguatan Konsep:</span>
                        <span>{currentQ.conceptSummary}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-3 rounded-2xl bg-white border border-chem-border text-xs font-bold text-chem-dark hover:bg-chem-subtle disabled:opacity-30 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-chem-forest hover:bg-chem-moss text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <span>
                  {currentQuestionIndex === totalQuestions - 1 ? 'Selesaikan Kuis' : 'Berikutnya'}
                </span>
                <ChevronRight className="w-4 h-4 text-chem-glow" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
