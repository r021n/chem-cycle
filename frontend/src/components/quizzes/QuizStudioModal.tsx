import React, { useState, useEffect } from 'react';
import { Quiz, QuestionPayload, QuizPayload } from '../../types/quiz';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { useUiStore } from '../../stores/ui-store';

interface FormQuestion {
  id: string;
  prompt: string;
  options: { key: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

interface QuizStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizToEdit?: Quiz | null;
}

export const QuizStudioModal: React.FC<QuizStudioModalProps> = ({
  isOpen,
  onClose,
  quizToEdit,
}) => {
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Daur Biogeokimia Alami');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<FormQuestion[]>([
    {
      id: 'q-1',
      prompt: 'Mengapa gas nitrogen (N₂) di atmosfer bumi tidak dapat langsung diserap oleh sebagian besar makhluk hidup?',
      options: [
        { key: 'A', text: 'Gas nitrogen memiliki kerapatan molekul yang terlalu padat.', isCorrect: false },
        { key: 'B', text: 'Ikatan kovalen rangkap tiga pada molekul N₂ sangat kuat dan stabil.', isCorrect: true },
        { key: 'C', text: 'Konsentrasi gas nitrogen di atmosfer terlalu sedikit.', isCorrect: false },
        { key: 'D', text: 'Nitrogen bersifat racun bagi klorofil daun.', isCorrect: false },
      ],
      explanation: 'Molekul N₂ memiliki ikatan kovalen rangkap tiga (N≡N) dengan energi disosiasi yang sangat tinggi (~945 kJ/mol), sehingga bersifat inert secara kimiawi dan memerlukan bakteri diazotrof berkatalis nitrogenase untuk memecahnya.',
    },
  ]);

  useEffect(() => {
    if (quizToEdit) {
      setTitle(quizToEdit.title);
      setTopic(quizToEdit.description || 'Daur Biogeokimia Alami');
      setDurationMinutes(quizToEdit.timeLimitMinutes || 10);
      setPassingScore(quizToEdit.passingScore || 70);

      if (quizToEdit.questions && quizToEdit.questions.length > 0) {
        const loaded: FormQuestion[] = quizToEdit.questions.map((q, idx) => {
          let promptText = '';
          try {
            const parsed = JSON.parse(q.promptJson);
            promptText = parsed[0]?.content?.[0]?.text || parsed[0]?.text || q.promptJson;
          } catch {
            promptText = q.promptJson;
          }

          let explanationText = '';
          if (q.explanationJson) {
            try {
              const parsed = JSON.parse(q.explanationJson);
              explanationText = parsed[0]?.content?.[0]?.text || q.explanationJson;
            } catch {
              explanationText = q.explanationJson;
            }
          }

          return {
            id: q.id || `q-${idx}`,
            prompt: promptText,
            options: (q.options || []).map((o, optIdx) => ({
              key: o.optionKey || ['A', 'B', 'C', 'D'][optIdx] || 'A',
              text: o.content,
              isCorrect: !!o.isCorrect,
            })),
            explanation: explanationText,
          };
        });
        setQuestions(loaded);
      }
    } else {
      setTitle('');
      setTopic('Daur Biogeokimia Alami');
      setDurationMinutes(10);
      setPassingScore(70);
      setQuestions([
        {
          id: `q-${Date.now()}`,
          prompt: 'Mengapa gas nitrogen (N₂) di atmosfer bumi tidak dapat langsung diserap oleh sebagian besar tumbuhan?',
          options: [
            { key: 'A', text: 'Gas nitrogen memiliki kerapatan molekul yang terlalu padat.', isCorrect: false },
            { key: 'B', text: 'Ikatan kovalen rangkap tiga pada molekul N₂ sangat kuat dan stabil.', isCorrect: true },
            { key: 'C', text: 'Konsentrasi gas nitrogen di udara terlalu tipis.', isCorrect: false },
            { key: 'D', text: 'Nitrogen merusak struktur dinding sel tumbuhan.', isCorrect: false },
          ],
          explanation: 'Ikatan rangkap tiga N≡N sangat kuat (~945 kJ/mol) sehingga membutuhkan enzim nitrogenase dari bakteri fiksasi untuk memecahnya menjadi bentuk amonia/nitrat.',
        },
      ]);
    }
  }, [quizToEdit, isOpen]);

  const addQuestion = () => {
    const nextQ: FormQuestion = {
      id: `q-${Date.now()}`,
      prompt: 'Tuliskan pertanyaan konsep kuis baru...',
      options: [
        { key: 'A', text: 'Pilihan jawaban A', isCorrect: true },
        { key: 'B', text: 'Pilihan jawaban B', isCorrect: false },
        { key: 'C', text: 'Pilihan jawaban C', isCorrect: false },
        { key: 'D', text: 'Pilihan jawaban D', isCorrect: false },
      ],
      explanation: 'Penjelasan konsep ilmiah mengenai jawaban yang tepat...',
    };
    setQuestions((prev) => [...prev, nextQ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const setCorrectOption = (qIdx: number, optKey: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: q.options.map((opt) => ({
            ...opt,
            isCorrect: opt.key === optKey,
          })),
        };
      })
    );
  };

  const updateQuestionPrompt = (qIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, prompt: text } : q))
    );
  };

  const updateOptionText = (qIdx: number, optKey: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: q.options.map((opt) => (opt.key === optKey ? { ...opt, text } : opt)),
        };
      })
    );
  };

  const updateExplanation = (qIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, explanation: text } : q))
    );
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Judul kuis wajib diisi');

      const quizPayload: QuizPayload = {
        title: title.trim(),
        description: topic.trim(),
        passingScore,
        timeLimitMinutes: durationMinutes,
        isPublished: true,
      };

      let quizId = quizToEdit?.id;

      if (quizToEdit) {
        await api.put(`/quizzes/${quizToEdit.id}`, quizPayload);
      } else {
        const res = await api.post<{ success: boolean; data: Quiz }>('/quizzes', quizPayload);
        quizId = res.data.id;
      }

      if (!quizId) throw new Error('Gagal menginisiasi ID kuis');

      // Save each question
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const promptJson = JSON.stringify([
          {
            id: `blk-p-${i}`,
            type: 'paragraph',
            content: [{ type: 'text', text: q.prompt }],
          },
        ]);

        const explanationJson = q.explanation
          ? JSON.stringify([
              {
                id: `blk-exp-${i}`,
                type: 'paragraph',
                content: [{ type: 'text', text: q.explanation }],
              },
            ])
          : null;

        const qPayload: QuestionPayload = {
          promptJson,
          explanationJson,
          questionType: 'multiple_choice',
          scoreWeight: Math.round(100 / Math.max(1, questions.length)),
          options: q.options.map((opt) => ({
            optionKey: opt.key,
            content: opt.text,
            isCorrect: opt.isCorrect,
          })),
        };

        if (quizToEdit && quizToEdit.questions?.[i]) {
          await api.put(`/quizzes/questions/${quizToEdit.questions[i].id}`, qPayload);
        } else {
          await api.post(`/quizzes/${quizId}/questions`, qPayload);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.list });
      addToast(
        quizToEdit ? 'Kuis dan butir soal berhasil diperbarui' : 'Kuis baru berhasil dibuat dan diterbitkan',
        'success'
      );
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : (err as Error).message || 'Gagal menyimpan kuis';
      addToast(msg, 'error');
    },
  });

  if (!isOpen) return null;

  return (
    <div
      id="notionQuizEditorModal"
      className="fixed inset-0 z-50 bg-chem-dark/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 font-sans"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-float flex flex-col overflow-hidden border border-chem-border">
        {/* Top Bar */}
        <div className="px-6 py-3 border-b border-chem-border flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-chem-ash">
            <i className="fa-solid fa-clipboard-question text-chem-sage"></i>
            <span className="font-serif italic text-chem-dark text-sm">Studio Editor Kuis</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="px-4 py-1.5 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className="fa-solid fa-check text-[10px]"></i>
              <span>{saveMutation.isPending ? 'Menyimpan...' : 'Simpan Kuis'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-chem-ash hover:text-chem-dark rounded-lg cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-6">
          {/* Metadata */}
          <div className="space-y-3">
            <input
              type="text"
              id="quizFormTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Kuis Siklus..."
              className="w-full font-serif text-2xl text-chem-dark border-none outline-none focus:ring-0 px-0 bg-transparent placeholder:text-chem-ash/40"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-sans text-chem-ash uppercase mb-1">
                  Topik Daur
                </label>
                <input
                  type="text"
                  id="quizFormTopic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-chem-subtle/70 border border-chem-border rounded-xl focus:outline-none focus:border-chem-sage"
                />
              </div>
              <div>
                <label className="block text-[11px] font-sans text-chem-ash uppercase mb-1">
                  Estimasi Durasi (Menit)
                </label>
                <input
                  type="number"
                  id="quizFormDuration"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-chem-subtle/70 border border-chem-border rounded-xl focus:outline-none focus:border-chem-sage"
                />
              </div>
              <div>
                <label className="block text-[11px] font-sans text-chem-ash uppercase mb-1">
                  KKM Kelulusan
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-chem-subtle/70 border border-chem-border rounded-xl focus:outline-none focus:border-chem-sage"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Questions List */}
          <div className="pt-4 border-t border-chem-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-chem-ash">
                Daftar Soal Multi-Konten ({questions.length})
              </span>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1.5 bg-chem-subtle hover:bg-chem-glow/70 text-chem-dark text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Tambah Butir Soal</span>
              </button>
            </div>

            <div id="quizFormQuestionsList" className="space-y-5">
              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-5 bg-chem-paper rounded-2xl border border-chem-border space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-chem-forest uppercase tracking-wide">
                      Nomor Butir #{qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="text-xs text-chem-ash hover:text-rose-600 transition-colors p-1"
                        title="Hapus Soal"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    )}
                  </div>

                  {/* Prompt Textarea */}
                  <div>
                    <label className="block text-[11px] text-chem-ash uppercase mb-1 font-medium">
                      Pertanyaan Inti
                    </label>
                    <textarea
                      rows={2}
                      value={q.prompt}
                      onChange={(e) => updateQuestionPrompt(qIdx, e.target.value)}
                      placeholder="Tuliskan butir pertanyaan kuis..."
                      className="w-full text-xs text-chem-dark bg-white p-3 border border-chem-border rounded-xl focus:outline-none focus:border-chem-sage resize-y"
                    />
                  </div>

                  {/* 4 Choices */}
                  <div className="space-y-2">
                    <span className="block text-[11px] text-chem-ash uppercase mb-1 font-medium">
                      Opsi Pilihan Ganda & Kunci Jawaban (Pilih Lingkaran untuk Kunci Benar):
                    </span>

                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                          opt.isCorrect
                            ? 'border-chem-sage bg-chem-glow/30'
                            : 'border-chem-border bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCorrectOption(qIdx, opt.key)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                            opt.isCorrect
                              ? 'bg-chem-sage text-white'
                              : 'bg-chem-subtle text-chem-dark hover:bg-chem-glow/50'
                          }`}
                          title={`Jadikan kunci ${opt.key}`}
                        >
                          {opt.key}
                        </button>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOptionText(qIdx, opt.key, e.target.value)}
                          placeholder={`Teks pilihan ${opt.key}...`}
                          className="w-full text-xs text-chem-dark bg-transparent border-none outline-none px-1"
                        />

                        {opt.isCorrect && (
                          <span className="text-[10px] font-bold uppercase text-chem-forest bg-chem-glow px-2 py-0.5 rounded-full shrink-0">
                            Kunci Benar
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Scientific Explanation */}
                  <div>
                    <label className="block text-[11px] text-chem-ash uppercase mb-1 font-medium">
                      Pembahasan Konsep Ilmiah (Explanation)
                    </label>
                    <textarea
                      rows={2}
                      value={q.explanation}
                      onChange={(e) => updateExplanation(qIdx, e.target.value)}
                      placeholder="Jelaskan alasan ilmiah mengapa kunci jawaban tersebut benar..."
                      className="w-full text-xs text-chem-dark bg-white p-3 border border-chem-border rounded-xl focus:outline-none focus:border-chem-sage resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
