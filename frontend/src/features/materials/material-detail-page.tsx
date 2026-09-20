import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { Material, Module } from '../../types/material';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Edit,
  HelpCircle,
  FolderOpen,
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

  // Fetch parent module details directly using GET /modules/:id
  const { data: currentModuleData } = useQuery({
    queryKey: queryKeys.modules.detail(material?.moduleId || ''),
    queryFn: () => api.get<{ success: boolean; data: Module }>(`/modules/${material!.moduleId}`),
    enabled: !!material?.moduleId,
  });

  const currentModule = currentModuleData?.data || material?.module;

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

  // Find previous and next materials within the module
  const moduleMaterials = currentModule?.materials || [];
  const currentIndex = moduleMaterials.findIndex((m) => m.id === material.id || m.slug === material.slug);
  const prevMaterial = currentIndex > 0 ? moduleMaterials[currentIndex - 1] : null;
  const nextMaterial = currentIndex >= 0 && currentIndex < moduleMaterials.length - 1 ? moduleMaterials[currentIndex + 1] : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="border border-slate-200 p-4 bg-white rounded-2xl shadow-xs sticky top-20 space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center">
              <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Bab Terkait
            </span>
            <Link to="/materi" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Semua
            </Link>
          </div>

          <div className="text-xs font-bold text-slate-900">
            {material.module?.title || currentModule?.title || 'Modul Pembelajaran'}
          </div>

          <nav className="space-y-1">
            {moduleMaterials.map((item, idx) => {
              const active = item.slug === material.slug || item.id === material.id;
              return (
                <Link
                  key={item.id}
                  to={`/materi/${item.slug}`}
                  className={`block px-3 py-2 text-xs rounded-lg transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            <Link to="/latihan" className="w-full">
              <Button size="sm" variant="outline" className="w-full">
                <HelpCircle className="w-3.5 h-3.5 mr-1" /> Uji Pemahaman Soal
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Reading Canvas */}
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
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Bab Sebelumnya: {prevMaterial.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextMaterial ? (
              <Link to={`/materi/${nextMaterial.slug}`} className="w-full sm:w-auto">
                <Button variant="primary" size="sm" className="w-full">
                  Bab Berikutnya: {nextMaterial.title} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
    </div>
  );
};
