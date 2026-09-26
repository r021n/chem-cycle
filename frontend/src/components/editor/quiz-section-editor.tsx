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
  FlaskConical,
  Heading2,
  AlertCircle,
  Minus,
  GripVertical,
  Copy,
  Plus,
  Sparkles,
} from 'lucide-react';
import { QuizSection, QuizSectionType } from '../../types/app';
import { compressImageToDataUrl, getYoutubeEmbedUrl } from '../../lib/media';
import { formatFileSize, cn } from '../../lib/utils';
import { ChemFormula } from '../common/ChemFormula';

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
  formula: {
    label: 'Persamaan Kimia',
    icon: FlaskConical,
    hint: 'Rumus reaksi, termokimia & ionik dengan live preview',
    category: 'Sains',
    badge: 'Formula',
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
    label: 'Video YouTube',
    icon: MonitorPlay,
    hint: 'Sematkan video penjelasan/fenomena',
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
  divider: {
    label: 'Garis Pembatas',
    icon: Minus,
    hint: 'Pemisah garis horizontal',
    category: 'Dasar',
  },
};

const QUICK_CHEM_CHIPS: { label: string; value: string; desc: string }[] = [
  { label: '→', value: ' -> ', desc: 'Panah reaksi' },
  { label: '⇌', value: ' <=> ', desc: 'Reaksi bolak-balik' },
  { label: 'ΔH', value: ' (ΔH = kJ/mol)', desc: 'Entalpi' },
  { label: '(s)', value: '(s)', desc: 'Padat' },
  { label: '(l)', value: '(l)', desc: 'Cair' },
  { label: '(g)', value: '(g)', desc: 'Gas' },
  { label: '(aq)', value: '(aq)', desc: 'Larutan' },
  { label: '⁺', value: '^+', desc: 'Kation' },
  { label: '⁻', value: '^-', desc: 'Anion' },
  { label: '²⁺', value: '^2+', desc: 'Ion +2' },
  { label: '²⁻', value: '^2-', desc: 'Ion -2' },
  { label: '³⁺', value: '^3+', desc: 'Ion +3' },
  { label: '°C', value: '°C', desc: 'Suhu' },
  { label: 'kJ', value: ' kJ', desc: 'Kilojoule' },
  { label: 'H₂O', value: 'H2O', desc: 'Air' },
  { label: 'CO₂', value: 'CO2', desc: 'Karbon dioksida' },
  { label: 'O₂', value: 'O2', desc: 'Oksigen' },
];

const CALLOUT_EMOJIS = ['💡', '⚠️', '🧪', '📌', '🔍', '📝', '❓', '⚡'];

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
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConvertMenuOpen, setIsConvertMenuOpen] = useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);

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

  const insertSymbolIntoFormula = (symbol: string) => {
    if (section.type !== 'formula') return;
    const input = formulaInputRef.current;
    if (!input) {
      onChange({ ...section, formula: (section.formula || '') + symbol });
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const current = section.formula || '';
    const updated = current.substring(0, start) + symbol + current.substring(end);
    onChange({ ...section, formula: updated });

    window.setTimeout(() => {
      input.focus();
      const nextPos = start + symbol.length;
      input.setSelectionRange(nextPos, nextPos);
    }, 10);
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
    if (section.type === 'text' || section.type === 'callout' || section.type === 'heading') {
      currentText = section.text || '';
    } else if (section.type === 'formula') {
      currentText = section.formula || '';
    }

    switch (targetType) {
      case 'text':
        onChange({ id: section.id, type: 'text', text: currentText });
        break;
      case 'formula':
        onChange({ id: section.id, type: 'formula', formula: currentText, caption: '' });
        break;
      case 'heading':
        onChange({ id: section.id, type: 'heading', text: currentText, level: 2 });
        break;
      case 'callout':
        onChange({ id: section.id, type: 'callout', text: currentText, emoji: '💡' });
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
    }

    setIsConvertMenuOpen(false);
    setIsMenuOpen(false);
  };

  const renderBody = () => {
    switch (section.type) {
      case 'text':
        return (
          <textarea
            rows={2}
            value={section.text}
            onChange={(e) => onChange({ ...section, text: e.target.value })}
            placeholder="Tulis teks stimulus, pengantar kasus, atau kalimat soal..."
            className="w-full text-sm text-slate-800 leading-relaxed bg-transparent resize-y focus:outline-none placeholder:text-slate-400 font-sans"
          />
        );

      case 'formula':
        return (
          <div className="space-y-3">
            {/* Input & Helper toolbar */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  ref={formulaInputRef}
                  type="text"
                  value={section.formula}
                  onChange={(e) => onChange({ ...section, formula: e.target.value })}
                  placeholder="Contoh: CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l) (ΔH = -890.4 kJ)"
                  className="w-full text-xs sm:text-sm font-mono p-3 pr-8 bg-slate-50 border border-chem-sage/40 rounded-xl focus:outline-none focus:border-chem-forest focus:ring-1 focus:ring-chem-sage text-slate-900"
                />
              </div>

              {/* Chemistry Symbols Palette */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-chem-sage" /> Simbol Cepat:
                </span>
                {QUICK_CHEM_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    title={chip.desc}
                    onClick={() => insertSymbolIntoFormula(chip.value)}
                    className="px-2 py-1 bg-white hover:bg-chem-glow/50 hover:text-chem-forest border border-slate-200 hover:border-chem-sage rounded-lg text-xs font-mono font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Visual Chemical Formula Preview */}
            <div className="rounded-xl border border-chem-sage/30 bg-chem-glow/20 p-3.5 flex flex-col items-center justify-center text-center space-y-1.5 transition-all">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-chem-forest/80">
                Pratinjau Live Persamaan Reaksi
              </span>
              {section.formula?.trim() ? (
                <div className="overflow-x-auto max-w-full py-1">
                  <ChemFormula
                    formula={section.formula}
                    className="text-base sm:text-lg font-bold text-chem-forest"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Ketik persamaan atau klik tombol simbol di atas untuk melihat rumus terformat otomatis...
                </span>
              )}
            </div>

            {/* Optional caption */}
            <input
              type="text"
              value={section.caption || ''}
              onChange={(e) => onChange({ ...section, caption: e.target.value })}
              placeholder="Keterangan rumus/reaksi kimia (opsional)..."
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage text-slate-700"
            />
          </div>
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
            <input
              type="text"
              value={section.text}
              onChange={(e) => onChange({ ...section, text: e.target.value })}
              placeholder="Tuliskan teks subjudul..."
              className={cn(
                'w-full bg-transparent focus:outline-none text-slate-900 font-bold',
                section.level === 3 ? 'text-base font-sans' : 'text-lg font-serif'
              )}
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
            <div className="flex items-start gap-2.5">
              <span className="text-xl leading-none mt-1 select-none">
                {section.emoji || '💡'}
              </span>
              <textarea
                rows={2}
                value={section.text}
                onChange={(e) => onChange({ ...section, text: e.target.value })}
                placeholder="Tulis catatan, petunjuk soal, atau fakta penting di sini..."
                className="w-full text-xs sm:text-sm text-amber-950 bg-transparent resize-y focus:outline-none placeholder:text-amber-700/60 leading-relaxed font-sans"
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
                  className="w-full max-h-64 object-contain rounded-lg bg-white shadow-2xs"
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
        section.type === 'formula'
          ? 'bg-emerald-50/20 border-emerald-200/80 shadow-2xs'
          : section.type === 'callout'
          ? 'bg-amber-50/30 border-amber-200/60'
          : section.type === 'divider'
          ? 'border-transparent bg-transparent'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
      )}
    >
      {/* Top Block Header with Notion Handles */}
      <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5">
        <div className="flex items-center gap-2">
          {/* Notion Gutter Action Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Menu Aksi Blok"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            {/* Notion Action Menu Popover */}
            {isMenuOpen && (
              <div className="absolute z-30 left-0 mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 space-y-1 text-xs text-slate-700">
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
              <div className="absolute z-30 left-0 mt-1 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 space-y-1 text-xs">
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
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span
              className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center text-xs',
                section.type === 'formula'
                  ? 'bg-emerald-100 text-emerald-800'
                  : section.type === 'callout'
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
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-0.5 opacity-40 group-hover/block:opacity-100 transition-opacity">
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
          {onInsertBelow && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsInsertMenuOpen(!isInsertMenuOpen)}
                className="p-1 text-slate-400 hover:text-chem-forest hover:bg-slate-100 rounded cursor-pointer"
                title="Sisipkan Blok di Bawah"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {isInsertMenuOpen && (
                <div className="absolute z-30 right-0 mt-1 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 space-y-1 text-xs">
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
            className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
            title="Hapus Blok"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block Body Content */}
      <div className="px-3 pb-3 pt-1">{renderBody()}</div>
    </div>
  );
};
