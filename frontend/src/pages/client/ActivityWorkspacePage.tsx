import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import {
  ChevronRight,
  ChevronLeft,
  Home,
  FileText,
  Link2,
  ExternalLink,
  ArrowLeft,
  Paperclip,
  Image as ImageIcon,
} from 'lucide-react';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const ActivityWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities } = useDataStore();

  const published = useMemo(() => {
    return [...activities]
      .filter((a) => a.isPublished)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [activities]);

  const currentIndex = published.findIndex((a) => a.id === id || a.slug === id);
  const activity = published[currentIndex];

  const prevActivity = currentIndex > 0 ? published[currentIndex - 1] : null;
  const nextActivity = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;

  if (!activity) {
    return (
      <div className="min-h-screen bg-chem-paper lab-grid-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-chem-border text-center max-w-md space-y-4 shadow-subtle">
          <h2 className="font-serif text-xl font-bold text-chem-dark">Aktivitas Tidak Ditemukan</h2>
          <p className="text-xs text-chem-ash">
            Aktivitas yang Anda tuju mungkin belum aktif atau telah diperbarui.
          </p>
          <button
            type="button"
            onClick={() => navigate('/aktivitas')}
            className="px-5 py-2.5 bg-chem-forest text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Kembali ke Katalog Aktivitas
          </button>
        </div>
      </div>
    );
  }

  const attachments = activity.attachments || [];

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark py-8 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-chem-ash" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-chem-forest flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
            <Link to="/aktivitas" className="hover:text-chem-forest transition-colors">
              Modul Aktivitas
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-chem-border" />
            <span className="font-semibold text-chem-dark line-clamp-1 max-w-[220px]">
              {activity.title}
            </span>
          </nav>

          <Link
            to="/aktivitas"
            className="text-xs font-semibold text-chem-forest hover:text-chem-moss flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Katalog</span>
          </Link>
        </div>

        {/* Announcement Header */}
        <div className="space-y-3 pb-6 border-b border-chem-border">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-chem-sage px-2.5 py-0.5 rounded-full bg-chem-glow/60 border border-chem-sage/30">
              Aktivitas {activity.orderIndex}
            </span>
            <span className="text-xs text-chem-ash">
              {formatDate(activity.updatedAt || activity.createdAt)}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-chem-dark leading-tight">
            {activity.title}
          </h1>

          {activity.summary && (
            <p className="text-xs sm:text-sm text-chem-ash max-w-3xl leading-relaxed">
              {activity.summary}
            </p>
          )}
        </div>

        {/* Google Classroom Announcement Content */}
        {activity.contentJson && (
          <section className="bg-white rounded-3xl border border-chem-border p-6 sm:p-8 shadow-subtle">
            <div className="prose max-w-none">
              <BlockAstViewer contentJson={activity.contentJson} />
            </div>
          </section>
        )}

        {/* Attachments & Files Section */}
        {attachments.length > 0 && (
          <section className="bg-white rounded-3xl border border-chem-border p-6 sm:p-8 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-chem-border/70">
              <Paperclip className="w-4 h-4 text-chem-forest" />
              <h2 className="font-serif text-base font-bold text-chem-dark">
                Lampiran Berkas & Tautan Pendukung ({attachments.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-chem-border hover:border-chem-forest bg-chem-subtle/40 hover:bg-white transition-all group shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-chem-border flex items-center justify-center text-chem-forest shrink-0">
                    {att.type === 'link' ? (
                      <Link2 className="w-4 h-4" />
                    ) : att.type === 'image' ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-chem-dark block truncate group-hover:text-chem-forest">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-chem-ash font-mono block mt-0.5">
                      {att.type === 'link' ? 'Tautan Web' : (att.size || 'Berkas Unduhan')}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-chem-ash group-hover:text-chem-forest shrink-0" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Prev / Next Activity Navigation */}
        <nav className="pt-6 border-t border-chem-border grid grid-cols-1 sm:grid-cols-2 gap-6" aria-label="Navigasi Aktivitas">
          {prevActivity ? (
            <Link
              to={`/aktivitas/${prevActivity.id}`}
              className="group text-left"
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                <ChevronLeft className="w-3.5 h-3.5" />
                Aktivitas Sebelumnya
              </span>
              <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                {prevActivity.title}
              </span>
            </Link>
          ) : (
            <Link to="/aktivitas" className="group text-left">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                <ArrowLeft className="w-3.5 h-3.5" />
                Katalog Aktivitas
              </span>
              <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                Kembali ke Katalog Aktivitas
              </span>
            </Link>
          )}

          {nextActivity ? (
            <Link
              to={`/aktivitas/${nextActivity.id}`}
              className="group text-right sm:col-start-2"
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                Aktivitas Selanjutnya
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                {nextActivity.title}
              </span>
            </Link>
          ) : (
            <Link to="/kuis" className="group text-right sm:col-start-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chem-ash">
                Evaluasi Belajar
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <span className="block text-sm font-bold text-chem-dark group-hover:text-chem-forest transition-colors mt-1">
                Lanjut ke Latihan Soal
              </span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};
