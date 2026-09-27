import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDataStore } from "../../store/dataStore";
import { QuizSectionViewer } from "../../components/editor/quiz-section-viewer";
import { getCorrectAnswerIds } from "../../lib/quiz";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
} from "lucide-react";

const sameSelection = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort().join("|");
  const sortedB = [...b].sort().join("|");
  return sortedA === sortedB;
};

const getQuizStorageKey = (quizId: string) =>
  `chem_cycle_quiz_progress_${quizId}`;

export const QuizPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quizzes, fetchQuizzes, fetchQuizById } = useDataStore();
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  React.useEffect(() => {
    if (quizzes.length === 0) {
      fetchQuizzes();
    }
  }, [quizzes.length, fetchQuizzes]);

  const quiz = useMemo(() => {
    return quizzes.find((q) => q.id === id);
  }, [quizzes, id]);

  useEffect(() => {
    if (!id) return;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      setIsLoadingQuiz(true);
      fetchQuizById(id).finally(() => setIsLoadingQuiz(false));
    }
  }, [id, quiz?.questions?.length, fetchQuizById]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Record<string, boolean>
  >({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // 1. Load saved quiz progress from client localStorage on mount
  useEffect(() => {
    if (!quiz?.id) return;
    try {
      const saved = localStorage.getItem(getQuizStorageKey(quiz.id));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers);
        if (parsed.submittedAnswers)
          setSubmittedAnswers(parsed.submittedAnswers);
        if (typeof parsed.currentQuestionIndex === "number") {
          setCurrentQuestionIndex(parsed.currentQuestionIndex);
        }
        if (typeof parsed.isQuizCompleted === "boolean") {
          setIsQuizCompleted(parsed.isQuizCompleted);
        }
      }
    } catch (e) {
      console.warn("Gagal membaca progress kuis dari localStorage:", e);
    }
  }, [quiz?.id]);

  // 2. Persist progress to client localStorage (Zero database transmission for student privacy)
  useEffect(() => {
    if (!quiz?.id) return;
    // Don't save empty initial state if there are no answers selected or submitted yet
    if (
      Object.keys(selectedAnswers).length === 0 &&
      Object.keys(submittedAnswers).length === 0 &&
      !isQuizCompleted
    ) {
      return;
    }
    try {
      const progress = {
        quizId: quiz.id,
        selectedAnswers,
        submittedAnswers,
        currentQuestionIndex,
        isQuizCompleted,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        getQuizStorageKey(quiz.id),
        JSON.stringify(progress),
      );
    } catch (e) {
      console.warn("Gagal menyimpan progress kuis ke localStorage:", e);
    }
  }, [
    quiz?.id,
    selectedAnswers,
    submittedAnswers,
    currentQuestionIndex,
    isQuizCompleted,
  ]);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const currentSelectedChoices = currentQ
    ? selectedAnswers[currentQ.id] || []
    : [];
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
    if (quiz?.id) {
      localStorage.removeItem(getQuizStorageKey(quiz.id));
    }
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
      if (
        selection.length > 0 &&
        sameSelection(selection, getCorrectAnswerIds(q))
      ) {
        correctCount++;
      }
    });
    const percentage =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    return {
      correctCount,
      totalCount: totalQuestions,
      percentage,
      passed: percentage >= 70,
    };
  }, [questions, selectedAnswers, totalQuestions]);

  if (
    isLoadingQuiz &&
    (!quiz || !quiz.questions || quiz.questions.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-chem-paper lab-grid-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-chem-border text-center max-w-md space-y-4 shadow-subtle">
          <div className="w-10 h-10 border-4 border-chem-forest border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="font-serif text-lg font-bold text-chem-dark">
            Memuat Paket Soal...
          </h2>
          <p className="text-xs text-chem-ash">
            Menyiapkan butir soal dan petunjuk evaluasi mandiri.
          </p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-chem-paper lab-grid-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-chem-border text-center max-w-md space-y-4 shadow-subtle">
          <h2 className="font-serif text-xl font-bold text-chem-dark">
            Paket Soal Tidak Ditemukan
          </h2>
          <p className="text-xs text-chem-ash">
            Paket latihan yang Anda tuju mungkin tidak tersedia.
          </p>
          <button
            type="button"
            onClick={() => navigate("/kuis")}
            className="px-5 py-2.5 bg-chem-forest text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Kembali ke Menu Kuis
          </button>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-chem-paper lab-grid-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-chem-border text-center max-w-md space-y-4 shadow-subtle">
          <h2 className="font-serif text-xl font-bold text-chem-dark">
            Belum Ada Butir Soal
          </h2>
          <p className="text-xs text-chem-ash">
            Paket latihan &quot;{quiz.title}&quot; belum memiliki butir soal
            yang diterbitkan.
          </p>
          <button
            type="button"
            onClick={() => navigate("/kuis")}
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
          <nav
            className="flex items-center gap-2 text-xs text-chem-ash"
            aria-label="Breadcrumb"
          >
            <Link
              to="/kuis"
              className="hover:text-chem-forest transition-colors"
            >
              Kuis
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
              <h2 className="font-serif text-3xl font-bold text-chem-dark">
                {scoreStats.passed ? "Luar Biasa!" : "Tetap Semangat!"}
              </h2>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto pt-2">
              <div className="p-4 bg-chem-subtle rounded-2xl border border-chem-border">
                <span className="text-[10px] text-chem-ash block uppercase font-bold">
                  Skor Akhir
                </span>
                <span className="text-3xl font-mono font-bold text-chem-forest">
                  {scoreStats.percentage}%
                </span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block uppercase font-bold">
                  Jawaban Benar
                </span>
                <span className="text-3xl font-mono font-bold text-emerald-700">
                  {scoreStats.correctCount}/{scoreStats.totalCount}
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
              <span className="text-xs font-bold text-chem-forest">
                Soal {currentQuestionIndex + 1}/{totalQuestions}
              </span>

              {/* Step indicator pills */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {questions.map((q, idx) => {
                  const isSubmitted = !!submittedAnswers[q.id];
                  const selection = selectedAnswers[q.id] || [];
                  const isCorrect =
                    selection.length > 0 &&
                    sameSelection(selection, getCorrectAnswerIds(q));
                  const isCurrent = idx === currentQuestionIndex;

                  let bgClass =
                    "bg-chem-subtle text-chem-ash border-chem-border";
                  if (isCurrent) {
                    bgClass =
                      "ring-2 ring-chem-forest bg-chem-paper text-chem-forest font-bold";
                  } else if (isSubmitted) {
                    bgClass = isCorrect
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-rose-100 text-rose-800 border-rose-300 font-bold";
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

                {isCurrentMulti && !isCurrentSubmitted && (
                  <p className="text-xs font-semibold text-chem-forest bg-chem-glow/60 border border-chem-sage/30 rounded-xl px-3 py-2">
                    Pilih lebih dari satu jawaban benar.
                  </p>
                )}

                {/* Multiple Choices List */}
                <div className="space-y-3 pt-2">
                  {currentQ.choices.map((choice, choiceIndex) => {
                    const isSelected = currentSelectedChoices.includes(
                      choice.id,
                    );
                    const isCorrect = currentCorrectIds.includes(choice.id);

                    let choiceStyle =
                      "bg-white border-chem-border text-chem-dark hover:border-chem-sage hover:bg-chem-subtle/50";

                    if (isCurrentSubmitted) {
                      if (isCorrect) {
                        choiceStyle =
                          "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400";
                      } else if (isSelected && !isCorrect) {
                        choiceStyle =
                          "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-400";
                      } else {
                        choiceStyle =
                          "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    } else if (isSelected) {
                      choiceStyle =
                        "bg-chem-glow/60 border-chem-forest text-chem-forest ring-2 ring-chem-forest font-semibold";
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
                              ? "bg-chem-forest text-white border-chem-forest"
                              : "border-slate-300 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + choiceIndex)}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed flex-1">
                          {choice.text}
                        </span>
                        {isCurrentMulti &&
                          isSelected &&
                          !isCurrentSubmitted && (
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
                      Pilih Jawaban
                    </button>
                  </div>
                )}

                {/* 4. INSTANT FEEDBACK ENGINE */}
                {isCurrentSubmitted && (
                  <div
                    className={`p-6 rounded-2xl border space-y-3 animate-in fade-in ${
                      isCurrentCorrect
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                        : "bg-rose-50/80 border-rose-300 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCurrentCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                      <span
                        className={`font-bold text-xs uppercase tracking-wider ${
                          isCurrentCorrect
                            ? "text-emerald-800"
                            : "text-rose-800"
                        }`}
                      >
                        {isCurrentCorrect ? "Benar" : "Kurang Tepat"}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed pl-7 opacity-90">
                      {currentQ.explanation}
                    </p>
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
                  {currentQuestionIndex === totalQuestions - 1
                    ? "Selesaikan Kuis"
                    : "Berikutnya"}
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
