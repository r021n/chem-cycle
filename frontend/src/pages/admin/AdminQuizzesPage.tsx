import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { QuizPackage, QuizQuestion, QuizChoice } from '../../types/app';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Clock,
  HelpCircle,
  X,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { ChemFormula } from '../../components/common/ChemFormula';

export const AdminQuizzesPage: React.FC = () => {
  const {
    quizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    togglePublishQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
  } = useDataStore();

  const [isPacketEditorOpen, setIsPacketEditorOpen] = useState(false);
  const [editingPacketId, setEditingPacketId] = useState<string | null>(null);

  // Selected Quiz to manage question items
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(quizzes[0]?.id || null);

  // Question Item Builder Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Packet Form State
  const [packetFormData, setPacketFormData] = useState<{
    title: string;
    topic: string;
    description: string;
    durationMinutes: number;
    difficulty: 'Dasar' | 'Menengah' | 'Lanjutan';
    isPublished: boolean;
  }>({
    title: '',
    topic: 'Termokimia',
    description: '',
    durationMinutes: 15,
    difficulty: 'Menengah',
    isPublished: true,
  });

  // Question Form State
  const [questionFormData, setQuestionFormData] = useState<{
    questionText: string;
    chemicalFormula: string;
    stimulusImage: string;
    choices: QuizChoice[];
    correctAnswerId: string;
    explanation: string;
    conceptSummary: string;
  }>({
    questionText: '',
    chemicalFormula: '',
    stimulusImage: '',
    choices: [
      { id: 'opt-a', text: 'Pilihan Jawaban A' },
      { id: 'opt-b', text: 'Pilihan Jawaban B' },
      { id: 'opt-c', text: 'Pilihan Jawaban C' },
      { id: 'opt-d', text: 'Pilihan Jawaban D' },
    ],
    correctAnswerId: 'opt-a',
    explanation: '',
    conceptSummary: '',
  });

  const activeQuiz = quizzes.find((q) => q.id === selectedQuizId);

  // Packet Create/Edit
  const handleOpenCreatePacket = () => {
    setEditingPacketId(null);
    setPacketFormData({
      title: '',
      topic: 'Termokimia',
      description: '',
      durationMinutes: 15,
      difficulty: 'Menengah',
      isPublished: true,
    });
    setIsPacketEditorOpen(true);
  };

  const handleOpenEditPacket = (q: QuizPackage) => {
    setEditingPacketId(q.id);
    setPacketFormData({
      title: q.title,
      topic: q.topic,
      description: q.description,
      durationMinutes: q.durationMinutes,
      difficulty: q.difficulty,
      isPublished: q.isPublished,
    });
    setIsPacketEditorOpen(true);
  };

  const handleSavePacket = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPacketId) {
      updateQuiz(editingPacketId, packetFormData);
    } else {
      const created = addQuiz({
        ...packetFormData,
        orderIndex: quizzes.length + 1,
        questions: [],
      });
      setSelectedQuizId(created.id);
    }
    setIsPacketEditorOpen(false);
  };

  // Question Create/Edit
  const handleOpenCreateQuestion = () => {
    if (!selectedQuizId) return;
    setEditingQuestionId(null);
    setQuestionFormData({
      questionText: '',
      chemicalFormula: '',
      stimulusImage: '',
      choices: [
        { id: 'opt-a', text: 'Pilihan A' },
        { id: 'opt-b', text: 'Pilihan B' },
        { id: 'opt-c', text: 'Pilihan C' },
        { id: 'opt-d', text: 'Pilihan D' },
      ],
      correctAnswerId: 'opt-a',
      explanation: 'Uraikan langkah penyelesaian dan analisis konsep di sini...',
      conceptSummary: 'Ringkasan hukum atau prinsip utama yang diuji...',
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (qn: QuizQuestion) => {
    setEditingQuestionId(qn.id);
    setQuestionFormData({
      questionText: qn.questionText,
      chemicalFormula: qn.chemicalFormula || '',
      stimulusImage: qn.stimulusImage || '',
      choices: JSON.parse(JSON.stringify(qn.choices)),
      correctAnswerId: qn.correctAnswerId,
      explanation: qn.explanation,
      conceptSummary: qn.conceptSummary,
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    if (editingQuestionId) {
      updateQuestion(selectedQuizId, editingQuestionId, questionFormData);
    } else {
      addQuestion(selectedQuizId, questionFormData);
    }
    setIsQuestionModalOpen(false);
  };

  const handleAddChoice = () => {
    const nextLetter = String.fromCharCode(97 + questionFormData.choices.length);
    const newChoiceId = `opt-${nextLetter}`;
    setQuestionFormData((prev) => ({
      ...prev,
      choices: [...prev.choices, { id: newChoiceId, text: `Pilihan ${nextLetter.toUpperCase()}` }],
    }));
  };

  const handleRemoveChoice = (choiceId: string) => {
    if (questionFormData.choices.length <= 2) return;
    setQuestionFormData((prev) => {
      const filtered = prev.choices.filter((c) => c.id !== choiceId);
      const newCorrect =
        prev.correctAnswerId === choiceId ? filtered[0]?.id || 'opt-a' : prev.correctAnswerId;
      return { ...prev, choices: filtered, correctAnswerId: newCorrect };
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Add Packet Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Manajemen Latihan Soal & Bank Soal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola paket latihan soal formatif per topik, stimulus soal, opsi pilihan berganda, dan penjelasan konsep umpan balik instan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreatePacket}
          className="px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-chem-glow" />
          <span>Tambah Paket Kuis Baru</span>
        </button>
      </div>

      {/* Main Grid: Quiz Packet Selector & Question Item Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List of Quiz Packages (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-chem-forest">
              Daftar Paket Kuis ({quizzes.length})
            </span>
          </div>

          <div className="space-y-3">
            {quizzes.map((q) => {
              const isSelected = selectedQuizId === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuizId(q.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-white border-chem-forest ring-2 ring-chem-forest/20 shadow-subtle'
                      : 'bg-white/80 border-slate-200 hover:border-chem-sage hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {q.topic}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {q.difficulty}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-slate-900 leading-snug">
                        {q.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditPacket(q);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                        title="Edit Info Paket"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuiz(q.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-chem-sage" />
                      <strong>{q.questions?.length || 0}</strong> butir soal
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-chem-sage" />
                      {q.durationMinutes} menit
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePublishQuiz(q.id);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        q.isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {q.isPublished ? 'Terbit' : 'Draf'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Question Item Builder for Active Quiz (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          {activeQuiz ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono font-bold text-chem-sage uppercase">
                    Manajemen Butir Soal Terpilih
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                    {activeQuiz.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateQuestion}
                  className="px-3.5 py-2 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-chem-glow" />
                  <span>Tambah Butir Soal</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {(!activeQuiz.questions || activeQuiz.questions.length === 0) ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <HelpCircle className="w-8 h-8 mx-auto opacity-50" />
                    <p className="text-xs">Belum ada butir soal pada paket latihan ini.</p>
                  </div>
                ) : (
                  activeQuiz.questions.map((qn, idx) => (
                    <div
                      key={qn.id}
                      className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-chem-forest bg-chem-glow px-2 py-0.5 rounded">
                            Soal No. {idx + 1}
                          </span>
                          <p className="text-xs font-semibold text-slate-900 leading-snug">
                            {qn.questionText}
                          </p>
                          {qn.chemicalFormula && (
                            <ChemFormula formula={qn.chemicalFormula} className="text-xs font-bold" />
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => duplicateQuestion(activeQuiz.id, qn.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                            title="Duplikasi Soal"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(qn)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg cursor-pointer"
                            title="Edit Soal"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteQuestion(activeQuiz.id, qn.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg cursor-pointer"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Choices badges */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {qn.choices.map((c) => {
                          const isCorrect = c.id === qn.correctAnswerId;
                          return (
                            <div
                              key={c.id}
                              className={`p-2 rounded-xl text-[11px] flex items-center justify-between gap-2 border ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="truncate">
                                {c.id.replace('opt-', '').toUpperCase()}. {c.text}
                              </span>
                              {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Concept summary hint */}
                      <div className="p-2.5 bg-chem-subtle rounded-xl text-[11px] text-chem-ash border border-chem-border flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <strong>Penguatan Konsep:</strong> {qn.conceptSummary}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">
              Pilih paket kuis di kolom sebelah kiri untuk mengelola butir soal.
            </div>
          )}
        </div>
      </div>

      {/* Packet Form Modal */}
      {isPacketEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                {editingPacketId ? 'Edit Paket Kuis' : 'Tambah Paket Kuis Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPacketEditorOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePacket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Paket Latihan Soal</label>
                <input
                  type="text"
                  required
                  value={packetFormData.title}
                  onChange={(e) => setPacketFormData({ ...packetFormData, title: e.target.value })}
                  placeholder="e.g. Evaluasi Mandiri: Termokimia"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Topik Pembelajaran</label>
                  <input
                    type="text"
                    required
                    value={packetFormData.topic}
                    onChange={(e) => setPacketFormData({ ...packetFormData, topic: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tingkat Kesulitan</label>
                  <select
                    value={packetFormData.difficulty}
                    onChange={(e) => setPacketFormData({ ...packetFormData, difficulty: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="Dasar">Dasar</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Lanjutan">Lanjutan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Alokasi Waktu Pengerjaan (Menit)</label>
                <input
                  type="number"
                  min="5"
                  value={packetFormData.durationMinutes}
                  onChange={(e) => setPacketFormData({ ...packetFormData, durationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Deskripsi Paket Soal</label>
                <textarea
                  rows={2}
                  value={packetFormData.description}
                  onChange={(e) => setPacketFormData({ ...packetFormData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPacketEditorOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Item Builder Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in">
            <div className="px-6 py-4 bg-chem-dark text-white flex items-center justify-between shrink-0">
              <h3 className="font-serif text-lg font-bold">
                {editingQuestionId ? 'Edit Butir Soal' : 'Tambah Butir Soal Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Narasi / Teks Soal</label>
                <textarea
                  rows={3}
                  required
                  value={questionFormData.questionText}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })}
                  placeholder="Tuliskan stimulus narasi atau pertanyaan..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Rumus Kimia (Opsional)</label>
                  <input
                    type="text"
                    value={questionFormData.chemicalFormula}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, chemicalFormula: e.target.value })}
                    placeholder="e.g. CH4 + 2O2 -> CO2 + 2H2O"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">URL Gambar Stimulus (Opsional)</label>
                  <input
                    type="url"
                    value={questionFormData.stimulusImage}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, stimulusImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Choice Manager */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-chem-forest">
                    Choice Manager (Pilihan Jawaban & Kunci Benar)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddChoice}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Opsi</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {questionFormData.choices.map((c, cIdx) => {
                    const isCorrect = questionFormData.correctAnswerId === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                          isCorrect ? 'bg-emerald-50/80 border-emerald-400' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctChoice"
                          checked={isCorrect}
                          onChange={() => setQuestionFormData({ ...questionFormData, correctAnswerId: c.id })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Tandai sebagai Kunci Jawaban Benar"
                        />

                        <span className="font-mono font-bold text-slate-600 w-5">
                          {c.id.replace('opt-', '').toUpperCase()}.
                        </span>

                        <input
                          type="text"
                          required
                          value={c.text}
                          onChange={(e) => {
                            const copy = [...questionFormData.choices];
                            copy[cIdx].text = e.target.value;
                            setQuestionFormData({ ...questionFormData, choices: copy });
                          }}
                          className="flex-1 p-2 bg-white border border-slate-300 rounded-xl focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(c.id)}
                          disabled={questionFormData.choices.length <= 2}
                          className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                          title="Hapus Opsi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation Editor */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="font-bold uppercase tracking-wider text-chem-forest block">
                  Explanation Editor (Penjelasan Kunci & Penguatan Konsep)
                </span>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Pembahasan Menyeluruh</label>
                  <textarea
                    rows={3}
                    required
                    value={questionFormData.explanation}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Rangkuman Penguatan Konsep (Instant Feedback)</label>
                  <input
                    type="text"
                    required
                    value={questionFormData.conceptSummary}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, conceptSummary: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
