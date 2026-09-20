import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Activity, CreateActivityPayload } from '../../types/activity';
import { formatDate } from '../../lib/utils';

export const ActivitiesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';

  // Composer state (Admin)
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<
    { type: 'document' | 'link'; title: string; url: string; fileSize?: number; mimeType?: string }[]
  >([]);

  // Attachment input toggles
  const [showDocInput, setShowDocInput] = useState(false);
  const [docNameInput, setDocNameInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Activity state
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editInstruction, setEditInstruction] = useState('');

  // Add attachment to existing activity state
  const [addAttachActId, setAddAttachActId] = useState<string | null>(null);
  const [newAttachType, setNewAttachType] = useState<'document' | 'link'>('link');
  const [newAttachTitle, setNewAttachTitle] = useState('');
  const [newAttachUrl, setNewAttachUrl] = useState('');
  const [newAttachUploading, setNewAttachUploading] = useState(false);
  const existingAttachFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch activities feed
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.activities.stream,
    queryFn: () => api.get<{ success: boolean; data: Activity[] }>('/activities'),
  });

  const activities = data?.data || [];

  // Create Activity Mutation
  const createMutation = useMutation({
    mutationFn: (body: CreateActivityPayload) => api.post('/activities', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.stream });
      addToast('Instruksi aktivitas berhasil diposting ke kelas', 'success');
      setTitle('');
      setInstruction('');
      setDueDate('');
      setAttachments([]);
      setShowDocInput(false);
      setShowLinkInput(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menerbitkan instruksi';
      addToast(msg, 'error');
    },
  });

  // Update Activity Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateActivityPayload> }) =>
      api.put(`/activities/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.stream });
      addToast('Instruksi aktivitas berhasil diperbarui', 'success');
      setEditingActivityId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal memperbarui aktivitas';
      addToast(msg, 'error');
    },
  });

  // Toggle Done Mutation
  const toggleDoneMutation = useMutation({
    mutationFn: (activityId: string) =>
      api.post<{ message?: string; data?: { isDone: boolean } }>(
        `/activities/${activityId}/toggle-done`
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.stream });
      addToast(res.message || 'Status tugas diperbarui', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal mengubah status tugas';
      addToast(msg, 'error');
    },
  });

  // Delete Activity Mutation
  const deleteMutation = useMutation({
    mutationFn: (activityId: string) => api.delete(`/activities/${activityId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.stream });
      addToast('Instruksi aktivitas berhasil dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus instruksi';
      addToast(msg, 'error');
    },
  });

  // Delete Attachment Mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      api.delete(`/activities/attachments/${attachmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.stream });
      addToast('Lampiran dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus lampiran';
      addToast(msg, 'error');
    },
  });

  // Add Attachment to Existing Activity Mutation (POST /activities/:id/attachments)
  const addAttachmentMutation = useMutation({
    mutationFn: ({
      activityId,
      body,
    }: {
      activityId: string;
      body: { type: 'document' | 'link'; title: string; url: string; fileSize?: number; mimeType?: string };
    }) => api.post(`/activities/${activityId}/attachments`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.stream });
      addToast('Lampiran baru berhasil ditambahkan ke aktivitas', 'success');
      setAddAttachActId(null);
      setNewAttachTitle('');
      setNewAttachUrl('');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menambahkan lampiran';
      addToast(msg, 'error');
    },
  });

  const handleExistingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, activityId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewAttachUploading(true);
    try {
      const res = await api.uploadDocument(file);
      if (res.success && res.data) {
        addAttachmentMutation.mutate({
          activityId,
          body: {
            type: 'document',
            title: res.data.originalName || res.data.filename,
            url: res.data.url,
            fileSize: res.data.size,
            mimeType: res.data.mimeType,
          },
        });
      }
    } catch {
      addToast('Gagal mengunggah dokumen', 'error');
    } finally {
      setNewAttachUploading(false);
      if (existingAttachFileInputRef.current) existingAttachFileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const res = await api.uploadDocument(file);
      if (res.success && res.data) {
        setAttachments((prev) => [
          ...prev,
          {
            type: 'document',
            title: res.data.originalName || res.data.filename,
            url: res.data.url,
            fileSize: res.data.size,
            mimeType: res.data.mimeType,
          },
        ]);
        addToast('Dokumen berhasil diunggah', 'success');
      }
    } catch {
      addToast('Gagal mengunggah dokumen', 'error');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddManualDoc = () => {
    if (!docNameInput.trim()) return;
    setAttachments((prev) => [
      ...prev,
      {
        type: 'document',
        title: docNameInput.trim(),
        url: '#',
      },
    ]);
    setDocNameInput('');
    setShowDocInput(false);
  };

  const handleAddLink = () => {
    if (!linkUrlInput.trim()) return;
    setAttachments((prev) => [
      ...prev,
      {
        type: 'link',
        title: linkUrlInput.trim(),
        url: linkUrlInput.trim(),
      },
    ]);
    setLinkUrlInput('');
    setShowLinkInput(false);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instruction.trim()) {
      addToast('Judul dan rincian instruksi wajib diisi', 'error');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      instruction: instruction.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      attachments,
    });
  };

  const handleStartEdit = (act: Activity) => {
    setEditingActivityId(act.id);
    setEditTitle(act.title);
    setEditInstruction(act.instruction);
  };

  const handleSaveEdit = (actId: string) => {
    if (!editTitle.trim() || !editInstruction.trim()) return;
    updateMutation.mutate({
      id: actId,
      body: {
        title: editTitle.trim(),
        instruction: editInstruction.trim(),
      },
    });
  };

  return (
    <section id="page-aktivitas" className="page-view max-w-2xl mx-auto space-y-6 font-sans">
      {/* Header Section */}
      <div className="pb-4 border-b border-chem-border">
        <h2 className="font-serif text-2xl sm:text-3xl text-chem-dark">Instruksi Kelas</h2>
        <p className="text-xs text-chem-ash mt-0.5">
          Distribusi petunjuk praktikum, berkas panduan modul, dan tautan simulasi kimia.
        </p>
      </div>

      {/* Post Composer for Admin / Guru */}
      {isAdmin && (
        <div
          id="activityComposerBox"
          className="bg-white rounded-2xl border border-chem-border p-5 shadow-subtle space-y-3.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-chem-forest text-chem-glow text-xs flex items-center justify-center font-bold">
              SW
            </div>
            <div>
              <h3 className="text-xs font-bold text-chem-dark">
                Umumkan instruksi aktivitas ke kelas
              </h3>
              <p className="text-[10px] text-chem-ash">Guru Kimia / Fasilitator Pembelajaran</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
          />

          <input
            type="text"
            id="actInputTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul instruksi / topik aktivitas..."
            className="w-full text-xs font-semibold px-3.5 py-2.5 bg-chem-subtle/70 border border-chem-border rounded-xl focus:bg-white focus:outline-none focus:border-chem-sage transition-all"
          />

          <textarea
            id="actInputBody"
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Tuliskan petunjuk langkah kerja atau rincian tugas..."
            className="w-full text-xs px-3.5 py-2.5 bg-chem-subtle/70 border border-chem-border rounded-xl focus:bg-white focus:outline-none focus:border-chem-sage resize-none transition-all"
          ></textarea>

          {/* Attachments Section */}
          <div className="p-3 bg-chem-subtle/40 border border-dashed border-chem-border rounded-xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-chem-ash text-[11px] font-medium">Lampirkan:</span>

              <button
                type="button"
                onClick={() => setShowDocInput(!showDocInput)}
                className="px-2.5 py-1 bg-white border border-chem-border rounded-lg text-chem-dark text-[11px] hover:border-chem-sage flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-file-pdf text-rose-500"></i>
                <span>Teks Nama Berkas</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDoc}
                className="px-2.5 py-1 bg-white border border-chem-border rounded-lg text-chem-dark text-[11px] hover:border-chem-sage flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-upload text-chem-moss"></i>
                <span>{uploadingDoc ? 'Mengunggah...' : 'Unggah PDF Asli'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="px-2.5 py-1 bg-white border border-chem-border rounded-lg text-chem-dark text-[11px] hover:border-chem-sage flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-link text-chem-forest"></i>
                <span>Tautan Sumber</span>
              </button>
            </div>

            {/* Dynamic Manual Doc Input */}
            {showDocInput && (
              <div id="actAttachDoc" className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  id="actDocNameInput"
                  value={docNameInput}
                  onChange={(e) => setDocNameInput(e.target.value)}
                  placeholder="Nama Dokumen (cth: Panduan_Praktikum_Daur_Nitrogen.pdf)"
                  className="text-xs px-3 py-1.5 bg-white border border-chem-border rounded-lg flex-1 focus:outline-none focus:border-chem-sage"
                />
                <button
                  type="button"
                  onClick={handleAddManualDoc}
                  className="px-3 py-1.5 bg-chem-forest text-chem-glow text-xs rounded-lg font-semibold"
                >
                  Tambah
                </button>
                <button
                  type="button"
                  onClick={() => setShowDocInput(false)}
                  className="text-xs text-chem-ash hover:text-rose-600 p-1"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}

            {/* Dynamic Link Input */}
            {showLinkInput && (
              <div id="actAttachLink" className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  id="actLinkUrlInput"
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                  placeholder="URL Tautan (cth: https://phet.colorado.edu/...)"
                  className="text-xs px-3 py-1.5 bg-white border border-chem-border rounded-lg flex-1 focus:outline-none focus:border-chem-sage"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 py-1.5 bg-chem-forest text-chem-glow text-xs rounded-lg font-semibold"
                >
                  Tambah
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(false)}
                  className="text-xs text-chem-ash hover:text-rose-600 p-1"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}

            {/* List of Attached Items in Composer */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-chem-border rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 text-chem-dark">
                      <i
                        className={`fa-solid ${
                          att.type === 'document' ? 'fa-file-pdf text-rose-500' : 'fa-link text-chem-forest'
                        }`}
                      ></i>
                      <span>{att.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-chem-ash hover:text-rose-600"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handlePublish}
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-bold rounded-xl shadow-subtle transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane text-[10px]"></i>
              <span>{createMutation.isPending ? 'Menerbitkan...' : 'Posting Instruksi'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Activity Feed List */}
      <div id="activityFeedList" className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-chem-ash">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
            Memuat pengumuman aktivitas kelas...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-chem-border text-xs text-chem-ash">
            Belum ada instruksi aktivitas yang dipublikasikan.
          </div>
        ) : (
          activities.map((act) => {
            const isEditing = editingActivityId === act.id;

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-chem-border p-5 shadow-subtle space-y-4 font-sans"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-chem-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-chem-forest text-chem-glow flex items-center justify-center font-bold text-xs">
                      {act.author.fullName?.[0]?.toUpperCase() || 'G'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-chem-dark">
                          {act.author.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-chem-subtle text-chem-forest">
                          Instruksi
                        </span>
                      </div>
                      <span className="text-[10px] text-chem-ash">
                        {formatDate(act.createdAt)}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => (isEditing ? setEditingActivityId(null) : handleStartEdit(act))}
                        className="p-1.5 text-chem-ash hover:text-chem-forest rounded-lg hover:bg-chem-subtle transition-colors cursor-pointer"
                        title="Edit Aktivitas"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus aktivitas '${act.title}'?`)) {
                            deleteMutation.mutate(act.id);
                          }
                        }}
                        className="p-1.5 text-chem-ash hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Aktivitas"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-chem-subtle border border-chem-border rounded-xl focus:bg-white focus:outline-none"
                    />
                    <textarea
                      rows={3}
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-chem-subtle border border-chem-border rounded-xl focus:bg-white focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingActivityId(null)}
                        className="px-3 py-1.5 text-xs text-chem-ash hover:bg-chem-subtle rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(act.id)}
                        className="px-3 py-1.5 bg-chem-forest text-chem-glow text-xs font-semibold rounded-lg"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-serif text-base font-bold text-chem-dark mb-1.5">
                      {act.title}
                    </h3>
                    <p className="text-xs text-chem-dark/85 leading-relaxed whitespace-pre-line">
                      {act.instruction}
                    </p>
                  </div>
                )}

                {/* Attachments Section */}
                {act.attachments && act.attachments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-chem-border/60">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-chem-ash">
                      Lampiran Dokumen & Simulasi:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {act.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-3 bg-chem-paper border border-chem-border rounded-xl flex items-center justify-between group hover:border-chem-sage/60 transition-all"
                        >
                          <a
                            href={att.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 truncate flex-1 text-xs"
                          >
                            <i
                              className={`fa-solid ${
                                att.type === 'document' ? 'fa-file-pdf text-rose-500 text-sm' : 'fa-arrow-up-right-from-square text-chem-forest text-xs'
                              } shrink-0`}
                            ></i>
                            <span className="truncate text-chem-dark font-medium group-hover:text-chem-forest">
                              {att.title}
                            </span>
                          </a>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => deleteAttachmentMutation.mutate(att.id)}
                              className="p-1 text-chem-ash hover:text-rose-600 rounded transition-colors"
                              title="Hapus Lampiran"
                            >
                              <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Add Attachment to existing activity */}
                {isAdmin && (
                  <div className="pt-2 border-t border-chem-border/40">
                    <input
                      type="file"
                      ref={existingAttachFileInputRef}
                      onChange={(e) => handleExistingFileUpload(e, act.id)}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    />

                    {addAttachActId === act.id ? (
                      <div className="p-3 bg-chem-subtle/70 rounded-xl border border-chem-border space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-chem-forest text-[11px]">
                            Tambah Lampiran ke Aktivitas Ini:
                          </span>
                          <button
                            type="button"
                            onClick={() => setAddAttachActId(null)}
                            className="text-chem-ash hover:text-rose-600 p-1"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNewAttachType('link')}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              newAttachType === 'link' ? 'bg-chem-forest text-chem-glow' : 'bg-white text-chem-ash border border-chem-border'
                            }`}
                          >
                            Tautan URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewAttachType('document')}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              newAttachType === 'document' ? 'bg-chem-forest text-chem-glow' : 'bg-white text-chem-ash border border-chem-border'
                            }`}
                          >
                            Dokumen Teks / PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => existingAttachFileInputRef.current?.click()}
                            disabled={newAttachUploading}
                            className="px-2 py-1 bg-white hover:bg-chem-subtle rounded-lg text-[11px] font-medium text-chem-moss border border-chem-border flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-upload text-[10px]"></i>
                            <span>{newAttachUploading ? 'Mengunggah...' : 'Upload Berkas Asli'}</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Nama / Judul Lampiran..."
                            value={newAttachTitle}
                            onChange={(e) => setNewAttachTitle(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-chem-border rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder={newAttachType === 'link' ? 'URL Tautan (cth: https://...)' : 'URL Berkas atau masukkan nama...'}
                            value={newAttachUrl}
                            onChange={(e) => setNewAttachUrl(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-chem-border rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setAddAttachActId(null)}
                            className="px-3 py-1 text-xs text-chem-ash hover:bg-white rounded-lg"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newAttachTitle.trim()) {
                                addToast('Nama lampiran wajib diisi', 'error');
                                return;
                              }
                              addAttachmentMutation.mutate({
                                activityId: act.id,
                                body: {
                                  type: newAttachType,
                                  title: newAttachTitle.trim(),
                                  url: newAttachUrl.trim() || '#',
                                },
                              });
                            }}
                            disabled={addAttachmentMutation.isPending}
                            className="px-3 py-1 bg-chem-forest text-chem-glow text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                          >
                            {addAttachmentMutation.isPending ? 'Menambahkan...' : 'Simpan Lampiran'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAddAttachActId(act.id);
                          setNewAttachTitle('');
                          setNewAttachUrl('');
                        }}
                        className="text-[11px] font-semibold text-chem-forest hover:text-chem-dark flex items-center gap-1 cursor-pointer py-1"
                      >
                        <i className="fa-solid fa-paperclip text-xs"></i>
                        <span>+ Tambah Lampiran ke Aktivitas Ini</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Student Interaction: Toggle Completion */}
                {!isAdmin && (
                  <div className="pt-3 border-t border-chem-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-chem-ash">Status Pengerjaan:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          act.isDone
                            ? 'bg-chem-glow text-chem-forest border border-chem-sage/30'
                            : 'bg-chem-subtle text-chem-ash border border-chem-border'
                        }`}
                      >
                        {act.isDone ? '✓ Sudah Dikerjakan' : 'Belum Selesai'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDoneMutation.mutate(act.id)}
                      disabled={toggleDoneMutation.isPending}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                        act.isDone
                          ? 'bg-white border-chem-border text-chem-dark hover:bg-chem-subtle'
                          : 'bg-chem-forest hover:bg-chem-dark text-chem-glow border-transparent shadow-subtle'
                      }`}
                    >
                      {act.isDone ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ActivitiesPage;
