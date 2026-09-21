import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Material, UpdateMaterialPayload, CreateMaterialPayload } from '../../types/material';
import { NotionBlockEditor } from '../../components/editor/notion-block-editor';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { useUiStore } from '../../stores/ui-store';
import { ArrowLeft, Eye, Save } from 'lucide-react';

export const MaterialEditorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const isCreate = !slug;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [readTime, setReadTime] = useState(10);
  const [isPublished, setIsPublished] = useState(true);
  const [contentJson, setContentJson] = useState('[]');

  // Fetch current material (edit mode only)
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.materials.detail(slug || ''),
    queryFn: () => api.get<{ success: boolean; data: Material }>(`/materials/${slug}`),
    enabled: !!slug,
  });

  const material = data?.data;

  useEffect(() => {
    if (material) {
      setTitle(material.title);
      setSummary(material.summary || '');
      setReadTime(material.estimatedReadTime || 10);
      setIsPublished(material.isPublished);
      setContentJson(material.contentJson);
    }
  }, [material]);

  const createMutation = useMutation({
    mutationFn: (body: CreateMaterialPayload) =>
      api.post<{ success: boolean; data: Material }>('/materials', body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.list });
      addToast('Materi berhasil dibuat dan dipublikasikan', 'success');
      navigate(`/materi/${res.data.slug}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal membuat materi';
      addToast(msg, 'error');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (body: UpdateMaterialPayload) => api.put(`/materials/${material?.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.detail(slug || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.list });
      addToast('Materi berhasil disimpan dan dipublikasikan', 'success');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal memperbarui materi';
      addToast(msg, 'error');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!title.trim()) {
      addToast('Judul materi wajib diisi', 'error');
      return;
    }

    const payload = {
      title,
      summary: summary || null,
      estimatedReadTime: Number(readTime) || 10,
      isPublished,
      contentJson,
    };

    if (isCreate) {
      createMutation.mutate(payload);
    } else if (material?.id) {
      updateMutation.mutate(payload);
    }
  };

  if (!isCreate && isLoading) {
    return <Spinner label="Membuka editor materi..." />;
  }

  if (!isCreate && !material) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chem-paper p-4">
        <div className="border border-chem-border p-8 text-center bg-white rounded-2xl max-w-lg shadow-xs">
          <h2 className="text-xl font-bold text-chem-dark">Materi Tidak Ditemukan</h2>
          <Button variant="primary" onClick={() => navigate('/materi')} className="mt-4">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chem-paper font-sans">
      {/* Fullscreen Top Bar */}
      <div className="sticky top-0 z-40 border-b border-chem-border bg-white/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Link to="/materi">
              <Button size="sm" variant="outline">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Daftar Materi
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-serif font-bold text-chem-dark">
                {isCreate ? 'Buat Materi Baru' : 'Editor Materi Pembelajaran'}
              </h1>
              <span className="text-[11px] text-chem-ash font-medium">
                {isCreate ? 'Susun catatan materi siklus' : `Mengedit: ${material?.title || ''}`}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isCreate && material && (
              <Link to={`/materi/${material.slug}`}>
                <Button size="sm" variant="secondary">
                  <Eye className="w-3.5 h-3.5 mr-1" /> Pratinjau
                </Button>
              </Link>
            )}
            <Button size="sm" variant="primary" onClick={handleSave} isLoading={isSaving}>
              <Save className="w-3.5 h-3.5 mr-1" />
              {isCreate ? 'Simpan Materi' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Canvas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Metadata Configuration */}
        <div className="border border-chem-border rounded-xl p-5 bg-white shadow-subtle grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Judul Halaman Materi"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Estimasi Waktu Baca (Menit)"
              type="number"
              min={1}
              value={readTime}
              onChange={(e) => setReadTime(Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-3">
            <Input
              label="Ringkasan / Abstrak Materi"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ringkasan poin utama materi..."
            />
          </div>
        </div>

        {/* Notion Block Editor */}
        <NotionBlockEditor
          initialContent={isCreate ? undefined : material?.contentJson}
          onChange={(_blocks, json) => setContentJson(json)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};

export default MaterialEditorPage;