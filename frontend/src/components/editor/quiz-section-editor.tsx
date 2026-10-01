import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Image as ImageIcon,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Pilcrow,
  Trash2,
  MonitorPlay,
  Heading2,
  AlertCircle,
  Minus,
  GripVertical,
  Copy,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  QuizSection,
  QuizSectionType,
  QuizSectionText,
  QuizSectionHeading,
  QuizSectionCallout,
} from '../../types/app';
import { TextAlign, BlockInlineContent } from '../../types/material';
import { compressImageToDataUrl } from '../../lib/media';
import { EMBED_PLATFORM_HINT, getEmbedInfo } from '../../lib/embed';
import { segmentsPlainText } from '../../lib/rich-text';
import { formatFileSize, cn } from '../../lib/utils';
import { RichTextEditable } from './rich-text-editable';
import { FormatToolbar } from './format-toolbar';
import { LinkCard } from './link-card';

export interface QuizSectionEditorProps {
  section: QuizSection;
  index: number;
  total: number;
  onChange: (section: QuizSection) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onInsertBelow?: (type: QuizSectionType) => void;
  onConvertType?: (newType: QuizSectionType) => void;
  viewHeightMode?: 'compact' | 'medium' | 'full';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const BLOCK_METAS: Record<
  QuizSectionType,
  { label: string; icon: React.ElementType; hint: string; category: string; badge?: string }
> = {
  text: {
    label: 'Teks Biasa',
    icon: Pilcrow,
    hint: 'Paragraf narasi atau pertanyaan',
    category: 'Dasar',
  },
  heading: {
    label: 'Subjudul',
    icon: Heading2,
    hint: 'Pemisah bagian atau konteks soal',
    category: 'Dasar',
  },
  callout: {
    label: 'Kotak Catatan',
    icon: AlertCircle,
    hint: 'Petunjuk, info penting, atau stimulus khusus',
    category: 'Dasar',
  },
  image: {
    label: 'Gambar Stimulus',
    icon: ImageIcon,
    hint: 'Otomatis kompresi < 300 KB BLOB',
    category: 'Media',
  },
  youtube: {
    label: 'Video / Embed',
    icon: MonitorPlay,
    hint: 'YouTube, TikTok, Instagram, Facebook, dll.',
    category: 'Media',
  },
  orderedList: {
    label: 'Daftar Berurut',
    icon: ListOrdered,
    hint: 'Poin bernomor 1, 2, 3...',
    category: 'Daftar',
  },
  unorderedList: {
    label: 'Daftar Berbutir',
    icon: List,
    hint: 'Poin butir / bullet points',
    category: 'Daftar',
  },
  link: {
    label: 'Tautan / URL',
    icon: Link2,
    hint: 'Kartu tautan ke sumber luar',
    category: 'Media',
  },
  divider: {
    label: 'Garis Pembatas',
    icon: Minus,
    hint: 'Pemisah garis horizontal',
    category: 'Dasar',
  },
};

const CALLOUT_EMOJIS = ['💡', '⚠️', '🧪', '📌', '🔍', '📝', '❓', '⚡'];

type RichQuizSection = QuizSectionText | QuizSectionHeading | QuizSectionCallout;

function getSectionContent(section: RichQuizSection): BlockInlineContent[] {
  if (section.content && section.content.length > 0) return section.content;
  if (section.text) return [{ type: 'text', text: section.text }];
  return [];
}

function getSectionSnippet(section: QuizSection): string {
  if (section.type === 'text' || section.type === 'heading' || section.type === 'callout') {
    const plain =
      segmentsPlainText(section.content) || (section.text ? String(section.text) : '');
    return plain ? plain.replace(/\s+/g, ' ').slice(0, 65) : '(Teks kosong)';
  }
  if (section.type === 'image') {
    return section.caption || (section.dataUrl ? 'Gambar stimulus' : '(Gambar belum diunggah)');
  }
  if (section.type === 'youtube') {
    const embed = getEmbedInfo(section.url);
    if (embed) return `${embed.label} · Video`;
    return section.url ? '(Tautan video belum didukung)' : '(Tautan video kosong)';
  }
  if (section.type === 'link') {
    if (!section.url.trim()) return '(Tautan kosong)';
    return section.title?.trim() || section.url.replace(/^https?:\/\//, '').slice(0, 65);
  }
  if (section.type === 'orderedList' || section.type === 'unorderedList') {
    const items = (section.items || []).filter(Boolean);
    return items.length > 0 ? items.join(', ').slice(0, 65) : '(Daftar butir kosong)';
  }
  if (section.type === 'divider') {
    return 'Garis Pembatas';
  }
  return '(Blok kosong)';
}

export const QuizSectionEditor: React.FC<QuizSectionEditorProps> = ({
  section,
  index,
  total,
  onChange,
  onMove,
  onDelete,
  onDuplicate,
  onInsertBelow,
  onConvertType,
  viewHeightMode = 'full',
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const insertMenuRef = useRef<HTMLDivElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConvertMenuOpen, setIsConvertMenuOpen] = useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);

  // Close menus on outside click or Escape
  useEffect(() => {
    if (!isMenuOpen && !isConvertMenuOpen && !isInsertMenuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (isMenuOpen || isConvertMenuOpen) {
        if (menuRef.current && !menuRef.current.contains(target)) {
          setIsMenuOpen(false);
          setIsConvertMenuOpen(false);
        }
      }
      if (isInsertMenuOpen) {
        if (insertMenuRef.current && !insertMenuRef.current.contains(target)) {
          setIsInsertMenuOpen(false);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsConvertMenuOpen(false);
        setIsInsertMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, isConvertMenuOpen, isInsertMenuOpen]);

  const meta = BLOCK_METAS[section.type] || BLOCK_METAS.text;
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

  const convertBlock = (targetType: QuizSectionType) => {
    if (targetType === section.type) {
      setIsConvertMenuOpen(false);
      return;
    }

    if (onConvertType) {
      onConvertType(targetType);
      setIsConvertMenuOpen(false);
      setIsMenuOpen(false);
      return;
    }

    // Default conversion fallback
    let currentText = '';
    let currentContent: BlockInlineContent[] | undefined;
    let currentAlign: TextAlign | undefined;
    if (section.type === 'text' || section.type === 'callout' || section.type === 'heading') {
      currentText = section.text || '';
      currentContent = section.content;
      currentAlign = section.align;
    }
    const carryContent =
      targetType === 'text' || targetType === 'heading' || targetType === 'callout'
        ? { content: currentContent, align: currentAlign }
        : {};

    switch (targetType) {
      case 'text':
        onChange({ id: section.id, type: 'text', text: currentText, ...carryContent });
        break;
      case 'heading':
        onChange({ id: section.id, type: 'heading', text: currentText, level: 2, ...carryContent });
        break;
      case 'callout':
        onChange({ id: section.id, type: 'callout', text: currentText, emoji: '💡', ...carryContent });
        break;
      case 'orderedList':
        onChange({ id: section.id, type: 'orderedList', items: currentText ? [currentText] : [''] });
        break;
      case 'unorderedList':
        onChange({ id: section.id, type: 'unorderedList', items: currentText ? [currentText] : [''] });
        break;
      case 'divider':
        onChange({ id: section.id, type: 'divider' });
        break;
      case 'image':
        onChange({ id: section.id, type: 'image', dataUrl: '', caption: currentText });
        break;
      case 'youtube':
        onChange({ id: section.id, type: 'youtube', url: '' });
        break;
      case 'link':
        onChange({ id: section.id, type: 'link', url: '' });
        break;
    }

    setIsConvertMenuOpen(false);
    setIsMenuOpen(false);
  };

  const renderRichToolbar = (target: RichQuizSection) => (
    <div className="flex justify-end mb-1.5 opacity-60 hover:opacity-100 transition-opacity">
      <FormatToolbar
        align={target.align || 'left'}
        onAlign={(a) => onChange({ ...target, align: a })}
      />
    </div>
  );

  const renderBody = () => {
    switch (section.type) {
      case 'text':
        return (
          <>
            {renderRichToolbar(section)}
            <RichTextEditable
              content={getSectionContent(section)}
              onChange={(segments) =>
                onChange({ ...section, content: segments, text: segmentsPlainText(segments) })
              }
              placeholder="Tulis teks stimulus, pengantar kasus, atau kalimat soal..."
              className="w-full text-sm text-slate-800 leading-relaxed font-sans"
              style={{ textAlign: section.align || 'left' }}
            />
          </>
        );

      case 'heading':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={section.level || 2}
                onChange={(e) =>
                  onChange({ ...section, level: Number(e.target.value) as 2 | 3 })
                }
                className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 cursor-pointer"
              >
                <option value={2}>H2 · Subjudul Utama</option>
                <option value={3}>H3 · Subjudul Kecil</option>
              </select>
            </div>
            {renderRichToolbar(section)}
            <RichTextEditable
              content={getSectionContent(section)}
              onChange={(segments) =>
                onChange({ ...section, content: segments, text: segmentsPlainText(segments) })
              }
              placeholder="Tuliskan teks subjudul..."
              multiline={false}
              className={cn(
                'w-full bg-transparent focus:outline-none text-slate-900 font-bold',
                section.level === 3 ? 'text-base font-sans' : 'text-lg font-serif'
              )}
              style={{ textAlign: section.align || 'left' }}
            />
          </div>
        );

      case 'callout':
        return (
          <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Pilih Ikon:
              </span>
              {CALLOUT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onChange({ ...section, emoji })}
                  className={cn(
                    'w-6 h-6 rounded-md text-xs flex items-center justify-center transition-all cursor-pointer',
                    (section.emoji || '💡') === emoji
                      ? 'bg-amber-200 ring-2 ring-amber-400 scale-110'
                      : 'hover:bg-amber-100'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {renderRichToolbar(section)}
            <div className="flex items-start gap-2.5">
              <span className="text-xl leading-none mt-1 select-none">
                {section.emoji || '💡'}
              </span>
              <RichTextEditable
                content={getSectionContent(section)}
                onChange={(segments) =>
                  onChange({ ...section, content: segments, text: segmentsPlainText(segments) })
                }
                placeholder="Tulis catatan, petunjuk soal, atau fakta penting di sini..."
                className="w-full text-xs sm:text-sm text-amber-950 leading-relaxed font-sans flex-1"
                style={{ textAlign: section.align || 'left' }}
              />
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="py-2 flex items-center gap-3 text-slate-300">
            <div className="flex-1 border-t border-slate-200 border-dashed" />
            <span className="text-[10px] font-mono text-slate-400 select-none">Garis Pembatas</span>
            <div className="flex-1 border-t border-slate-200 border-dashed" />
          </div>
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
                  className={cn(
                    'w-full object-contain rounded-lg bg-white shadow-2xs',
                    viewHeightMode === 'compact'
                      ? 'max-h-28'
                      : viewHeightMode === 'medium'
                      ? 'max-h-48'
                      : 'max-h-64'
                  )}
                />
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{formatFileSize(byteSize)} (terkompresi, maks 300 KB BLOB)</span>
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
                  placeholder="Keterangan / label gambar (opsional)..."
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
                    <span className="text-xs font-semibold">Unggah Gambar Stimulus</span>
                    <span className="text-[10px]">Otomatis dikompres &lt; 300 KB dan tersimpan dalam bank soal</span>
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
        const embed = getEmbedInfo(section.url);
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="url"
                value={section.url}
                onChange={(e) => onChange({ ...section, url: e.target.value })}
                placeholder="Tempel tautan video (YouTube, TikTok, Instagram, Facebook, ...)"
                className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage font-mono"
              />
            </div>
            {embed ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 relative">
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                  {embed.label}
                </span>
                <div className="aspect-video w-full">
                  <iframe
                    src={embed.embedUrl}
                    title={`Pratinjau video ${embed.label}`}
                    loading="lazy"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : section.url.trim() ? (
              <p className="text-[11px] text-amber-600">
                URL belum dikenali. Platform yang didukung: {EMBED_PLATFORM_HINT}.
              </p>
            ) : null}
          </div>
        );
      }

      case 'link':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="url"
                value={section.url}
                onChange={(e) => onChange({ ...section, url: e.target.value })}
                placeholder="Tempel tautan URL (misal: https://sumber.belajar.id/...)"
                className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage font-mono"
              />
            </div>
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => onChange({ ...section, title: e.target.value })}
              placeholder="Judul kartu tautan (opsional, default = nama domain)..."
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage"
            />
            <input
              type="text"
              value={section.description || ''}
              onChange={(e) => onChange({ ...section, description: e.target.value })}
              placeholder="Deskripsi singkat (opsional)..."
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage"
            />
            {section.url.trim() && (
              <LinkCard
                url={section.url}
                title={section.title}
                description={section.description}
              />
            )}
          </div>
        );

      case 'orderedList':
      case 'unorderedList': {
        const Marker = section.type === 'orderedList' ? ListOrdered : List;
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const items = [...section.items];
                      items.splice(itemIdx + 1, 0, '');
                      onChange({ ...section, items });
                    }
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
              className="text-[11px] font-semibold text-chem-forest hover:text-chem-moss px-2 py-1 rounded-lg hover:bg-chem-glow/50 cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Butir</span>
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
        'group/block relative rounded-2xl border transition-all',
        section.type === 'callout'
          ? 'bg-amber-50/30 border-amber-200/60'
          : section.type === 'divider'
          ? 'border-transparent bg-transparent'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
      )}
    >
      {/* Top Block Header with Notion Handles */}
      <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Collapse / Expand Toggle Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              title={isCollapsed ? 'Bentangkan Blok' : 'Ciutkan Blok'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Notion Gutter Action Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Menu Aksi Blok"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>

            {/* Notion Action Menu Popover */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute z-30 left-7 top-0 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 space-y-1 text-xs text-slate-700"
              >
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    onMove('up');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer text-left"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pindahkan ke Atas</span>
                </button>
                <button
                  type="button"
                  disabled={index === total - 1}
                  onClick={() => {
                    onMove('down');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer text-left"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pindahkan ke Bawah</span>
                </button>
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicate();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-left"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Duplikat Blok</span>
                  </button>
                )}
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsConvertMenuOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-chem-forest" />
                  <span>Ubah Tipe Blok...</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Blok</span>
                </button>
              </div>
            )}

            {/* Notion "Turn into" Submenu */}
            {isConvertMenuOpen && (
              <div
                ref={menuRef}
                className="absolute z-30 left-7 top-0 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 space-y-1 text-xs"
              >
                <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ubah Blok Menjadi:
                </span>
                {(Object.keys(BLOCK_METAS) as QuizSectionType[]).map((t) => {
                  const item = BLOCK_METAS[t];
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => convertBlock(t)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left cursor-pointer transition-colors',
                        t === section.type
                          ? 'bg-chem-glow/50 text-chem-forest font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <ItemIcon className="w-4 h-4 text-slate-500" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-chem-forest text-white px-1.5 py-0.2 rounded font-mono">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Block Type Badge */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shrink-0">
            <span
              className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center text-xs',
                section.type === 'callout'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="tracking-tight">{meta.label}</span>
            {meta.badge && (
              <span className="text-[10px] px-1.5 py-0.2 bg-chem-glow/70 border border-chem-sage/30 text-chem-forest rounded font-mono font-semibold">
                {meta.badge}
              </span>
            )}
          </span>

          {/* Snippet preview when collapsed */}
          {isCollapsed && (
            <span className="text-xs text-slate-400 truncate italic select-none ml-1">
              "{getSectionSnippet(section)}"
            </span>
          )}
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-0.5 opacity-60 group-hover/block:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove('up')}
            className="p-1 text-slate-400 hover:text-chem-forest hover:bg-slate-100 rounded-md disabled:opacity-25 transition-colors cursor-pointer"
            title="Geser Naik"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove('down')}
            className="p-1 text-slate-400 hover:text-chem-forest hover:bg-slate-100 rounded-md disabled:opacity-25 transition-colors cursor-pointer"
            title="Geser Turun"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
              title="Duplikasi Blok"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onInsertBelow && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsInsertMenuOpen(!isInsertMenuOpen)}
                className="p-1 text-slate-400 hover:text-chem-forest hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                title="Sisipkan Blok di Bawah"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {isInsertMenuOpen && (
                <div
                  ref={insertMenuRef}
                  className="absolute z-30 right-full top-0 mr-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 space-y-1 text-xs"
                >
                  <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Sisipkan Blok di Bawah:
                  </span>
                  {(Object.keys(BLOCK_METAS) as QuizSectionType[]).map((t) => {
                    const item = BLOCK_METAS[t];
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          onInsertBelow(t);
                          setIsInsertMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        <ItemIcon className="w-4 h-4 text-slate-500" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] bg-chem-forest text-white px-1.5 py-0.2 rounded font-mono">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            title="Hapus Blok"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block Body Content (Hidden when collapsed) */}
      {!isCollapsed && (
        <div
          className={cn(
            'px-3 pb-3 pt-2 transition-all',
            viewHeightMode === 'compact' && 'max-h-36 overflow-y-auto pr-2',
            viewHeightMode === 'medium' && 'max-h-64 overflow-y-auto pr-2',
            viewHeightMode === 'full' && 'max-h-none'
          )}
        >
          {renderBody()}
        </div>
      )}
    </div>
  );
};
