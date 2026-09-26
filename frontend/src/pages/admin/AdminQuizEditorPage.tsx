import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { QuizSectionType, QuizSection } from '../../types/app';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  FlaskConical,
  Eye,
  Edit3,
  Sparkles,
  Layers,
  HelpCircle,
  Check,
} from 'lucide-react';
import { QuizSectionEditor, BLOCK_METAS } from '../../components/editor/quiz-section-editor';
import { QuizSectionViewer } from '../../components/editor/quiz-section-viewer';
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
  const [addMenuQuestionId, setAddMenuQuestionId] = useState<string | null>(null);
  const [insertBetweenIndex, setInsertBetweenIndex] = useState<{ qId: string; idx: number } | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);
  const [previewSelectedChoices, setPreviewSelectedChoices] = useState<Record<string, string[]>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState<Record<string, boolean>>({});

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

  const duplicateSection = (questionId: string, sectionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const target = q.sections[sectionIndex];
        const copy = JSON.parse(JSON.stringify(target));
        copy.id = uid('sec');
        const next = [...q.sections];
        next.splice(sectionIndex + 1, 0, copy);
        return { ...q, sections: next };
      })
    );
  };

  const insertSectionAt = (questionId: string, index: number, type: QuizSectionType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const next = [...q.sections];
        next.splice(index, 0, createSection(type));
        return { ...q, sections: next };
      })
    );
    setInsertBetweenIndex(null);
    setAddMenuQuestionId(null);
  };

  const addSection = (questionId: string, type: QuizSectionType) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, sections: [...q.sections, createSection(type)] } : q
      )
    );
    setAddMenuQuestionId(null);
  };

  const convertSectionType = (questionId: string, sectionIndex: number, newType: QuizSectionType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const current = q.sections[sectionIndex];
        let currentText = '';
        if (current.type === 'text' || current.type === 'callout' || current.type === 'heading') {
          currentText = current.text || '';
        } else if (current.type === 'formula') {
          currentText = current.formula || '';
        }

        let converted: QuizSection;
        switch (newType) {
          case 'formula':
            converted = { id: current.id, type: 'formula', formula: currentText, caption: '' };
            break;
          case 'heading':
            converted = { id: current.id, type: 'heading', text: currentText, level: 2 };
            break;
          case 'callout':
            converted = { id: current.id, type: 'callout', text: currentText, emoji: '💡' };
            break;
          case 'orderedList':
            converted = { id: current.id, type: 'orderedList', items: currentText ? [currentText] : [''] };
            break;
          case 'unorderedList':
            converted = { id: current.id, type: 'unorderedList', items: currentText ? [currentText] : [''] };
            break;
          case 'divider':
            converted = { id: current.id, type: 'divider' };
            break;
          case 'image':
            converted = { id: current.id, type: 'image', dataUrl: '', caption: currentText };
            break;
          case 'youtube':
            converted = { id: current.id, type: 'youtube', url: '' };
            break;
          case 'text':
          default:
            converted = { id: current.id, type: 'text', text: currentText };
            break;
        }

        const sections = [...q.sections];
        sections[sectionIndex] = converted;
        return { ...q, sections };
      })
    );
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
    setAddMenuQuestionId(null);
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
        correctAnswerIds: [...source.correctAnswerIds],
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

  const checkQuestionComplete = (q: EditorQuestion) => {
    const hasText = q.sections.some(
      (s) =>
        (s.type === 'text' && s.text.trim()) ||
        (s.type === 'heading' && s.text.trim()) ||
        (s.type === 'formula' && s.formula.trim()) ||
        (s.type === 'callout' && s.text.trim())
    );
    const hasMedia = q.sections.some(
      (s) => (s.type === 'image' && s.dataUrl) || (s.type === 'youtube' && s.url.trim())
    );
    const hasChoice = q.choices.some((c) => c.text.trim());
    const hasCorrect = q.correctAnswerIds.length > 0;
    const hasExplanation = !!q.explanation.trim();
    return (hasText || hasMedia) && hasChoice && hasCorrect && hasExplanation;
  };

  const incompleteQuestions = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx, complete: checkQuestionComplete(q) }))
      .filter((item) => !item.complete);
  }, [questions]);

  const handleSave = () => {
    if (!quiz) return;
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

  const currentPreviewQ = questions[previewQuestionIndex];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            to="/admin/kuis"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-chem-forest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Bank Soal</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-chem-glow/60 border border-chem-sage/40 flex items-center justify-center text-chem-forest">
              <FlaskConical className="w-4 h-4" />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              Editor Soal Berbasis Blok
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {quiz.title || 'Paket kuis'} · {questions.length} butir soal
            {incompleteQuestions.length > 0 ? (
              <span className="text-amber-600 font-semibold ml-2 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {incompleteQuestions.length} butir belum lengkap
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold ml-2 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Semua butir siap dipublikasikan
              </span>
            )}
          </p>
        </div>

        {/* Action Controls & Save */}
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
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Simpan &amp; Kembali</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4 text-chem-glow" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Notion-style View Tabs: Editor vs Live Student Preview */}
      <div className="flex items-center justify-between gap-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer',
              activeTab === 'editor'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Edit3 className="w-3.5 h-3.5 text-chem-forest" />
            <span>Mode Editor Blok (Notion)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('preview');
              setPreviewSubmitted({});
              setPreviewSelectedChoices({});
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer',
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Eye className="w-3.5 h-3.5 text-chem-forest" />
            <span>Pratinjau Nyata Siswa</span>
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 px-3">
          <Sparkles className="w-3 h-3 text-chem-sage" />
          <span>Rumus kimia terintegrasi penuh dalam block section</span>
        </span>
      </div>

      {activeTab === 'editor' ? (
        <>
          {/* Package Metadata Notion Box */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-chem-forest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Informasi Paket Kuis
              </span>
              <span className="text-[11px] text-slate-400">Atur judul dan parameter kuis</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Judul Paket Latihan</label>
                <input
                  type="text"
                  value={meta.title}
                  onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                  placeholder="e.g. Latihan Reaksi Termokimia & Hukum Hess"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none text-slate-900 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Topik Pembelajaran</label>
                <input
                  type="text"
                  value={meta.topic}
                  onChange={(e) => setMeta({ ...meta, topic: e.target.value })}
                  placeholder="e.g. Termokimia, Laju Reaksi, Kesetimbangan"
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
                <label className="text-xs font-semibold text-slate-700">Durasi Pengerjaan (Menit)</label>
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
                  <span>Publikasikan paket ini untuk siswa</span>
                </label>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Deskripsi Paket</label>
                <textarea
                  rows={2}
                  value={meta.description}
                  onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                  placeholder="Tujuan latihan, kompetensi dasar, atau panduan pengerjaan..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Quick Question Selector Pills */}
          {questions.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                Navigasi Soal:
              </span>
              {questions.map((q, idx) => {
                const isComplete = checkQuestionComplete(q);
                const isOpen = openIds.includes(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      if (!isOpen) setOpenIds((prev) => [...prev, q.id]);
                      document.getElementById(`question-${q.id}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      });
                    }}
                    className={cn(
                      'shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border',
                      isOpen
                        ? 'bg-chem-forest text-white border-chem-forest shadow-xs'
                        : isComplete
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    )}
                  >
                    <span>Soal {idx + 1}</span>
                    {isComplete ? (
                      <Check className={cn('w-3 h-3', isOpen ? 'text-chem-glow' : 'text-emerald-600')} />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={addQuestion}
                className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-chem-forest hover:bg-chem-glow/40 border border-dashed border-chem-sage/50 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          )}

          {/* Questions Block Editor Cards */}
          <div className="space-y-5">
            {questions.map((question, questionIndex) => {
              const isOpen = openIds.includes(question.id);
              const isComplete = checkQuestionComplete(question);
              const summary = deriveQuestionText(question.sections);
              const hasFormula = question.sections.some((s) => s.type === 'formula');

              return (
                <div
                  key={question.id}
                  id={`question-${question.id}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Question Header Card */}
                  <div className="flex items-center justify-between gap-3 px-5 py-4 bg-slate-50/80 border-b border-slate-200">
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
                      <span className="shrink-0 text-xs font-mono font-bold uppercase tracking-wider text-chem-forest bg-chem-glow/60 border border-chem-sage/30 px-2.5 py-0.5 rounded-full">
                        Soal {questionIndex + 1}
                      </span>
                      <span className="text-xs text-slate-700 font-medium truncate">
                        {summary || '(Belum ada teks soal)'}
                      </span>
                      {hasFormula && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          <FlaskConical className="w-3 h-3 text-emerald-600" />
                          Rumus Kimia
                        </span>
                      )}
                      {!isComplete && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Belum lengkap
                        </span>
                      )}
                    </button>

                    {/* Question Toolbar Actions */}
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
                        title="Duplikat Soal Ini"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Hapus Soal Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Body - Notion Canvas */}
                  {isOpen && (
                    <div className="p-6 space-y-6">
                      {/* Notion Block Canvas for Question & Stimulus */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-chem-forest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Kanvas Blok Soal &amp; Stimulus (Notion)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Susun teks, persamaan kimia, atau gambar secara dinamis
                          </span>
                        </div>

                        {/* Block List with In-between inserters */}
                        <div className="space-y-2">
                          {question.sections.map((section, sectionIndex) => (
                            <div key={section.id} className="space-y-2">
                              {/* In-between Inserter Line on hover */}
                              {sectionIndex > 0 && (
                                <div className="group/inserter relative py-1 flex items-center justify-center">
                                  <div className="w-full border-t border-dashed border-slate-200 group-hover/inserter:border-chem-sage transition-colors" />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setInsertBetweenIndex(
                                        insertBetweenIndex?.qId === question.id &&
                                          insertBetweenIndex?.idx === sectionIndex
                                          ? null
                                          : { qId: question.id, idx: sectionIndex }
                                      )
                                    }
                                    className="absolute opacity-0 group-hover/inserter:opacity-100 transition-opacity bg-white hover:bg-chem-glow/50 text-slate-500 hover:text-chem-forest border border-slate-300 hover:border-chem-sage px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Sisipkan Blok di Sini</span>
                                  </button>

                                  {/* Inserter Popover */}
                                  {insertBetweenIndex?.qId === question.id &&
                                    insertBetweenIndex?.idx === sectionIndex && (
                                      <div className="absolute z-30 top-6 w-80 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl grid grid-cols-1 gap-1 text-xs">
                                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Pilih Jenis Blok:
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setInsertBetweenIndex(null)}
                                            className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                                          >
                                            Tutup
                                          </button>
                                        </div>
                                        {(Object.keys(BLOCK_METAS) as QuizSectionType[]).map((t) => {
                                          const opt = BLOCK_METAS[t];
                                          const OptIcon = opt.icon;
                                          return (
                                            <button
                                              key={t}
                                              type="button"
                                              onClick={() => insertSectionAt(question.id, sectionIndex, t)}
                                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer transition-colors"
                                            >
                                              <span className="w-7 h-7 rounded-lg bg-chem-glow/60 border border-chem-sage/30 text-chem-forest flex items-center justify-center shrink-0">
                                                <OptIcon className="w-3.5 h-3.5" />
                                              </span>
                                              <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs font-bold text-slate-800">
                                                    {opt.label}
                                                  </span>
                                                  {opt.badge && (
                                                    <span className="text-[9px] bg-chem-forest text-white px-1.5 py-0.2 rounded font-mono">
                                                      {opt.badge}
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="text-[10px] text-slate-500 block truncate">
                                                  {opt.hint}
                                                </span>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                </div>
                              )}

                              {/* Section Editor Item */}
                              <QuizSectionEditor
                                section={section}
                                index={sectionIndex}
                                total={question.sections.length}
                                onChange={(next) => updateSection(question.id, sectionIndex, next)}
                                onMove={(dir) => moveSection(question.id, sectionIndex, dir)}
                                onDelete={() => deleteSection(question.id, sectionIndex)}
                                onDuplicate={() => duplicateSection(question.id, sectionIndex)}
                                onInsertBelow={(type) => insertSectionAt(question.id, sectionIndex + 1, type)}
                                onConvertType={(newType) => convertSectionType(question.id, sectionIndex, newType)}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Add Block at Bottom Button & Notion Popover */}
                        <div className="relative pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setAddMenuQuestionId(addMenuQuestionId === question.id ? null : question.id)
                              }
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-chem-sage hover:text-chem-forest hover:bg-chem-glow/30 transition-all cursor-pointer"
                            >
                              <Plus className="w-4 h-4 text-chem-forest" />
                              <span>Tambah Blok Baru</span>
                            </button>

                            {/* Shortcut: Tambah Persamaan Kimia langsung jika belum ada */}
                            {!hasFormula && (
                              <button
                                type="button"
                                onClick={() => addSection(question.id, 'formula')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                              >
                                <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
                                <span>+ Persamaan Kimia</span>
                              </button>
                            )}
                          </div>

                          {/* Notion Add Block Menu Popup */}
                          {addMenuQuestionId === question.id && (
                            <div className="absolute z-30 left-0 mt-2 w-80 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl grid grid-cols-1 gap-1 text-xs">
                              <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-chem-forest">
                                  Pilih Jenis Blok Notion:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setAddMenuQuestionId(null)}
                                  className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                                >
                                  Tutup
                                </button>
                              </div>
                              {(Object.keys(BLOCK_METAS) as QuizSectionType[]).map((t) => {
                                const opt = BLOCK_METAS[t];
                                const OptIcon = opt.icon;
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => addSection(question.id, t)}
                                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer transition-colors"
                                  >
                                    <span className="w-8 h-8 rounded-lg bg-chem-glow/60 border border-chem-sage/30 text-chem-forest flex items-center justify-center shrink-0">
                                      <OptIcon className="w-4 h-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800">
                                          {opt.label}
                                        </span>
                                        {opt.badge && (
                                          <span className="text-[9px] bg-chem-forest text-white px-1.5 py-0.2 rounded font-mono">
                                            {opt.badge}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-500 block truncate">
                                        {opt.hint}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notion Choices Table */}
                      <div className="space-y-3 pt-5 border-t border-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-chem-forest">
                              Pilihan Jawaban
                            </span>
                            {question.correctAnswerIds.length > 1 && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Multi Jawaban Benar ({question.correctAnswerIds.length})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-semibold text-slate-500">
                              Jumlah Opsi:
                            </label>
                            <select
                              value={question.choices.length}
                              onChange={(e) => setChoiceCount(question.id, Number(e.target.value))}
                              className="p-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono cursor-pointer"
                            >
                              {Array.from({ length: MAX_CHOICES - MIN_CHOICES + 1 }, (_, i) => i + MIN_CHOICES).map(
                                (n) => (
                                  <option key={n} value={n}>
                                    {n} opsi
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500">
                          Klik huruf opsi <span className="font-bold text-emerald-700">(A, B, C...)</span> untuk
                          menandai jawaban yang benar. Anda dapat memilih lebih dari satu jika soal bersifat multi-jawaban.
                        </p>

                        <div className="space-y-2">
                          {question.choices.map((choice, choiceIndex) => {
                            const isCorrect = question.correctAnswerIds.includes(choice.id);
                            return (
                              <div
                                key={choice.id}
                                className={cn(
                                  'flex items-center gap-2.5 p-2 rounded-xl border transition-colors',
                                  isCorrect
                                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                                    : 'bg-slate-50 border-slate-200'
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleCorrect(question.id, choice.id)}
                                  className={cn(
                                    'shrink-0 w-8 h-8 rounded-lg border-2 text-xs font-mono font-bold flex items-center justify-center cursor-pointer transition-all',
                                    isCorrect
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                      : 'bg-white border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-700'
                                  )}
                                  title={isCorrect ? 'Klik untuk membatalkan status benar' : 'Klik untuk menandai sebagai jawaban benar'}
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
                                  className="flex-1 text-xs sm:text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage text-slate-800"
                                />
                                <button
                                  type="button"
                                  disabled={question.choices.length <= MIN_CHOICES}
                                  onClick={() => removeChoice(question.id, choiceIndex)}
                                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-25 cursor-pointer"
                                  title="Hapus Opsi Ini"
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
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-chem-forest px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Pilihan Jawaban</span>
                          </button>
                        )}

                        {question.correctAnswerIds.length === 0 && (
                          <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Tandai minimal satu pilihan sebagai jawaban benar sebelum menyimpan paket kuis.</span>
                          </div>
                        )}
                      </div>

                      {/* Explanations & Concept Reinforcement */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-slate-200">
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-chem-forest" />
                            Pembahasan Soal (Wajib)
                          </label>
                          <textarea
                            rows={3}
                            value={question.explanation}
                            onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                            placeholder="Penjelasan komprehensif langkah penyelesaian atau konsep yang diuji..."
                            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none resize-y"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Penjelasan Jika Jawaban Siswa Salah (Opsional)
                          </label>
                          <textarea
                            rows={3}
                            value={question.wrongAnswerExplanation}
                            onChange={(e) =>
                              updateQuestion(question.id, { wrongAnswerExplanation: e.target.value })
                            }
                            placeholder="Petunjuk spesifik saat siswa keliru memilih distractor..."
                            className="w-full p-2.5 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:border-rose-300 focus:outline-none resize-y text-slate-700"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-700">
                            Ringkasan Konsep Penguatan (Opsional)
                          </label>
                          <input
                            type="text"
                            value={question.conceptSummary}
                            onChange={(e) => updateQuestion(question.id, { conceptSummary: e.target.value })}
                            placeholder="Contoh: ΔH = H_produk - H_reaktan < 0 menandakan reaksi eksotermik."
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
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
                <span className="w-12 h-12 rounded-2xl bg-chem-glow/50 border border-chem-sage/30 flex items-center justify-center mx-auto text-chem-forest">
                  <Plus className="w-6 h-6" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">Paket Kuis Masih Kosong</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Mulai dengan menambahkan butir soal pertama. Setiap butir soal dapat berisi teks, rumus kimia, gambar, atau video berbasis blok.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Butir Soal Pertama</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Add Question Button Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white rounded-3xl border border-slate-200 shadow-2xs p-4">
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-chem-glow" />
              <span>Tambah Butir Soal Baru</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAndBack}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Simpan &amp; Kembali ke Bank Soal
              </button>
            </div>
          </div>
        </>
      ) : (
        /* LIVE STUDENT PREVIEW MODE */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-chem-forest bg-chem-glow/60 border border-chem-sage/30 px-2.5 py-0.5 rounded-full">
                  Pratinjau Interaktif Siswa
                </span>
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  {meta.title || 'Paket Kuis Tanpa Judul'}
                </h2>
                <p className="text-xs text-slate-500">
                  Topik: {meta.topic || '-'} · Tingkat: {meta.difficulty} · Durasi: {meta.durationMinutes} Menit
                </p>
              </div>

              {/* Question selector tabs in preview */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewQuestionIndex(idx)}
                    className={cn(
                      'w-8 h-8 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer border',
                      previewQuestionIndex === idx
                        ? 'bg-chem-forest text-white border-chem-forest shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {currentPreviewQ ? (
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Block Viewer renders all blocks including formula, image, youtube, list, callout */}
                <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-chem-forest">
                      Soal #{previewQuestionIndex + 1}
                    </span>
                    {currentPreviewQ.correctAnswerIds.length > 1 && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Pilihan Ganda Kompleks
                      </span>
                    )}
                  </div>

                  <QuizSectionViewer sections={currentPreviewQ.sections} />
                </div>

                {/* Multiple Choices Preview */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Pilih Jawaban:
                  </span>
                  <div className="space-y-2">
                    {currentPreviewQ.choices.map((choice, choiceIdx) => {
                      const selected = (previewSelectedChoices[currentPreviewQ.id] || []).includes(choice.id);
                      const submitted = !!previewSubmitted[currentPreviewQ.id];
                      const isCorrect = currentPreviewQ.correctAnswerIds.includes(choice.id);

                      let style = 'bg-white border-slate-200 hover:border-chem-sage text-slate-800';
                      if (submitted) {
                        if (isCorrect) {
                          style = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400';
                        } else if (selected && !isCorrect) {
                          style = 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-400';
                        } else {
                          style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                        }
                      } else if (selected) {
                        style = 'bg-chem-glow/60 border-chem-forest text-chem-forest ring-2 ring-chem-forest font-semibold';
                      }

                      return (
                        <button
                          key={choice.id}
                          type="button"
                          disabled={submitted}
                          onClick={() => {
                            const cur = previewSelectedChoices[currentPreviewQ.id] || [];
                            const isMulti = currentPreviewQ.correctAnswerIds.length > 1;
                            const next = isMulti
                              ? cur.includes(choice.id)
                                ? cur.filter((id) => id !== choice.id)
                                : [...cur, choice.id]
                              : [choice.id];
                            setPreviewSelectedChoices({
                              ...previewSelectedChoices,
                              [currentPreviewQ.id]: next,
                            });
                          }}
                          className={cn(
                            'w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer',
                            style
                          )}
                        >
                          <span className="w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {String.fromCharCode(65 + choiceIdx)}
                          </span>
                          <span className="text-xs sm:text-sm flex-1 leading-relaxed">
                            {choice.text || `(Pilihan ${String.fromCharCode(65 + choiceIdx)})`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit & Reset Interactive Test */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSubmitted({
                        ...previewSubmitted,
                        [currentPreviewQ.id]: !previewSubmitted[currentPreviewQ.id],
                      });
                    }}
                    disabled={(previewSelectedChoices[currentPreviewQ.id] || []).length === 0}
                    className="px-4 py-2 bg-chem-forest hover:bg-chem-moss disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {previewSubmitted[currentPreviewQ.id] ? 'Coba Jawab Lagi' : 'Kunci & Cek Jawaban'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={previewQuestionIndex === 0}
                      onClick={() => setPreviewQuestionIndex((i) => i - 1)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={previewQuestionIndex === questions.length - 1}
                      onClick={() => setPreviewQuestionIndex((i) => i + 1)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>

                {/* Explanation Reveal in Preview */}
                {previewSubmitted[currentPreviewQ.id] && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-chem-forest block">
                      Pembahasan &amp; Kunci Jawaban
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {currentPreviewQ.explanation || 'Belum ada penjelasan yang ditambahkan.'}
                    </p>
                    {currentPreviewQ.conceptSummary && (
                      <div className="p-3 bg-chem-glow/40 border border-chem-sage/30 rounded-xl">
                        <span className="text-[10px] font-bold text-chem-forest uppercase tracking-wider block mb-0.5">
                          Konsep Penguatan:
                        </span>
                        <p className="text-xs text-slate-800 font-medium">
                          {currentPreviewQ.conceptSummary}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-500 py-10">Belum ada butir soal untuk ditampilkan.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
