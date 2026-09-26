import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { ExtendedMaterial } from '../../types/app';
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
  const navigate = useNavigate();
  const {
    materials,
    deleteMaterial,
    togglePublishMaterial,
    reorderMaterials,
  } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Preview & Delete Confirmation Modals
  const [previewMaterial, setPreviewMaterial] = useState<ExtendedMaterial | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered & sorted materials
  const sortedMaterials = useMemo(() => {
    return [...materials].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return sortedMaterials.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && m.isPublished) ||
        (statusFilter === 'draft' && !m.isPublished);
      return matchSearch && matchStatus;
    });
  }, [sortedMaterials, searchQuery, statusFilter]);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Manajemen Materi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tulis dan publikasikan artikel materi pembelajaran secara minimalis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/materi/baru')}
          className="px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 text-chem-glow" />
          <span>Tulis Materi Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage shadow-2xs"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl cursor-pointer shadow-2xs focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="published">Terbit</option>
            <option value="draft">Draf</option>
          </select>
        </div>
      </div>

      {/* TABEL DATA MATERI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 w-16">Urutan</th>
                <th className="py-3 px-4">Judul Materi</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
                <th className="py-3 px-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    Belum ada materi atau tidak cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat, idx) => (
                  <tr key={mat.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Urutan */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <div className="flex items-center gap-1">
                        <span className="w-4 text-center">{mat.orderIndex}</span>
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

                    {/* Judul & Ringkasan */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {mat.coverUrl ? (
                          <img
                            src={mat.coverUrl}
                            alt={mat.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate">
                            {mat.title}
                          </span>
                          {mat.summary && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-md">
                              {mat.summary}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePublishMaterial(mat.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          mat.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {mat.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Terbit</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Draf</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewMaterial(mat)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Pratinjau"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/materi/${mat.id}/edit`)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(mat.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK PREVIEW MODAL */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-slate-900 truncate pr-4">
                {previewMaterial.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewMaterial(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {previewMaterial.coverUrl && (
                <img
                  src={previewMaterial.coverUrl}
                  alt={previewMaterial.title}
                  className="w-full h-44 object-cover rounded-xl"
                />
              )}
              {previewMaterial.summary && (
                <p className="text-xs text-slate-500 italic">{previewMaterial.summary}</p>
              )}
              <div className="prose max-w-none">
                <BlockAstViewer contentJson={previewMaterial.contentJson} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <h3 className="font-serif text-base font-bold text-slate-900">
              Hapus Materi Ini?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Materi yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMaterial(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
