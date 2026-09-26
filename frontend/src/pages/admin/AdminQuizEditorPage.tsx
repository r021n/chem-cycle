import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { QuizSectionType, QuizSection } from '../../types/app';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Image as ImageIcon,
  List,
  ListOrdered,
  Pilcrow,
  Plus,
  Save,
  Trash2,
  MonitorPlay,
  AlertTriangle,
} from 'lucide-react';
import { QuizSectionEditor } from '../../components/editor/quiz-section-editor';
import {
  EditorQuestion,
  createChoice,
  createEditorQuestion,
  createSection,
  deriveQuestionText,
  toEditorQuestion,
  toQuizQuestion,
  uid,
} from '../../lib/quiz';
import { cn } from '../../lib/utils';

interface QuizMetaDraft {
  title: string;
  topic: string;
  description: string;
  durationMinutes: number;
  difficulty: 'Dasar' | 'Menengah' | 'Lanjutan';
  isPublished: boolean;
}

const BLOCK_OPTIONS: { type: QuizSectionType; label: string; icon: React.ElementType; hint: string }[] = [
  { type: 'text', label: 'Tulisan Biasa', icon: Pilcrow, hint: 'Paragraf atau kalimat teks' },
  { type: 'image', label: 'Gambar', icon: ImageIcon, hint: 'Dikompres otomatis < 300 KB' },
  { type: 'youtube', label: 'Link YouTube', icon: MonitorPlay, hint: 'Sematkan video penjelasan' },
  { type: 'orderedList', label: 'Daftar Berurut', icon: ListOrdered, hint: 'Langkah bernomor 1, 2, 3' },
  { type: 'unorderedList', label: 'Daftar Berbutir', icon: List, hint: 'Poin-poin dengan bullet' },
];

const MAX_CHOICES = 10;
const MIN_CHOICES = 2;

export const AdminQuizEditorPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { quizzes, updateQuiz } = useDataStore();

  const quiz = quizzes.find((q) => q.id === quizId);

  const loadedRef = useRef<string | null>(null);
  const [meta, setMeta] = useState<QuizMetaDraft>({
    title: '',
    topic: '',
    description: '',
    durationMinutes: 15,
    difficulty: 'Menengah',
    isPublished: true,
  });
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [addMenuId, setAddMenuId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId || loadedRef.current === quizId) return;
    const target = quizzes.find((q) => q.id === quizId);
    if (!target) return;
    loadedRef.current = quizId;
    setMeta({
      title: target.title,
      topic: target.topic,
      description: target.description,
      durationMinutes: target.durationMinutes,
      difficulty: target.difficulty,
      isPublished: target.isPublished,
    });
    const editorQuestions = target.questions.map(toEditorQuestion);
    setQuestions(editorQuestions);
    setOpenIds(editorQuestions.length > 0 ? [editorQuestions[0].id] : []);
  }, [quizId, quizzes]);

  if (!quiz) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs text-center space-y-4">
          <h1 className="font-serif text-xl font-bold text-slate-900">Paket Kuis Tidak Ditemukan</h1>
          <p className="text-xs text-slate-500">
            Paket latihan yang ingin Anda edit mungkin sudah dihapus.
          </p>
          <Link
            to="/admin/kuis"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Bank Soal</span>
          </Link>
        </div>
      </div>
    );
  }

  const updateQuestion = (questionId: string, patch: Partial<EditorQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, ...patch } : q)));
  };

  const updateSection = (questionId: string, sectionIndex: number, section: QuizSection) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const sections = [...q.sections];
        sections[sectionIndex] = section;
        return { ...q, sections };
      })
    );
  };

  const moveSection = (questionId: string, sectionIndex: number, direction: 'up' | 'down') => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const sections = [...q.sections];
        const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return q;
        const temp = sections[sectionIndex];
        sections[sectionIndex] = sections[targetIndex];
        sections[targetIndex] = temp;
        return { ...q, sections };
      })
    );
  };

  const deleteSection = (questionId: string, sectionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const sections = q.sections.filter((_, i) => i !== sectionIndex);
        return {
          ...q,
          sections:
            sections.length > 0
              ? sections
              : [{ id: uid('sec'), type: 'text', text: '' } as QuizSection],
        };
      })
    );
  };

  const addSection = (questionId: string, type: QuizSectionType) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, sections: [...q.sections, createSection(type)] } : q
      )
    );
    setAddMenuId(null);
  };

  const setChoiceCount = (questionId: string, count: number) => {
    const next = Math.min(MAX_CHOICES, Math.max(MIN_CHOICES, count));
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const choices = [...q.choices];
        while (choices.length < next) choices.push(createChoice());
        const trimmed = choices.slice(0, next);
        const validIds = new Set(trimmed.map((c) => c.id));
        return {
          ...q,
          choices: trimmed,
          correctAnswerIds: q.correctAnswerIds.filter((id) => validIds.has(id)),
        };
      })
    );
  };

  const removeChoice = (questionId: string, choiceIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || q.choices.length <= MIN_CHOICES) return q;
        const removed = q.choices[choiceIndex];
        const choices = q.choices.filter((_, i) => i !== choiceIndex);
        return {
          ...q,
          choices,
          correctAnswerIds: q.correctAnswerIds.filter((id) => id !== removed.id),
        };
      })
    );
  };

  const toggleCorrect = (questionId: string, choiceId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const exists = q.correctAnswerIds.includes(choiceId);
        return {
          ...q,
          correctAnswerIds: exists
            ? q.correctAnswerIds.filter((id) => id !== choiceId)
            : [...q.correctAnswerIds, choiceId],
        };
      })
    );
  };

  const addQuestion = () => {
    const newQuestion = createEditorQuestion();
    setQuestions((prev) => [...prev, newQuestion]);
    setOpenIds((prev) => [...prev, newQuestion.id]);
    setAddMenuId(null);
    window.setTimeout(() => {
      document.getElementById(`question-${newQuestion.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 60);
  };

  const duplicateQuestion = (questionId: string) => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === questionId);
      if (index < 0) return prev;
      const source = prev[index];
      const copy: EditorQuestion = {
        ...source,
        id: uid('q'),
        sections: source.sections.map((s) => ({ ...s, id: uid('sec') } as QuizSection)),
        choices: source.choices.map((c) => ({ ...c, id: uid('opt') })),
        correctAnswerIds: [],
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      setOpenIds((ids) => [...ids, copy.id]);
      return next;
    });
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setOpenIds((prev) => prev.filter((id) => id !== questionId));
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === questionId);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const toggleOpen = (questionId: string) => {
    setOpenIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const incompleteCount = questions.filter((q) => {
    const hasText = q.sections.some((s) => s.type === 'text' && s.text.trim());
    const hasMedia = q.sections.some(
      (s) => (s.type === 'image' && s.dataUrl) || (s.type === 'youtube' && s.url.trim())
    );
    const hasChoice = q.choices.some((c) => c.text.trim());
    return (
      (!hasText && !hasMedia) || !hasChoice || q.correctAnswerIds.length === 0 || !q.explanation.trim()
    );
  }).length;

  const handleSave = () => {
    updateQuiz(quiz.id, {
      ...meta,
      questions: questions.map(toQuizQuestion),
    });
    setSavedAt(new Date().toISOString());
  };

  const handleSaveAndBack = () => {
    handleSave();
    navigate('/admin/kuis');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            to="/admin/kuis"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-chem-forest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Bank Soal</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            Editor Butir Soal
          </h1>
          <p className="text-xs text-slate-500">
            {quiz.title || 'Paket kuis tanpa judul'} · {questions.length} butir soal
            {incompleteCount > 0 && (
              <span className="text-amber-600 font-semibold">
                {' '}
                · {incompleteCount} butir belum lengkap
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersimpan {new Date(savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveAndBack}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-chem-sage" />
            <span>Simpan &amp; Kembali</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-chem-glow" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Package meta */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-chem-forest block">
          Info Paket Kuis
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Judul Paket</label>
            <input
              type="text"
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Topik Pembelajaran</label>
            <input
              type="text"
              value={meta.topic}
              onChange={(e) => setMeta({ ...meta, topic: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Tingkat Kesulitan</label>
            <select
              value={meta.difficulty}
              onChange={(e) => setMeta({ ...meta, difficulty: e.target.value as QuizMetaDraft['difficulty'] })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
            >
              <option value="Dasar">Dasar</option>
              <option value="Menengah">Menengah</option>
              <option value="Lanjutan">Lanjutan</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Durasi (Menit)</label>
            <input
              type="number"
              min={1}
              value={meta.durationMinutes}
              onChange={(e) => setMeta({ ...meta, durationMinutes: Number(e.target.value) })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pb-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={meta.isPublished}
                onChange={(e) => setMeta({ ...meta, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-chem-forest focus:ring-chem-sage cursor-pointer"
              />
              <span>Terbitkan paket ini</span>
            </label>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Deskripsi Paket</label>
            <textarea
              rows={2}
              value={meta.description}
              onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, questionIndex) => {
          const isOpen = openIds.includes(question.id);
          const hasCorrect = question.correctAnswerIds.length > 0;
          const summary = deriveQuestionText(question.sections);

          return (
            <div
              key={question.id}
              id={`question-${question.id}`}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden"
            >
              {/* Question header */}
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => toggleOpen(question.id)}
                  className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="shrink-0 text-[11px] font-mono font-bold uppercase tracking-wider text-chem-forest bg-chem-glow/60 border border-chem-sage/30 px-2 py-0.5 rounded-full">
                    Soal {questionIndex + 1}
                  </span>
                  <span className="text-xs text-slate-600 truncate">
                    {isOpen ? summary : summary || '(Belum ada isi soal)'}
                  </span>
                  {!hasCorrect && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Belum ada jawaban benar
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={questionIndex === 0}
                    onClick={() => moveQuestion(question.id, 'up')}
                    className="p-1.5 text-slate-400 hover:text-chem-forest hover:bg-white rounded-lg disabled:opacity-25 cursor-pointer"
                    title="Geser Soal Naik"
                  >
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    disabled={questionIndex === questions.length - 1}
                    onClick={() => moveQuestion(question.id, 'down')}
                    className="p-1.5 text-slate-400 hover:text-chem-forest hover:bg-white rounded-lg disabled:opacity-25 cursor-pointer"
                    title="Geser Soal Turun"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateQuestion(question.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer"
                    title="Duplikat Soal"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(question.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question body */}
              {isOpen && (
                <div className="p-5 space-y-6">
                  {/* Sections (Notion-style blocks) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-chem-forest block">
                      Isi &amp; Stimulus Soal
                    </span>
                    <div className="space-y-2">
                      {question.sections.map((section, sectionIndex) => (
                        <QuizSectionEditor
                          key={section.id}
                          section={section}
                          index={sectionIndex}
                          total={question.sections.length}
                          onChange={(next) => updateSection(question.id, sectionIndex, next)}
                          onMove={(dir) => moveSection(question.id, sectionIndex, dir)}
                          onDelete={() => deleteSection(question.id, sectionIndex)}
                        />
                      ))}
                    </div>

                    {/* Add block menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAddMenuId(addMenuId === question.id ? null : question.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 mt-1 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-chem-sage hover:text-chem-forest hover:bg-chem-glow/30 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Blok</span>
                      </button>

                      {addMenuId === question.id && (
                        <div className="absolute z-20 left-0 mt-1 w-72 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl grid grid-cols-1 gap-1">
                          {BLOCK_OPTIONS.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <button
                                key={option.type}
                                type="button"
                                onClick={() => addSection(question.id, option.type)}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-left cursor-pointer"
                              >
                                <span className="w-8 h-8 rounded-lg bg-chem-glow/60 border border-chem-sage/30 text-chem-forest flex items-center justify-center shrink-0">
                                  <OptionIcon className="w-4 h-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-xs font-bold text-slate-800">
                                    {option.label}
                                  </span>
                                  <span className="block text-[10px] text-slate-500 truncate">
                                    {option.hint}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chemical formula */}
                  <div className="space-y-1 pt-4 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-700">
                      Rumus Kimia / Persamaan Reaksi (opsional)
                    </label>
                    <input
                      type="text"
                      value={question.chemicalFormula}
                      onChange={(e) => updateQuestion(question.id, { chemicalFormula: e.target.value })}
                      placeholder="e.g. CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)"
                      className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none"
                    />
                  </div>

                  {/* Choices */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-chem-forest">
                        Pilihan Jawaban
                        {question.correctAnswerIds.length > 1 && (
                          <span className="ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full normal-case tracking-normal">
                            Multi Jawaban Benar ({question.correctAnswerIds.length})
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-semibold text-slate-500">
                          Jumlah Pilihan
                        </label>
                        <select
                          value={question.choices.length}
                          onChange={(e) => setChoiceCount(question.id, Number(e.target.value))}
                          className="p-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono cursor-pointer"
                        >
                          {Array.from({ length: MAX_CHOICES - MIN_CHOICES + 1 }, (_, i) => i + MIN_CHOICES).map(
                            (n) => (
                              <option key={n} value={n}>
                                {n} pilihan
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Centang kolom <span className="font-bold text-emerald-700">Benar</span> pada
                      satu atau lebih pilihan. Boleh lebih dari satu jawaban benar.
                    </p>

                    <div className="space-y-2">
                      {question.choices.map((choice, choiceIndex) => {
                        const isCorrect = question.correctAnswerIds.includes(choice.id);
                        return (
                          <div
                            key={choice.id}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-xl border transition-colors',
                              isCorrect
                                ? 'bg-emerald-50/70 border-emerald-300'
                                : 'bg-slate-50 border-slate-200'
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => toggleCorrect(question.id, choice.id)}
                              className={cn(
                                'shrink-0 w-7 h-7 rounded-lg border-2 text-[11px] font-mono font-bold flex items-center justify-center cursor-pointer transition-colors',
                                isCorrect
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-white border-slate-300 text-slate-500 hover:border-emerald-400'
                              )}
                              title={isCorrect ? 'Tandai salah' : 'Tandai benar'}
                            >
                              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : String.fromCharCode(65 + choiceIndex)}
                            </button>
                            <input
                              type="text"
                              value={choice.text}
                              onChange={(e) => {
                                const choices = [...question.choices];
                                choices[choiceIndex] = { ...choice, text: e.target.value };
                                updateQuestion(question.id, { choices });
                              }}
                              placeholder={`Teks pilihan ${String.fromCharCode(65 + choiceIndex)}...`}
                              className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage"
                            />
                            <button
                              type="button"
                              disabled={question.choices.length <= MIN_CHOICES}
                              onClick={() => removeChoice(question.id, choiceIndex)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-25 cursor-pointer"
                              title="Hapus Pilihan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {question.choices.length < MAX_CHOICES && (
                      <button
                        type="button"
                        onClick={() => setChoiceCount(question.id, question.choices.length + 1)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-chem-forest px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Pilihan</span>
                      </button>
                    )}

                    {!hasCorrect && (
                      <p className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        Tandai minimal satu pilihan sebagai jawaban benar sebelum menyimpan.
                      </p>
                    )}
                  </div>

                  {/* Explanations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Pembahasan Soal
                      </label>
                      <textarea
                        rows={4}
                        value={question.explanation}
                        onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                        placeholder="Penjelasan lengkap yang ditampilkan setelah user mengunci jawaban..."
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none resize-y"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Penjelasan Jika Jawaban User Salah
                      </label>
                      <textarea
                        rows={4}
                        value={question.wrongAnswerExplanation}
                        onChange={(e) =>
                          updateQuestion(question.id, { wrongAnswerExplanation: e.target.value })
                        }
                        placeholder="Ditampilkan khusus saat jawaban user kurang tepat (opsional)..."
                        className="w-full p-2.5 text-xs bg-rose-50/50 border border-rose-200 rounded-xl focus:border-rose-300 focus:outline-none resize-y"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Ringkasan Konsep Penguatan (opsional)
                      </label>
                      <input
                        type="text"
                        value={question.conceptSummary}
                        onChange={(e) => updateQuestion(question.id, { conceptSummary: e.target.value })}
                        placeholder="e.g. ΔH = H_produk - H_reaktan < 0 menunjukkan reaksi eksotermik."
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {questions.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-3">
            <p className="text-xs text-slate-500">
              Paket ini belum memiliki butir soal. Tambahkan soal pertama untuk mulai menyusun bank soal.
            </p>
          </div>
        )}
      </div>

      {/* Add question */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white rounded-3xl border border-slate-200 shadow-2xs p-4">
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-chem-glow" />
          <span>Tambah Butir Soal Baru</span>
        </button>
        <button
          type="button"
          onClick={handleSaveAndBack}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
        >
          Simpan &amp; Kembali ke Bank Soal
        </button>
      </div>
    </div>
  );
};
