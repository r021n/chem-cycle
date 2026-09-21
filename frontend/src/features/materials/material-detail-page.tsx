import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Material } from '../../types/material';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Edit,
  HelpCircle,
} from 'lucide-react';

export const MaterialDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // Fetch current material
  const { data: materialData, isLoading: loadingMaterial, isError } = useQuery({
    queryKey: queryKeys.materials.detail(slug || ''),
    queryFn: () => api.get<{ success: boolean; data: Material }>(`/materials/${slug}`),
    enabled: !!slug,
  });

  const material = materialData?.data;

  // Fetch all materials for prev / next navigation
  const { data: listData } = useQuery({
    queryKey: queryKeys.materials.list,
    queryFn: () => api.get<{ success: boolean; data: Material[] }>('/materials'),
  });

  const allMaterials = listData?.data || [];

  if (loadingMaterial) {
    return <Spinner label="Membuka materi pembelajaran..." />;
  }

  if (isError || !material) {
    return (
      <div className="border border-slate-200 p-8 text-center bg-white rounded-2xl max-w-lg mx-auto space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Materi Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">
          Materi dengan alamat '{slug}' tidak tersedia atau telah dihapus.
        </p>
        <Button variant="primary" onClick={() => navigate('/materi')}>
          Kembali ke Daftar Materi
        </Button>
      </div>
    );
  }

  // Find previous and next materials
  const currentIndex = allMaterials.findIndex((m) => m.id === material.id || m.slug === material.slug);
  const prevMaterial = currentIndex > 0 ? allMaterials[currentIndex - 1] : null;
  const nextMaterial =
    currentIndex >= 0 && currentIndex < allMaterials.length - 1
      ? allMaterials[currentIndex + 1]
      : null;

  return (
    <div className="flex-1 min-w-0">
      <article className="border border-slate-200 p-6 md:p-10 bg-white rounded-2xl shadow-xs max-w-[760px] mx-auto space-y-6">
        {/* Header Metadata */}
        <div className="border-b border-slate-100 pb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500 font-medium flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" /> {material.estimatedReadTime || 10} Menit Waktu Baca
            </span>

            {isAdmin && (
              <Link to={`/materi/${material.slug}/edit`}>
                <Button size="sm" variant="outline">
                  <Edit className="w-3.5 h-3.5 mr-1" /> Edit Materi
                </Button>
              </Link>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {material.title}
          </h1>

          {material.summary && (
            <p className="text-sm text-slate-700 bg-indigo-50/50 p-3.5 rounded-r-lg border-l-4 border-indigo-500">
              {material.summary}
            </p>
          )}
        </div>

        {/* AST Content Viewer */}
        <div className="py-2">
          <BlockAstViewer contentJson={material.contentJson} />
        </div>

        {/* Bottom Prev / Next Navigation Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {prevMaterial ? (
            <Link to={`/materi/${prevMaterial.slug}`} className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Sebelumnya: {prevMaterial.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextMaterial ? (
            <Link to={`/materi/${nextMaterial.slug}`} className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                Berikutnya: {nextMaterial.title} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <Link to="/latihan" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                Lanjut ke Latihan Soal <HelpCircle className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          )}
        </div>
      </article>
    </div>
  );
};

export default MaterialDetailPage;