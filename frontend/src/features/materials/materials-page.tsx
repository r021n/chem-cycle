import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Module, Material } from '../../types/material';
import { MaterialReaderModal } from '../../components/materials/MaterialReaderModal';
import { NotionMaterialEditorModal } from '../../components/materials/NotionMaterialEditorModal';

export const MaterialsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [readingMaterial, setReadingMaterial] = useState<Material | null>(null);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);

  // Module management modal state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  // Module detail inspection modal state (utilizes GET /modules/:id)
  const [detailModuleId, setDetailModuleId] = useState<string | null>(null);

  const { data: singleModuleData, isLoading: loadingSingleModule } = useQuery({
    queryKey: queryKeys.modules.detail(detailModuleId || ''),
    queryFn: () => api.get<{ success: boolean; data: Module }>(`/modules/${detailModuleId}`),
    enabled: !!detailModuleId,
  });

  const inspectedModule = singleModuleData?.data;

  const isAdmin = user?.role === 'admin';

  // Fetch modules with nested materials
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.modules.list,
    queryFn: () => api.get<{ success: boolean; data: Module[] }>('/modules'),
  });

  const modules = data?.data || [];

  // Delete Material Mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: (materialId: string) => api.delete(`/materials/${materialId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.list });
      addToast('Materi berhasil dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus materi';
      addToast(msg, 'error');
    },
  });

  // Create / Update Module Mutation
  const saveModuleMutation = useMutation({
    mutationFn: async () => {
      if (!moduleTitle.trim()) throw new Error('Judul bab modul wajib diisi');
      if (editingModule) {
        return api.put(`/modules/${editingModule.id}`, {
          title: moduleTitle.trim(),
          description: moduleDesc.trim() || undefined,
        });
      }
      return api.post('/modules', {
        title: moduleTitle.trim(),
        description: moduleDesc.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.list });
      addToast(editingModule ? 'Bab modul diperbarui' : 'Bab modul baru berhasil dibuat', 'success');
      setModuleModalOpen(false);
      setEditingModule(null);
      setModuleTitle('');
      setModuleDesc('');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menyimpan bab modul';
      addToast(msg, 'error');
    },
  });

  // Delete Module Mutation
  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => api.delete(`/modules/${moduleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.list });
      addToast('Bab modul beserta materi di dalamnya dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus bab modul';
      addToast(msg, 'error');
    },
  });

  const handleOpenEditor = (mat?: Material | null) => {
    setMaterialToEdit(mat || null);
    setEditorModalOpen(true);
  };

  const handleOpenModuleModal = (mod?: Module | null) => {
    if (mod) {
      setEditingModule(mod);
      setModuleTitle(mod.title);
      setModuleDesc(mod.description || '');
    } else {
      setEditingModule(null);
      setModuleTitle('');
      setModuleDesc('');
    }
    setModuleModalOpen(true);
  };

  const filteredModules = modules.filter((mod) => {
    const titleMatch = mod.title.toLowerCase().includes(searchQuery.toLowerCase());
    const materialMatch = mod.materials?.some((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return titleMatch || materialMatch;
  });

  return (
    <section id="page-materi" className="page-view max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-chem-border gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-chem-dark">Daftar Modul Siklus</h2>
          <p className="text-xs text-chem-ash mt-0.5">
            Catatan visual komprehensif didukung teks, ilustrasi, dan video pembelajaran.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenModuleModal(null)}
              className="px-3.5 py-2 bg-chem-subtle hover:bg-chem-glow/60 text-chem-dark text-xs font-semibold rounded-xl border border-chem-border transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-folder-plus text-[11px] text-chem-sage"></i>
              <span>+ Bab</span>
            </button>

            <button
              type="button"
              id="adminMateriCreateBtn"
              onClick={() => handleOpenEditor(null)}
              className="px-4 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-plus text-[11px]"></i>
              <span>Buat Catatan Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-chem-border text-xs">
        <i className="fa-solid fa-magnifying-glass text-chem-ash"></i>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari materi siklus biogeokimia..."
          className="w-full bg-transparent border-none outline-none text-chem-dark placeholder:text-chem-ash/50"
        />
      </div>

      {/* Materials List */}
      <div id="materialsListContainer" className="space-y-6">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-chem-ash">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
            Memuat modul dan materi siklus alam...
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-chem-border text-xs text-chem-ash">
            Belum ada modul yang cocok dengan pencarian.
          </div>
        ) : (
          filteredModules.map((mod) => (
            <div
              key={mod.id}
              className="bg-white rounded-2xl border border-chem-border p-5 shadow-subtle space-y-4"
            >
              {/* Module Header */}
              <div className="flex items-center justify-between border-b border-chem-border/60 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-chem-forest bg-chem-glow px-2 py-0.5 rounded-full">
                      Bab Pembelajaran
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-chem-dark">{mod.title}</h3>
                  {mod.description && (
                    <p className="text-xs text-chem-ash leading-relaxed">{mod.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailModuleId(mod.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-chem-forest hover:bg-chem-glow/60 bg-chem-subtle rounded-lg border border-chem-border transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Lihat Silabus Bab Lengkap"
                  >
                    <i className="fa-solid fa-circle-info text-[10px] text-chem-sage"></i>
                    <span>Silabus Bab</span>
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenModuleModal(mod)}
                        className="p-1.5 text-chem-ash hover:text-chem-dark rounded-lg hover:bg-chem-subtle transition-colors cursor-pointer"
                        title="Ubah Nama Bab"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus bab '${mod.title}' dan seluruh materinya?`)) {
                            deleteModuleMutation.mutate(mod.id);
                          }
                        }}
                        className="p-1.5 text-chem-ash hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Bab"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Material Cards Inside Module */}
              <div className="space-y-3">
                {!mod.materials || mod.materials.length === 0 ? (
                  <p className="text-xs text-chem-ash italic py-2">
                    Belum ada catatan materi di dalam bab ini.
                  </p>
                ) : (
                  mod.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-4 rounded-xl bg-chem-paper border border-chem-border/70 hover:border-chem-sage/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-chem-border flex items-center justify-center text-chem-forest text-base shrink-0 shadow-2xs">
                          <i className="fa-solid fa-leaf"></i>
                        </div>

                        <div>
                          <span className="block text-[10px] font-sans font-medium uppercase tracking-wider text-chem-ash">
                            {mod.title} • {mat.estimatedReadTime || 5} mnt baca
                          </span>
                          <h4
                            onClick={() => setReadingMaterial(mat)}
                            className="font-serif text-base font-semibold text-chem-dark hover:text-chem-moss cursor-pointer transition-colors"
                          >
                            {mat.title}
                          </h4>
                          {mat.summary && (
                            <p className="text-xs text-chem-ash line-clamp-1 mt-0.5">
                              {mat.summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setReadingMaterial(mat)}
                          className="px-3.5 py-1.5 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                        >
                          <span>Buka Modul</span>
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>

                        <Link
                          to={`/materi/${mat.slug}`}
                          className="p-1.5 text-chem-ash hover:text-chem-forest rounded-lg hover:bg-white transition-colors cursor-pointer border border-chem-border/50"
                          title="Buka Halaman Penuh Materi"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                        </Link>

                        {isAdmin && (
                          <div className="flex items-center gap-1 pl-1 border-l border-chem-border">
                            <button
                              type="button"
                              onClick={() => handleOpenEditor(mat)}
                              className="p-1.5 text-chem-ash hover:text-chem-forest rounded-lg hover:bg-white transition-colors cursor-pointer"
                              title="Edit via Notion Modal"
                            >
                              <i className="fa-solid fa-pen text-xs"></i>
                            </button>
                            <Link
                              to={`/materi/${mat.slug}/edit`}
                              className="p-1.5 text-chem-ash hover:text-chem-forest rounded-lg hover:bg-white transition-colors cursor-pointer"
                              title="Buka Editor Penuh"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus materi '${mat.title}'?`)) {
                                  deleteMaterialMutation.mutate(mat.id);
                                }
                              }}
                              className="p-1.5 text-chem-ash hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Materi"
                            >
                              <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reader Modal */}
      {readingMaterial && (
        <MaterialReaderModal
          material={readingMaterial}
          isOpen={!!readingMaterial}
          onClose={() => setReadingMaterial(null)}
          onEdit={(mat) => {
            setReadingMaterial(null);
            handleOpenEditor(mat);
          }}
        />
      )}

      {/* Notion Material Editor Modal */}
      <NotionMaterialEditorModal
        isOpen={editorModalOpen}
        onClose={() => {
          setEditorModalOpen(false);
          setMaterialToEdit(null);
        }}
        materialToEdit={materialToEdit}
        modules={modules}
      />

      {/* Module Management Modal */}
      {moduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-chem-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setModuleModalOpen(false)} />
          <div className="relative z-10 bg-white rounded-3xl border border-chem-border p-6 shadow-float w-full max-w-md space-y-4">
            <h3 className="font-serif text-lg font-bold text-chem-dark">
              {editingModule ? 'Perbarui Bab Modul' : 'Buat Bab Modul Baru'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-chem-ash uppercase mb-1">
                  Judul Bab Modul
                </label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Contoh: Daur Nitrogen & Transformasi Tanah"
                  className="w-full bg-chem-subtle/70 px-3.5 py-2.5 rounded-xl border border-chem-border focus:bg-white focus:outline-none focus:border-chem-sage"
                />
              </div>

              <div>
                <label className="block text-[11px] text-chem-ash uppercase mb-1">
                  Deskripsi / Capaian
                </label>
                <textarea
                  rows={3}
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Jelaskan ringkasan bab modul..."
                  className="w-full bg-chem-subtle/70 px-3.5 py-2.5 rounded-xl border border-chem-border focus:bg-white focus:outline-none focus:border-chem-sage resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModuleModalOpen(false)}
                className="px-4 py-2 bg-chem-subtle text-chem-dark text-xs font-semibold rounded-xl hover:bg-chem-glow/60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => saveModuleMutation.mutate()}
                disabled={saveModuleMutation.isPending}
                className="px-4 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle disabled:opacity-50"
              >
                {saveModuleMutation.isPending ? 'Menyimpan...' : 'Simpan Bab'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Detail Inspection Modal (using GET /modules/:id) */}
      {detailModuleId && (
        <div className="fixed inset-0 z-50 bg-chem-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setDetailModuleId(null)} />
          <div className="relative z-10 bg-white rounded-3xl border border-chem-border p-6 shadow-float w-full max-w-lg space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-chem-border/70 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-chem-forest bg-chem-glow px-2 py-0.5 rounded-full">
                  Silabus & Detail Bab
                </span>
                <h3 className="font-serif text-lg font-bold text-chem-dark mt-1">
                  {inspectedModule?.title || 'Memuat Silabus Modul...'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModuleId(null)}
                className="p-1.5 text-chem-ash hover:text-chem-dark rounded-lg cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 text-xs text-chem-ash">
              {loadingSingleModule ? (
                <div className="py-8 text-center">
                  <div className="w-6 h-6 mx-auto mb-2 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
                  Mengambil rincian silabus bab...
                </div>
              ) : inspectedModule ? (
                <>
                  {inspectedModule.description && (
                    <div className="p-3 bg-chem-subtle/70 rounded-xl border border-chem-border/70 text-chem-dark leading-relaxed">
                      <span className="font-semibold text-chem-forest block mb-1">
                        Capaian Pembelajaran:
                      </span>
                      {inspectedModule.description}
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="font-bold text-chem-dark text-[11px] uppercase tracking-wider block">
                      Daftar Catatan Materi ({inspectedModule.materials?.length || 0} Materi):
                    </span>
                    {(!inspectedModule.materials || inspectedModule.materials.length === 0) ? (
                      <p className="italic">Belum ada materi di dalam bab ini.</p>
                    ) : (
                      inspectedModule.materials.map((m, idx) => (
                        <div
                          key={m.id}
                          className="p-3 bg-chem-paper rounded-xl border border-chem-border flex items-center justify-between gap-2 hover:border-chem-sage/60 transition-colors"
                        >
                          <div>
                            <span className="text-[10px] text-chem-ash font-medium">
                              Materi #{idx + 1} • {m.estimatedReadTime || 5} mnt baca
                            </span>
                            <div className="font-semibold text-chem-dark text-xs">{m.title}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setDetailModuleId(null);
                                setReadingMaterial(m);
                              }}
                              className="px-2.5 py-1 bg-chem-forest text-chem-glow rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              Baca
                            </button>
                            <Link
                              to={`/materi/${m.slug}`}
                              className="p-1 text-chem-ash hover:text-chem-forest rounded-lg"
                              title="Halaman Penuh"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <p className="text-center py-4">Data bab tidak ditemukan.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-chem-border shrink-0">
              <button
                type="button"
                onClick={() => setDetailModuleId(null)}
                className="px-4 py-2 bg-chem-subtle text-chem-dark text-xs font-semibold rounded-xl hover:bg-chem-glow/60"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MaterialsPage;
