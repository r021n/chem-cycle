import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { ActivityModule, WorksheetQuestion, ActivityCategory } from '../../types/app';
import {
  FlaskConical,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';

export const AdminActivitiesPage: React.FC = () => {
  const { activities, addActivity, updateActivity, deleteActivity, togglePublishActivity } = useDataStore();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    topicRelation: string;
    category: ActivityCategory;
    summary: string;
    estimatedTime: number;
    orderIndex: number;
    isPublished: boolean;
    phenomenonTitle: string;
    phenomenonNarrative: string;
    phenomenonImageUrl: string;
    triggerQuestions: string[];
    simulatorType: 'carbon_cycle_simulator' | 'reaction_kinetics' | 'equilibrium_shift' | 'embed_iframe';
    embedUrl: string;
    worksheet: WorksheetQuestion[];
  }>({
    title: '',
    topicRelation: 'termokimia-siklus-energi',
    category: 'simulasi',
    summary: '',
    estimatedTime: 20,
    orderIndex: 1,
    isPublished: true,
    phenomenonTitle: '',
    phenomenonNarrative: '',
    phenomenonImageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1200&q=80',
    triggerQuestions: [''],
    simulatorType: 'carbon_cycle_simulator',
    embedUrl: '',
    worksheet: [],
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      topicRelation: 'termokimia-siklus-energi',
      category: 'simulasi',
      summary: '',
      estimatedTime: 20,
      orderIndex: activities.length + 1,
      isPublished: true,
      phenomenonTitle: 'Fenomena Lingkungan Baru',
      phenomenonNarrative: 'Uraikan latar belakang fenomena yang memantik nalar peserta didik...',
      phenomenonImageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1200&q=80',
      triggerQuestions: ['Bagaimana variabel tersebut mempengaruhi laju transformasi sistem?'],
      simulatorType: 'carbon_cycle_simulator',
      embedUrl: '',
      worksheet: [
        {
          id: `wq-${Date.now()}`,
          prompt: '1. Berdasarkan simulasi, jelaskan korelasi antar variabel yang Anda temukan!',
          placeholder: 'Tuliskan hasil analisis Anda...',
          sampleExpectedInsight: 'Peserta didik menganalisis hubungan sebab-akibat...',
        },
      ],
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (act: ActivityModule) => {
    setEditingId(act.id);
    setFormData({
      title: act.title,
      topicRelation: act.topicRelation,
      category: act.category,
      summary: act.summary,
      estimatedTime: act.estimatedTime,
      orderIndex: act.orderIndex,
      isPublished: act.isPublished,
      phenomenonTitle: act.phenomenonIntro.title,
      phenomenonNarrative: act.phenomenonIntro.narrative,
      phenomenonImageUrl: act.phenomenonIntro.imageUrl || '',
      triggerQuestions: act.phenomenonIntro.triggerQuestions ? [...act.phenomenonIntro.triggerQuestions] : [''],
      simulatorType: act.interactiveModule.type,
      embedUrl: act.interactiveModule.embedUrl || '',
      worksheet: act.worksheet ? JSON.parse(JSON.stringify(act.worksheet)) : [],
    });
    setIsEditorOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      topicRelation: formData.topicRelation,
      category: formData.category,
      summary: formData.summary,
      estimatedTime: Number(formData.estimatedTime),
      orderIndex: Number(formData.orderIndex),
      isPublished: formData.isPublished,
      phenomenonIntro: {
        title: formData.phenomenonTitle,
        narrative: formData.phenomenonNarrative,
        triggerQuestions: formData.triggerQuestions.filter((q) => q.trim().length > 0),
        imageUrl: formData.phenomenonImageUrl,
      },
      interactiveModule: {
        type: formData.simulatorType,
        title: formData.title,
        description: formData.summary,
        embedUrl: formData.embedUrl,
      },
      worksheet: formData.worksheet,
    };

    if (editingId) {
      updateActivity(editingId, payload);
    } else {
      addActivity(payload);
    }
    setIsEditorOpen(false);
  };

  // Worksheet Builder Helpers
  const addWorksheetQuestion = () => {
    const newQ: WorksheetQuestion = {
      id: `wq-${Date.now()}`,
      prompt: 'Pertanyaan analisis baru...',
      placeholder: 'Tuliskan analisis...',
      sampleExpectedInsight: 'Wawasan yang diharapkan...',
    };
    setFormData((prev) => ({ ...prev, worksheet: [...prev.worksheet, newQ] }));
  };

  const removeWorksheetQuestion = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      worksheet: prev.worksheet.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Manajemen Modul Aktivitas & Simulasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi modul laboratorium interaktif, narasi fenomena kontekstual, dan pembangun lembar kerja refleksi siswa.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-chem-glow" />
          <span>Tambah Modul Aktivitas Baru</span>
        </button>
      </div>

      {/* 1. TABEL DATA AKTIVITAS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Modul Aktivitas</th>
                <th className="py-3.5 px-4">Simulasi Interaktif</th>
                <th className="py-3.5 px-4">Durasi</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-slate-900 block line-clamp-1">{act.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {act.worksheet?.length || 0} Butir Pertanyaan Lembar Kerja
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {act.interactiveModule.type}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {act.estimatedTime} mnt
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => togglePublishActivity(act.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                        act.isPublished
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {act.isPublished ? (
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
                        onClick={() => handleOpenEdit(act)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Edit Modul"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(act.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Hapus Modul"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. FORM EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 bg-chem-dark text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-chem-mint" />
                <h3 className="font-serif text-lg font-bold">
                  {editingId ? 'Edit Modul Aktivitas' : 'Buat Modul Aktivitas Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Metadata */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-chem-forest block border-b border-slate-200 pb-1">
                  1. Informasi Pokok Aktivitas
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Judul Aktivitas</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Tipe / Kategori</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                    >
                      <option value="simulasi">Pemodelan Interaktif</option>
                      <option value="studi_kasus">Studi Kasus Kontekstual</option>
                      <option value="analisis_data">Analisis Data Oseanografi</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Estimasi Durasi (Menit)</label>
                  <input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Ringkasan Lingkup Eksplorasi</label>
                  <textarea
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Narasi Fenomena & Trigger questions */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-chem-forest block">
                  2. Narasi Fenomena Pemantik & Studi Kasus
                </span>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Judul Fenomena</label>
                  <input
                    type="text"
                    value={formData.phenomenonTitle}
                    onChange={(e) => setFormData({ ...formData, phenomenonTitle: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Narasi Lengkap Fenomena</label>
                  <textarea
                    rows={3}
                    value={formData.phenomenonNarrative}
                    onChange={(e) => setFormData({ ...formData, phenomenonNarrative: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Media & Simulator Configuration */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-chem-forest block">
                  3. Konfigurasi Modul Simulasi / Media Embed
                </span>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tipe Modul Laboratorium Interaktif</label>
                  <select
                    value={formData.simulatorType}
                    onChange={(e) => setFormData({ ...formData, simulatorType: e.target.value as any })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="carbon_cycle_simulator">Simulator Dinamika Siklus Karbon (Bawaan)</option>
                    <option value="reaction_kinetics">Simulator Kinetika Reaksi & Suhu (Bawaan)</option>
                    <option value="equilibrium_shift">Simulator Kesetimbangan Ion Karbonat Laut (Bawaan)</option>
                    <option value="embed_iframe">Embed Eksternal via iFrame</option>
                  </select>
                </div>

                {formData.simulatorType === 'embed_iframe' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">URL iFrame Simulasi Eksternal</label>
                    <input
                      type="url"
                      value={formData.embedUrl}
                      onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Worksheet Builder */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-chem-forest">
                    4. Worksheet Builder (Lembar Pertanyaan Analisis Peserta Didik)
                  </span>
                  <button
                    type="button"
                    onClick={addWorksheetQuestion}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Butir Pertanyaan</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.worksheet.map((item, qIdx) => (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Pertanyaan #{qIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeWorksheetQuestion(qIdx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.prompt}
                        onChange={(e) => {
                          const copy = [...formData.worksheet];
                          copy[qIdx].prompt = e.target.value;
                          setFormData({ ...formData, worksheet: copy });
                        }}
                        placeholder="Kalimat pertanyaan analisis..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />

                      <textarea
                        rows={2}
                        value={item.sampleExpectedInsight}
                        onChange={(e) => {
                          const copy = [...formData.worksheet];
                          copy[qIdx].sampleExpectedInsight = e.target.value;
                          setFormData({ ...formData, worksheet: copy });
                        }}
                        placeholder="Kunci wawasan ilmiah yang diharapkan..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-emerald-950"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Publikasi & Submit */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-chem-forest cursor-pointer"
                  />
                  <span>Publikasikan Modul Aktivitas Segera</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {editingId ? 'Simpan Perubahan' : 'Buat Modul Aktivitas'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-slate-900">Konfirmasi Hapus Aktivitas?</h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan menghapus modul aktivitas dan butir lembar kerja terkait secara permanen.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteActivity(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
