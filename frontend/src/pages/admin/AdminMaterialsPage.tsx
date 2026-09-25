import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { ExtendedMaterial, PracticeExample } from '../../types/app';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  MoveUp,
  MoveDown,
  X,
  BookOpen,
} from 'lucide-react';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';

export const AdminMaterialsPage: React.FC = () => {
  const {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    togglePublishMaterial,
    reorderMaterials,
  } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<ExtendedMaterial | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    category: string;
    summary: string;
    coverUrl: string;
    estimatedReadTime: number;
    orderIndex: number;
    isPublished: boolean;
    learningObjectives: string[];
    contentRawText: string;
    contextualTitle: string;
    contextualTag: string;
    contextualContent: string;
    contextualImpact: string;
    contextualSdg: number;
    practiceExamples: PracticeExample[];
  }>({
    title: '',
    slug: '',
    category: 'Termokimia',
    summary: '',
    coverUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    estimatedReadTime: 7,
    orderIndex: 1,
    isPublished: true,
    learningObjectives: [''],
    contentRawText: 'Tuliskan teks modul materi di sini...',
    contextualTitle: 'Studi Kasus Hijau Industri',
    contextualTag: 'Teknologi Kimia Hijau',
    contextualContent: 'Penjelasan penerapan nyata konsep di industri sirkular...',
    contextualImpact: 'Mendukung prinsip efisiensi energi dan reduksi emisi...',
    contextualSdg: 12,
    practiceExamples: [],
  });

  // Extract categories
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(materials.map((m) => m.category)))];
  }, [materials]);

  // Filtered & sorted materials
  const sortedMaterials = useMemo(() => {
    return [...materials].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return sortedMaterials.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && m.isPublished) ||
        (statusFilter === 'draft' && !m.isPublished);
      const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [sortedMaterials, searchQuery, statusFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Termokimia',
      summary: '',
      coverUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
      estimatedReadTime: 8,
      orderIndex: materials.length + 1,
      isPublished: true,
      learningObjectives: ['Menguasai konsep dasar materi secara komprehensif.'],
      contentRawText: 'Tuliskan teks modul materi di sini...',
      contextualTitle: 'Penerapan di Industri Sirkular Modern',
      contextualTag: 'Kimia Hijau',
      contextualContent: 'Uraikan implementasi konsep pada penanganan limbah atau efisiensi energi...',
      contextualImpact: 'Mendukung target emisi rendah dan SDG 12...',
      contextualSdg: 12,
      practiceExamples: [
        {
          id: 'ex-new-1',
          question: 'Contoh soal penerapan konsep materi...',
          chemicalFormula: '2H2 + O2 -> 2H2O',
          contextHint: 'Gunakan hukum kekekalan massa dan energi.',
          solutionSteps: ['Langkah 1: Tuliskan persamaan reaksi setara.', 'Langkah 2: Hitung nilai kuantitatif.'],
          finalAnswer: 'Hasil akhir terverifikasi.',
        },
      ],
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (m: ExtendedMaterial) => {
    setEditingId(m.id);
    let rawText = '';
    if (typeof m.contentJson === 'string') {
      rawText = m.contentJson;
    } else if (Array.isArray(m.contentJson)) {
      rawText = m.contentJson
        .map((b) => b.content?.map((c) => c.text).join('') || '')
        .join('\n\n');
    }

    setFormData({
      title: m.title,
      slug: m.slug,
      category: m.category,
      summary: m.summary || '',
      coverUrl: m.coverUrl || '',
      estimatedReadTime: m.estimatedReadTime || 5,
      orderIndex: m.orderIndex,
      isPublished: m.isPublished,
      learningObjectives: m.learningObjectives && m.learningObjectives.length > 0 ? [...m.learningObjectives] : [''],
      contentRawText: rawText || '',
      contextualTitle: m.contextualSection?.title || '',
      contextualTag: m.contextualSection?.caseStudyTag || '',
      contextualContent: m.contextualSection?.content || '',
      contextualImpact: m.contextualSection?.impactHighlight || '',
      contextualSdg: m.contextualSection?.relatedSdg || 12,
      practiceExamples: m.practiceExamples ? JSON.parse(JSON.stringify(m.practiceExamples)) : [],
    });
    setIsEditorOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const autoSlug =
      formData.slug.trim() ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    // Convert raw text into basic block ast if needed
    const blocks = [
      {
        id: 'b-head',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: formData.title }],
      },
      ...formData.contentRawText
        .split('\n\n')
        .filter((t) => t.trim().length > 0)
        .map((p, i) => ({
          id: `b-p-${i}`,
          type: 'paragraph',
          content: [{ type: 'text', text: p.trim() }],
        })),
    ];

    const payload = {
      title: formData.title,
      slug: autoSlug,
      category: formData.category,
      summary: formData.summary,
      coverUrl: formData.coverUrl,
      estimatedReadTime: Number(formData.estimatedReadTime),
      orderIndex: Number(formData.orderIndex),
      isPublished: formData.isPublished,
      learningObjectives: formData.learningObjectives.filter((t) => t.trim().length > 0),
      contentJson: blocks as any,
      contextualSection: {
        title: formData.contextualTitle,
        caseStudyTag: formData.contextualTag,
        content: formData.contextualContent,
        impactHighlight: formData.contextualImpact,
        relatedSdg: Number(formData.contextualSdg),
      },
      practiceExamples: formData.practiceExamples,
    };

    if (editingId) {
      updateMaterial(editingId, payload);
    } else {
      addMaterial(payload);
    }
    setIsEditorOpen(false);
  };

  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
    const list = [...sortedMaterials];
    const index = list.findIndex((m) => m.id === id);
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      reorderMaterials(list.map((m) => m.id));
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      reorderMaterials(list.map((m) => m.id));
    }
  };

  // Learning objective repeater helpers
  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, ''],
    }));
  };

  const updateObjective = (idx: number, text: string) => {
    setFormData((prev) => {
      const copy = [...prev.learningObjectives];
      copy[idx] = text;
      return { ...prev, learningObjectives: copy };
    });
  };

  const removeObjective = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== idx),
    }));
  };

  // Practice examples repeater helpers
  const addPracticeExample = () => {
    const newEx: PracticeExample = {
      id: `ex-${Date.now()}`,
      question: 'Soal latihan baru...',
      chemicalFormula: '',
      contextHint: '',
      solutionSteps: ['Langkah 1'],
      finalAnswer: '',
    };
    setFormData((prev) => ({
      ...prev,
      practiceExamples: [...prev.practiceExamples, newEx],
    }));
  };

  const removePracticeExample = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      practiceExamples: prev.practiceExamples.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Manajemen Modul Materi Pembelajaran
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola silabus bab materi, poin capaian indikator, studi kasus kontekstual, dan contoh soal terstruktur.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-chem-glow" />
          <span>Tambah Bab Materi Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul bab atau ringkasan..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage"
          />
        </div>

        <div className="md:col-span-3">
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

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl cursor-pointer capitalize"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'Semua Kategori' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. TABEL DATA MATERI */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4 w-16">Urutan</th>
                <th className="py-3.5 px-4">Bab & Judul Materi</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Waktu Baca</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi & Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((mat, idx) => (
                <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Re-ordering arrows & index */}
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 text-center">{mat.orderIndex}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(mat.id, 'up')}
                          className="text-slate-400 hover:text-chem-forest disabled:opacity-20 cursor-pointer"
                          title="Geser Naik"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredMaterials.length - 1}
                          onClick={() => handleMoveOrder(mat.id, 'down')}
                          className="text-slate-400 hover:text-chem-forest disabled:opacity-20 cursor-pointer"
                          title="Geser Turun"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Title & Slug */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={mat.coverUrl}
                        alt={mat.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1">
                          {mat.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          /{mat.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {mat.category}
                    </span>
                  </td>

                  {/* Read time */}
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {mat.estimatedReadTime} mnt
                  </td>

                  {/* Publication Status Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => togglePublishMaterial(mat.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                        mat.isPublished
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {mat.isPublished ? (
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

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewMaterial(mat)}
                        className="p-1.5 text-slate-500 hover:text-chem-forest hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Pratinjau Materi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(mat)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Edit Materi"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(mat.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Hapus Materi"
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

      {/* 2. FORM EDITOR MODAL / DRAWER (CREATE & EDIT) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-chem-dark text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-chem-mint" />
                <h3 className="font-serif text-lg font-bold">
                  {editingId ? 'Edit Modul Materi Pembelajaran' : 'Tambah Bab Materi Pembelajaran Baru'}
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

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Metadata Group */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-chem-forest block border-b border-slate-200 pb-1">
                  1. Informasi Pokok & Metadata Bab
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Judul Bab Materi</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Termokimia & Energi Reaksi"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Slug URL Halaman</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. termokimia-energi-reaksi"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:border-chem-sage focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Topik Induk / Kategori</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Termokimia"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-chem-sage focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Urutan Bab</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.orderIndex}
                        onChange={(e) => setFormData({ ...formData, orderIndex: Number(e.target.value) })}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Durasi Baca (Mnt)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.estimatedReadTime}
                        onChange={(e) => setFormData({ ...formData, estimatedReadTime: Number(e.target.value) })}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">URL Gambar Cover Banner</label>
                  <input
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Ringkasan / Sinopsis Singkat</label>
                  <textarea
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Deskripsi singkat konten materi..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Repeater: Capaian Belajar */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-chem-forest">
                    2. Indikator Capaian Pembelajaran (Repeater)
                  </span>
                  <button
                    type="button"
                    onClick={addObjective}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Indikator</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.learningObjectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5 text-center">{i + 1}.</span>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => updateObjective(i, e.target.value)}
                        placeholder="Tuliskan butir indikator capaian..."
                        className="flex-1 p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-chem-sage"
                      />
                      <button
                        type="button"
                        onClick={() => removeObjective(i)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Hapus Indikator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rich Content Editor */}
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-chem-forest">
                    3. Area Konten Inti (Rich Text / Markdown)
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-chem-ash">
                    <span>Dukungan Rumus Kimia: CO2, H2O, Delta H, {'->'}</span>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={formData.contentRawText}
                  onChange={(e) => setFormData({ ...formData, contentRawText: e.target.value })}
                  placeholder="Gunakan baris kosong ganda (enter dua kali) untuk memisahkan paragraf konten..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono leading-relaxed focus:border-chem-sage focus:outline-none"
                />
              </div>

              {/* Section Kontekstual & Studi Kasus */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-chem-forest block">
                  4. Section Kontekstual & Studi Kasus Lingkungan
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Judul Studi Kasus</label>
                    <input
                      type="text"
                      value={formData.contextualTitle}
                      onChange={(e) => setFormData({ ...formData, contextualTitle: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Label Kategori (Tag)</label>
                    <input
                      type="text"
                      value={formData.contextualTag}
                      onChange={(e) => setFormData({ ...formData, contextualTag: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Uraian Narasi Kontekstual</label>
                  <textarea
                    rows={3}
                    value={formData.contextualContent}
                    onChange={(e) => setFormData({ ...formData, contextualContent: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Sorotan Dampak (Impact Highlight)</label>
                    <input
                      type="text"
                      value={formData.contextualImpact}
                      onChange={(e) => setFormData({ ...formData, contextualImpact: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Korelasi SDG</label>
                    <select
                      value={formData.contextualSdg}
                      onChange={(e) => setFormData({ ...formData, contextualSdg: Number(e.target.value) })}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      <option value={4}>SDG 4: Quality Education</option>
                      <option value={7}>SDG 7: Clean Energy</option>
                      <option value={12}>SDG 12: Responsible Consumption</option>
                      <option value={13}>SDG 13: Climate Action</option>
                      <option value={14}>SDG 14: Life Below Water</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Repeater Contoh Soal & Pembahasan */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-chem-forest">
                    5. Contoh Soal & Pembahasan Step-by-Step (Accordion Repeater)
                  </span>
                  <button
                    type="button"
                    onClick={addPracticeExample}
                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Contoh Soal</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.practiceExamples.map((ex, exIdx) => (
                    <div key={ex.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Contoh Soal #{exIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePracticeExample(exIdx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        value={ex.question}
                        onChange={(e) => {
                          const copy = [...formData.practiceExamples];
                          copy[exIdx].question = e.target.value;
                          setFormData({ ...formData, practiceExamples: copy });
                        }}
                        placeholder="Pertanyaan soal..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ex.chemicalFormula || ''}
                          onChange={(e) => {
                            const copy = [...formData.practiceExamples];
                            copy[exIdx].chemicalFormula = e.target.value;
                            setFormData({ ...formData, practiceExamples: copy });
                          }}
                          placeholder="Rumus/Persamaan Reaksi..."
                          className="p-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                        />
                        <input
                          type="text"
                          value={ex.contextHint}
                          onChange={(e) => {
                            const copy = [...formData.practiceExamples];
                            copy[exIdx].contextHint = e.target.value;
                            setFormData({ ...formData, practiceExamples: copy });
                          }}
                          placeholder="Petunjuk konsep..."
                          className="p-2 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>

                      <input
                        type="text"
                        value={ex.finalAnswer}
                        onChange={(e) => {
                          const copy = [...formData.practiceExamples];
                          copy[exIdx].finalAnswer = e.target.value;
                          setFormData({ ...formData, practiceExamples: copy });
                        }}
                        placeholder="Hasil akhir / kesimpulan..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg font-bold text-emerald-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Publikasi */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-chem-forest focus:ring-chem-sage cursor-pointer"
                  />
                  <span>Publikasikan Modul Materi Segera (Tampil di Sisi Siswa)</span>
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
                    {editingId ? 'Simpan Perubahan' : 'Buat Materi Baru'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL PREVIEW MODE */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-mono font-bold text-chem-mint">
                [Mode Pratinjau Pengguna: {previewMaterial.title}]
              </span>
              <button
                type="button"
                onClick={() => setPreviewMaterial(null)}
                className="p-1 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h2 className="font-serif text-2xl font-bold text-chem-dark">
                {previewMaterial.title}
              </h2>
              <p className="text-xs text-chem-ash leading-relaxed">
                {previewMaterial.summary}
              </p>
              <div className="p-4 bg-chem-subtle rounded-2xl border border-chem-border">
                <span className="text-xs font-bold text-chem-forest block mb-2">Capaian:</span>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  {previewMaterial.learningObjectives?.map((o, idx) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>
              <BlockAstViewer contentJson={previewMaterial.contentJson} />
            </div>
          </div>
        </div>
      )}

      {/* 4. KONFIRMASI HAPUS MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-slate-900">Konfirmasi Hapus Materi?</h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan menghapus bab materi dan seluruh contoh soal terkait dari katalog.
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
                  deleteMaterial(deleteConfirmId);
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
