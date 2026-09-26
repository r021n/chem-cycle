import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  X,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';

export const AdminQuizzesPage: React.FC = () => {
  const {
    quizzes,
    addQuiz,
    deleteQuiz,
    togglePublishQuiz,
  } = useDataStore();
  const navigate = useNavigate();

  const [isPacketEditorOpen, setIsPacketEditorOpen] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

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

  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return quizzes.filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(query) ||
        q.topic.toLowerCase().includes(query) ||
        (q.description || '').toLowerCase().includes(query);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && q.isPublished) ||
        (statusFilter === 'draft' && !q.isPublished);
      return matchSearch && matchStatus;
    });
  }, [quizzes, searchQuery, statusFilter]);

  // Packet Create
  const handleOpenCreatePacket = () => {
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

  const handleSavePacket = (e: React.FormEvent) => {
    e.preventDefault();
    addQuiz({
      ...packetFormData,
      orderIndex: quizzes.length + 1,
      questions: [],
    });
    setIsPacketEditorOpen(false);
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
            Kelola paket latihan soal formatif per topik, tingkat kesulitan, alokasi waktu, dan status publikasi. Penyuntingan butir soal dilakukan pada halaman editor tersendiri.
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

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul paket, topik, atau deskripsi..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            <option value="all">Semua Status Publikasi</option>
            <option value="published">Hanya Terbit (Published)</option>
            <option value="draft">Hanya Draf (Draft)</option>
          </select>
        </div>
      </div>

      {/* 1. TABEL DATA PAKET KUIS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Paket Latihan Soal</th>
                <th className="py-3.5 px-4">Topik</th>
                <th className="py-3.5 px-4">Kesulitan</th>
                <th className="py-3.5 px-4 text-center">Butir Soal</th>
                <th className="py-3.5 px-4">Durasi</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Belum ada paket kuis yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((q) => {
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {q.title}
                          </span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">
                            {q.description || 'Tanpa deskripsi'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {q.topic}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">{q.difficulty}</td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                        {q.questions?.length || 0}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 font-mono text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-chem-sage" />
                          {q.durationMinutes} mnt
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePublishQuiz(q.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            q.isPublished
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {q.isPublished ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Terbit</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>Draf</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/kuis/${q.id}/edit`)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit Butir Soal"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteQuiz(q.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Hapus Paket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Packet Form Modal */}
      {isPacketEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Tambah Paket Kuis Baru
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
    </div>
  );
};
