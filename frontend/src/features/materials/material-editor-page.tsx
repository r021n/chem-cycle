import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Material, UpdateMaterialPayload } from '../../types/material';
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

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [readTime, setReadTime] = useState(10);
  const [isPublished, setIsPublished] = useState(true);
  const [contentJson, setContentJson] = useState('[]');

  // Fetch current material
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

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (body: UpdateMaterialPayload) => api.put(`/materials/${material?.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.detail(slug || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.list });
      addToast('Materi berhasil disimpan dan dipublikasikan', 'success');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal memperbarui materi';
      addToast(msg, 'error');
    },
  });

  const handleSave = () => {
    if (!material?.id) return;
    updateMutation.mutate({
      title,
      summary: summary || null,
      estimatedReadTime: Number(readTime) || 10,
      isPublished,
      contentJson,
    });
  };

  if (isLoading) {
    return <Spinner label="Membuka editor materi..." />;
  }

  if (!material) {
    return (
      <div className="border border-slate-200 p-8 text-center bg-white rounded-2xl max-w-lg mx-auto shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Materi Tidak Ditemukan</h2>
        <Button variant="primary" onClick={() => navigate('/materi')} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div className="flex items-center space-x-3">
          <Link to={`/materi/${material.slug}`}>
            <Button size="sm" variant="outline">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Tampilan Siswa
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Editor Materi Pembelajaran
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              Modul: {material.module?.title || 'Bab Terkait'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={`/materi/${material.slug}`}>
            <Button size="sm" variant="secondary">
              <Eye className="w-3.5 h-3.5 mr-1" /> Pratinjau
            </Button>
          </Link>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            isLoading={updateMutation.isPending}
          >
            <Save className="w-3.5 h-3.5 mr-1" /> Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Metadata Configuration */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
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
            placeholder="Ringkasan poin utama bab..."
          />
        </div>
      </div>

      {/* Notion Block Editor */}
      <NotionBlockEditor
        initialContent={material.contentJson}
        onChange={(_blocks, json) => setContentJson(json)}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
};
