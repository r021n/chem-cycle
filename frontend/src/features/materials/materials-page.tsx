import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Material } from '../../types/material';
import { MaterialReaderModal } from '../../components/materials/MaterialReaderModal';

export const MaterialsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [readingMaterial, setReadingMaterial] = useState<Material | null>(null);

  const isAdmin = user?.role === 'admin';

  // Fetch all materials
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.materials.list,
    queryFn: () => api.get<{ success: boolean; data: Material[] }>('/materials'),
  });

  const materials = data?.data || [];

  // Delete Material Mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: (materialId: string) => api.delete(`/materials/${materialId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.list });
      addToast('Materi berhasil dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus materi';
      addToast(msg, 'error');
    },
  });

  const filteredMaterials = materials.filter((mat) => {
    const query = searchQuery.toLowerCase();
    return (
      mat.title.toLowerCase().includes(query) ||
      (mat.summary?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <section id="page-materi" className="page-view max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-chem-border gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-chem-dark">Daftar Materi Siklus</h2>
          <p className="text-xs text-chem-ash mt-0.5">
            Catatan visual komprehensif didukung teks, ilustrasi, dan video pembelajaran.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            id="adminMateriCreateBtn"
            onClick={() => navigate('/materi/baru')}
            className="px-4 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle transition-all flex items-center gap-2 cursor-pointer active:scale-95 self-start"
          >
            <i className="fa-solid fa-plus text-[11px]"></i>
            <span>Buat Materi Baru</span>
          </button>
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
      <div id="materialsListContainer" className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-chem-ash">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
            Memuat materi siklus alam...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-chem-border text-xs text-chem-ash">
            Belum ada materi yang cocok dengan pencarian.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="p-4 rounded-2xl bg-white border border-chem-border hover:border-chem-sage/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-chem-subtle border border-chem-border flex items-center justify-center text-chem-forest text-base shrink-0 shadow-2xs">
                  <i className="fa-solid fa-leaf"></i>
                </div>

                <div className="min-w-0">
                  <span className="block text-[10px] font-sans font-medium uppercase tracking-wider text-chem-ash">
                    Materi Pembelajaran • {mat.estimatedReadTime || 5} mnt baca
                  </span>
                  <h4
                    onClick={() => setReadingMaterial(mat)}
                    className="font-serif text-base font-semibold text-chem-dark hover:text-chem-moss cursor-pointer transition-colors"
                  >
                    {mat.title}
                  </h4>
                  {mat.summary && (
                    <p className="text-xs text-chem-ash line-clamp-1 mt-0.5">{mat.summary}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setReadingMaterial(mat)}
                  className="px-3.5 py-1.5 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Baca</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>

                <Link
                  to={`/materi/${mat.slug}`}
                  className="p-1.5 text-chem-ash hover:text-chem-forest rounded-lg hover:bg-chem-subtle transition-colors cursor-pointer border border-chem-border/50"
                  title="Buka Halaman Penuh Materi"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                </Link>

                {isAdmin && (
                  <div className="flex items-center gap-1 pl-1 border-l border-chem-border">
                    <Link
                      to={`/materi/${mat.slug}/edit`}
                      className="p-1.5 text-chem-ash hover:text-chem-forest rounded-lg hover:bg-chem-subtle transition-colors cursor-pointer"
                      title="Edit Materi"
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

      {/* Reader Modal */}
      {readingMaterial && (
        <MaterialReaderModal
          material={readingMaterial}
          isOpen={!!readingMaterial}
          onClose={() => setReadingMaterial(null)}
          onEdit={(mat) => {
            setReadingMaterial(null);
            navigate(`/materi/${mat.slug}/edit`);
          }}
        />
      )}
    </section>
  );
};

export default MaterialsPage;