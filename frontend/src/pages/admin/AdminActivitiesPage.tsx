import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Paperclip,
} from 'lucide-react';

export const AdminActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { activities, deleteActivity, togglePublishActivity } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && act.isPublished) ||
        (statusFilter === 'draft' && !act.isPublished);
      return matchSearch && matchStatus;
    });
  }, [activities, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Manajemen Aktivitas & Pengumuman
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bagikan instruksi tugas, pengumuman kelas, dan lampiran berkas belajar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/aktivitas/baru')}
          className="px-4 py-2.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 text-chem-glow" />
          <span>Buat Pengumuman Baru</span>
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
            placeholder="Cari pengumuman atau aktivitas..."
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

      {/* TABEL DATA AKTIVITAS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Pengumuman & Aktivitas</th>
                <th className="py-3 px-4 w-32">Lampiran</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
                <th className="py-3 px-4 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    Belum ada pengumuman atau tidak cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const attachmentCount = act.attachments?.length || 0;
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate">
                            {act.title}
                          </span>
                          {act.summary && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-md">
                              {act.summary}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {attachmentCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            <span>{attachmentCount} berkas</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePublishActivity(act.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            act.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {act.isPublished ? (
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

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/aktivitas/${act.id}/edit`)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(act.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Hapus"
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <h3 className="font-serif text-base font-bold text-slate-900">
              Hapus Aktivitas Ini?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pengumuman dan berkas yang dihapus tidak dapat dipulihkan kembali.
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
                  deleteActivity(deleteConfirmId);
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
