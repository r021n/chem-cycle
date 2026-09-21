import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Quiz, Question, QuestionPayload, QuizPayload } from '../../types/quiz';
import { NotionBlockEditor } from '../../components/editor/notion-block-editor';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { useUiStore } from '../../stores/ui-store';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
} from 'lucide-react';

export const QuizEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const isCreate = !id;

  // Inline question editor state
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form states for Quiz Metadata
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [maxAttempts, setMaxAttempts] = useState<number | ''>('');

  // Form states for Question Editor
  const [questionPromptAst, setQuestionPromptAst] = useState<string>('[]');
  const [scoreWeight, setScoreWeight] = useState(10);
  const [explanationText, setExplanationText] = useState('');
  const [options, setOptions] = useState<
    { optionKey: string; content: string; isCorrect: boolean }[]
  >([
    { optionKey: 'A', content: '', isCorrect: true },
    { optionKey: 'B', content: '', isCorrect: false },
    { optionKey: 'C', content: '', isCorrect: false },
    { optionKey: 'D', content: '', isCorrect: false },
    { optionKey: 'E', content: '', isCorrect: false },
  ]);

  // Fetch Quiz Details (edit mode only)
  const { data: quizData, isLoading } = useQuery({
    queryKey: queryKeys.quizzes.detail(id || ''),
    queryFn: () => api.get<{ success: boolean; data: Quiz }>(`/quizzes/${id}`),
    enabled: !!id,
  });

  const quiz = quizData?.data;

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || '');
      setPassingScore(quiz.passingScore || 70);
      setTimeLimit(quiz.timeLimitMinutes || '');
      setMaxAttempts(quiz.maxAttempts || '');
    }
  }, [quiz]);

  const buildMetaPayload = (): QuizPayload => ({
    title: title.trim(),
    passingScore: Number(passingScore) || 70,
    timeLimitMinutes: timeLimit ? Number(timeLimit) : null,
    maxAttempts: maxAttempts ? Number(maxAttempts) : null,
  });

  // Create Quiz Mutation
  const createQuizMutation = useMutation({
    mutationFn: (body: QuizPayload) =>
      api.post<{ success: boolean; data: Quiz }>('/quizzes', { ...body, isPublished: true }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.list });
      addToast('Kuis berhasil dibuat. Silakan tambahkan soal.', 'success');
      navigate(`/latihan/${res.data.id}/edit`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal membuat kuis';
      addToast(msg, 'error');
    },
  });

  // Update Quiz Metadata Mutation
  const updateQuizMutation = useMutation({
    mutationFn: (body: QuizPayload) => api.put(`/quizzes/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(id || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.list });
      addToast('Pengaturan kuis berhasil disimpan', 'success');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal memperbarui kuis';
      addToast(msg, 'error');
    },
  });

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Judul kuis wajib diisi', 'error');
      return;
    }
    if (isCreate) {
      createQuizMutation.mutate(buildMetaPayload());
    } else {
      updateQuizMutation.mutate(buildMetaPayload());
    }
  };

  // Create Question Mutation
  const createQuestionMutation = useMutation({
    mutationFn: (body: QuestionPayload) => api.post(`/quizzes/${id}/questions`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(id || '') });
      addToast('Pertanyaan baru berhasil ditambahkan', 'success');
      setQuestionFormOpen(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal membuat pertanyaan';
      addToast(msg, 'error');
    },
  });

  // Update Question Mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ qId, body }: { qId: string; body: QuestionPayload }) =>
      api.put(`/quizzes/questions/${qId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(id || '') });
      addToast('Soal berhasil diperbarui', 'success');
      setQuestionFormOpen(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal memperbarui soal';
      addToast(msg, 'error');
    },
  });

  // Delete Question Mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (qId: string) => api.delete(`/quizzes/questions/${qId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(id || '') });
      addToast('Soal berhasil dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus soal';
      addToast(msg, 'error');
    },
  });

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQuestionPromptAst(
      JSON.stringify([
        {
          id: `q-${Date.now()}`,
          type: 'paragraph',
          content: [{ type: 'text', text: 'Tuliskan teks pertanyaan soal kimia di sini...' }],
        },
      ])
    );
    setScoreWeight(10);
    setExplanationText('');
    setOptions([
      { optionKey: 'A', content: '', isCorrect: true },
      { optionKey: 'B', content: '', isCorrect: false },
      { optionKey: 'C', content: '', isCorrect: false },
      { optionKey: 'D', content: '', isCorrect: false },
      { optionKey: 'E', content: '', isCorrect: false },
    ]);
  };

  const handleOpenAddQuestion = () => {
    resetQuestionForm();
    setQuestionFormOpen(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQuestionPromptAst(q.promptJson || '[]');
    setScoreWeight(q.scoreWeight || 10);

    let expl = '';
    try {
      if (q.explanationJson) {
        const parsed = JSON.parse(q.explanationJson);
        if (Array.isArray(parsed) && parsed[0]?.content?.[0]?.text) {
          expl = parsed[0].content[0].text;
        }
      }
    } catch {
      expl = '';
    }
    setExplanationText(expl);

    if (q.options && q.options.length > 0) {
      setOptions(
        q.options.map((opt) => ({
          optionKey: opt.optionKey,
          content: opt.content,
          isCorrect: !!opt.isCorrect,
        }))
      );
    } else {
      resetQuestionForm();
      setEditingQuestionId(q.id);
      setQuestionPromptAst(q.promptJson || '[]');
      setScoreWeight(q.scoreWeight || 10);
      setExplanationText(expl);
    }
    setQuestionFormOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    const hasCorrect = options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      addToast('Pilih salah satu opsi sebagai kunci jawaban benar!', 'error');
      return;
    }

    const emptyOption = options.find((o) => !o.content.trim());
    if (emptyOption) {
      addToast(`Teks opsi ${emptyOption.optionKey} belum diisi!`, 'error');
      return;
    }

    const explanationJson = explanationText.trim()
      ? JSON.stringify([
          {
            id: `exp-${Date.now()}`,
            type: 'paragraph',
            content: [{ type: 'text', text: explanationText.trim() }],
          },
        ])
      : null;

    const payload: QuestionPayload = {
      promptJson: questionPromptAst,
      questionType: 'multiple_choice',
      scoreWeight: Number(scoreWeight) || 10,
      explanationJson,
      options: options.map((o) => ({
        optionKey: o.optionKey,
        content: o.content.trim(),
        isCorrect: o.isCorrect,
      })),
    };

    if (editingQuestionId) {
      updateQuestionMutation.mutate({ qId: editingQuestionId, body: payload });
    } else {
      createQuestionMutation.mutate(payload);
    }
  };

  const setCorrectOption = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }))
    );
  };

  if (!isCreate && isLoading) {
    return <Spinner label="Membuka editor kuis..." />;
  }

  if (!isCreate && !quiz) {
    return (
      <div className="border border-slate-200 p-8 text-center bg-white rounded-2xl max-w-lg mx-auto shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Kuis Tidak Ditemukan</h2>
        <Button variant="primary" onClick={() => navigate('/latihan')} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  const questions = quiz?.questions || [];
  const isFormSubmitting =
    createQuestionMutation.isPending || updateQuestionMutation.isPending;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="border border-slate-200 p-6 bg-white rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <Link to="/latihan" className="shrink-0">
            <Button size="sm" variant="outline">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Daftar Kuis
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-indigo-600">
              {isCreate ? 'Pembuatan Kuis Baru' : 'Pengelolaan Kuis & Bank Soal'}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5 truncate">
              {isCreate ? 'Kuis Baru' : quiz?.title}
            </h1>
          </div>
        </div>

        {!isCreate && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button size="sm" variant="primary" onClick={handleOpenAddQuestion}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Soal
            </Button>
          </div>
        )}
      </div>

      {/* Inline Quiz Settings */}
      <form
        onSubmit={handleSaveMetadata}
        className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs space-y-4"
      >
        <div className="border-b border-slate-100 pb-2">
          <h2 className="text-base font-bold text-slate-900">Pengaturan Kuis</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan judul, KKM, batas waktu, dan jumlah percobaan kuis.
          </p>
        </div>

        <Input
          label="Judul Kuis"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Kuis Pemahaman Termokimia"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="KKM Kelulusan"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
          <Input
            label="Waktu Ujian (Menit)"
            type="number"
            min={1}
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Tanpa batas"
          />
          <Input
            label="Maksimal Percobaan"
            type="number"
            min={1}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Tanpa batas"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isCreate ? createQuizMutation.isPending : updateQuizMutation.isPending}
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            {isCreate ? 'Buat Kuis' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>

      {isCreate ? (
        <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center bg-white text-xs text-slate-500">
          Simpan kuis terlebih dahulu untuk mulai menambahkan bank soal.
        </div>
      ) : (
        <>
          {/* Quiz Info Summary Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/70">
              <span className="text-slate-400 block font-medium">Total Soal:</span>
              <span className="font-bold text-sm text-slate-900">{questions.length} Pertanyaan</span>
            </div>
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/70">
              <span className="text-slate-400 block font-medium">Passing Score (KKM):</span>
              <span className="font-bold text-sm text-slate-900">{quiz?.passingScore} Poin</span>
            </div>
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/70">
              <span className="text-slate-400 block font-medium">Waktu Ujian:</span>
              <span className="font-bold text-sm text-slate-900">
                {quiz?.timeLimitMinutes ? `${quiz.timeLimitMinutes} Menit` : 'Tanpa Batas'}
              </span>
            </div>
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/70">
              <span className="text-slate-400 block font-medium">Maksimal Percobaan:</span>
              <span className="font-bold text-sm text-slate-900">
                {quiz?.maxAttempts ? `${quiz.maxAttempts}x` : 'Tanpa Batas'}
              </span>
            </div>
          </div>

          {/* Inline Question Editor */}
          {questionFormOpen && (
            <form
              onSubmit={handleSaveQuestion}
              className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  {editingQuestionId ? 'Edit Soal Kuis' : 'Tambah Soal Kuis Baru'}
                </h2>
                <button
                  type="button"
                  onClick={() => setQuestionFormOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  title="Tutup Form Soal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Isi Pertanyaan (Mendukung Teks, Rumus, dan Gambar):
                </label>
                <NotionBlockEditor
                  key={editingQuestionId || 'new-question'}
                  initialContent={questionPromptAst}
                  onChange={(_b, json) => setQuestionPromptAst(json)}
                />
              </div>

              <div className="w-40">
                <Input
                  label="Bobot Skor Soal"
                  type="number"
                  min={1}
                  required
                  value={scoreWeight}
                  onChange={(e) => setScoreWeight(Number(e.target.value))}
                />
              </div>

              {/* Options Choice Configuration */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-700">
                  Pilihan Jawaban (Tandai tombol huruf untuk kunci jawaban yang benar):
                </label>

                {options.map((opt, i) => (
                  <div key={opt.optionKey} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCorrectOption(i)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shrink-0 ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={opt.isCorrect ? 'Kunci Benar' : 'Klik untuk jadikan Kunci Jawaban'}
                    >
                      {opt.optionKey}
                    </button>

                    <input
                      type="text"
                      required
                      value={opt.content}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOptions((prev) =>
                          prev.map((o, idx) => (idx === i ? { ...o, content: val } : o))
                        );
                      }}
                      placeholder={`Teks pilihan jawaban ${opt.optionKey}...`}
                      className={`w-full min-w-0 bg-white px-3 py-2 text-xs text-slate-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        opt.isCorrect ? 'border-emerald-300 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />

                    <span className="text-[11px] font-medium text-emerald-700 whitespace-nowrap w-[50px] shrink-0">
                      {opt.isCorrect ? '✓ Kunci' : ''}
                    </span>
                  </div>
                ))}
              </div>

              <Textarea
                label="Penjelasan / Pembahasan Soal (Muncul Setelah Siswa Submit)"
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                placeholder="Jelaskan alasan mengapa kunci tersebut benar..."
              />

              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuestionFormOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isFormSubmitting}>
                  <Save className="w-3.5 h-3.5 mr-1" /> Simpan Soal
                </Button>
              </div>
            </form>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900">
                Daftar Soal Kuis ({questions.length})
              </h2>
              <Button size="sm" variant="primary" onClick={handleOpenAddQuestion}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Buat Soal Baru
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center bg-white text-xs text-slate-500">
                Belum ada soal pada kuis ini. Klik tombol "+ Buat Soal Baru" di atas.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="border border-slate-200 p-5 bg-white rounded-2xl shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md whitespace-nowrap">
                        Nomor {idx + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        Bobot: {q.scoreWeight} Poin
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEditQuestion(q)}>
                        Edit Soal
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus soal nomor ${idx + 1}?`)) {
                            deleteQuestionMutation.mutate(q.id);
                          }
                        }}
                        title="Hapus Soal"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prompt Preview */}
                  <div className="py-1">
                    <BlockAstViewer contentJson={q.promptJson} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2.5 text-xs rounded-lg border transition-colors ${
                          opt.isCorrect
                            ? 'border-emerald-200 bg-emerald-50/60 font-medium text-emerald-950 flex items-center justify-between'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0">
                            {opt.optionKey}
                          </span>
                          <span className="truncate">{opt.content}</span>
                        </div>
                        {opt.isCorrect && (
                          <span className="text-[10px] font-semibold bg-emerald-600 text-white px-1.5 py-0.5 rounded shrink-0 ml-2">
                            Kunci
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuizEditorPage;