import React, { useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Pilcrow,
  Trash2,
  MonitorPlay,
} from 'lucide-react';
import { QuizSection } from '../../types/app';
import { compressImageToDataUrl, getYoutubeEmbedUrl } from '../../lib/media';
import { formatFileSize, cn } from '../../lib/utils';

interface QuizSectionEditorProps {
  section: QuizSection;
  index: number;
  total: number;
  onChange: (section: QuizSection) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
}

const SECTION_META: Record<QuizSection['type'], { label: string; icon: React.ElementType }> = {
  text: { label: 'Tulisan Biasa', icon: Pilcrow },
  image: { label: 'Gambar', icon: ImageIcon },
  youtube: { label: 'Link YouTube', icon: MonitorPlay },
  orderedList: { label: 'Daftar Berurut', icon: ListOrdered },
  unorderedList: { label: 'Daftar Berbutir', icon: List },
};

export const QuizSectionEditor: React.FC<QuizSectionEditorProps> = ({
  section,
  index,
  total,
  onChange,
  onMove,
  onDelete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const meta = SECTION_META[section.type];
  const Icon = meta.icon;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMediaError('');
    setIsCompressing(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      onChange({ ...section, type: 'image', dataUrl } as QuizSection);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Gagal memproses gambar.');
    } finally {
      setIsCompressing(false);
    }
  };

  const renderBody = () => {
    switch (section.type) {
      case 'text':
        return (
          <textarea
            rows={2}
            value={section.text}
            onChange={(e) => onChange({ ...section, text: e.target.value })}
            placeholder="Tuliskan teks soal, petunjuk, atau penjelasan..."
            className="w-full text-sm text-slate-800 leading-relaxed bg-transparent resize-y focus:outline-none placeholder:text-slate-400"
          />
        );

      case 'image': {
        const byteSize = section.dataUrl
          ? Math.round((section.dataUrl.length - (section.dataUrl.indexOf(',') + 1)) * 0.75)
          : 0;
        return (
          <div className="space-y-2">
            {section.dataUrl ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 space-y-2">
                <img
                  src={section.dataUrl}
                  alt={section.caption || 'Pratinjau gambar'}
                  className="w-full max-h-64 object-contain rounded-lg bg-white"
                />
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{formatFileSize(byteSize)} (terkompresi, maks 300 KB)</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-chem-sage text-slate-600 cursor-pointer"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...section, type: 'image', dataUrl: '' })}
                      className="px-2 py-1 rounded-md bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer"
                    >
                      Hapus Gambar
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={section.caption || ''}
                  onChange={(e) => onChange({ ...section, caption: e.target.value })}
                  placeholder="Keterangan gambar (opsional)"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-chem-sage hover:bg-chem-glow/30 text-slate-500 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-chem-forest" />
                    <span className="text-xs font-semibold">Mengompres gambar di bawah 300 KB...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 text-chem-sage" />
                    <span className="text-xs font-semibold">Unggah Gambar</span>
                    <span className="text-[10px]">Otomatis dikompres &lt; 300 KB, disimpan sebagai BLOB</span>
                  </>
                )}
              </button>
            )}
            {mediaError && <p className="text-[11px] text-rose-600">{mediaError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        );
      }

      case 'youtube': {
        const embedUrl = getYoutubeEmbedUrl(section.url);
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="url"
                value={section.url}
                onChange={(e) => onChange({ ...section, url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage font-mono"
              />
            </div>
            {embedUrl ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                <div className="aspect-video w-full">
                  <iframe
                    src={embedUrl}
                    title="Pratinjau video YouTube"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : section.url.trim() ? (
              <p className="text-[11px] text-amber-600">
                URL belum dikenali sebagai link YouTube yang valid.
              </p>
            ) : null}
          </div>
        );
      }

      case 'orderedList':
      case 'unorderedList': {
        const Marker =
          section.type === 'orderedList' ? ListOrdered : List;
        return (
          <div className="space-y-2">
            {section.items.map((item, itemIdx) => (
              <div key={itemIdx} className="flex items-start gap-2">
                <span className="mt-2 shrink-0 w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-600 flex items-center justify-center">
                  {section.type === 'orderedList' ? itemIdx + 1 : <Marker className="w-3 h-3" />}
                </span>
                <textarea
                  rows={1}
                  value={item}
                  onChange={(e) => {
                    const items = [...section.items];
                    items[itemIdx] = e.target.value;
                    onChange({ ...section, items });
                  }}
                  placeholder={`Butir daftar ke-${itemIdx + 1}...`}
                  className="flex-1 text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg resize-y focus:outline-none focus:border-chem-sage"
                />
                <button
                  type="button"
                  disabled={section.items.length <= 1}
                  onClick={() =>
                    onChange({ ...section, items: section.items.filter((_, i) => i !== itemIdx) })
                  }
                  className="p-1.5 mt-1 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30 cursor-pointer"
                  title="Hapus Butir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...section, items: [...section.items, ''] })}
              className="text-[11px] font-semibold text-chem-forest hover:text-chem-moss px-2 py-1 rounded-lg hover:bg-chem-glow/50 cursor-pointer"
            >
              + Tambah Butir
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'group/section rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors',
        section.type === 'text' && 'bg-transparent border-transparent hover:border-slate-200'
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Icon className="w-3.5 h-3.5" />
          {meta.label}
        </span>
        <div className="flex items-center gap-0.5 opacity-60 group-hover/section:opacity-100 transition-opacity">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove('up')}
            className="p-1 text-slate-400 hover:text-chem-forest hover:bg-slate-100 rounded disabled:opacity-25 cursor-pointer"
            title="Geser Naik"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove('down')}
            className="p-1 text-slate-400 hover:text-chem-forest hover:bg-slate-100 rounded disabled:opacity-25 cursor-pointer"
            title="Geser Turun"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
            title="Hapus Blok"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="px-3 pb-3">{renderBody()}</div>
    </div>
  );
};
