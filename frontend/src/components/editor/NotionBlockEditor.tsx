import React, { useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Type,
  Heading2,
  FlaskConical,
  AlertCircle,
  Image as ImageIcon,
  MonitorPlay,
  List,
  ListOrdered,
  Quote,
  Minus,
  Upload,
  Loader2,
  X,
} from 'lucide-react';
import { BlockAstNode } from '../../types/material';
import { ChemFormula } from '../common/ChemFormula';
import { compressImageToDataUrl, getYoutubeEmbedUrl } from '../../lib/media';
import { formatFileSize } from '../../lib/utils';

export interface NotionBlockEditorProps {
  blocks: BlockAstNode[];
  onChange: (blocks: BlockAstNode[]) => void;
  className?: string;
}

type BlockType = BlockAstNode['type'];

const BLOCK_DEFINITIONS: {
  type: BlockType;
  label: string;
  desc: string;
  icon: React.ElementType;
  defaultProps?: BlockAstNode['props'];
}[] = [
  {
    type: 'paragraph',
    label: 'Teks',
    desc: 'Paragraf narasi atau penjelasan',
    icon: Type,
  },
  {
    type: 'heading',
    label: 'Subjudul',
    desc: 'Pembagi bab dan sub-topik',
    icon: Heading2,
    defaultProps: { level: 2 },
  },
  {
    type: 'formula',
    label: 'Rumus Kimia',
    desc: 'Reaksi, fasa zat, ion & entalpi',
    icon: FlaskConical,
  },
  {
    type: 'callout',
    label: 'Kotak Catatan',
    desc: 'Poin penting, stimulus, atau tip',
    icon: AlertCircle,
    defaultProps: { emoji: '💡' },
  },
  {
    type: 'image',
    label: 'Gambar',
    desc: 'Upload otomatis kompres < 300KB',
    icon: ImageIcon,
  },
  {
    type: 'video',
    label: 'Video YouTube',
    desc: 'Sematkan video pembelajaran',
    icon: MonitorPlay,
  },
  {
    type: 'bulletListItem',
    label: 'Daftar Poin',
    desc: 'Daftar butir bullet',
    icon: List,
  },
  {
    type: 'numberedListItem',
    label: 'Daftar Angka',
    desc: 'Daftar berurutan 1, 2, 3...',
    icon: ListOrdered,
  },
  {
    type: 'quote',
    label: 'Kutipan',
    desc: 'Blok kutipan atau hukum dasar',
    icon: Quote,
  },
  {
    type: 'divider',
    label: 'Pemisah',
    desc: 'Garis pembatas horizontal',
    icon: Minus,
  },
];

const QUICK_CHEM_CHIPS = [
  { label: '→', value: ' -> ' },
  { label: '⇌', value: ' <=> ' },
  { label: 'ΔH', value: ' (ΔH = kJ/mol)' },
  { label: '(s)', value: '(s)' },
  { label: '(l)', value: '(l)' },
  { label: '(g)', value: '(g)' },
  { label: '(aq)', value: '(aq)' },
  { label: '⁺', value: '^+' },
  { label: '⁻', value: '^-' },
  { label: '²⁺', value: '^2+' },
  { label: '²⁻', value: '^2-' },
  { label: '³⁺', value: '^3+' },
  { label: 'H₂O', value: 'H2O' },
  { label: 'CO₂', value: 'CO2' },
  { label: 'O₂', value: 'O2' },
];

const CALLOUT_EMOJIS = ['💡', '⚠️', '🧪', '📌', '🔍', '📝', '❓', '⚡'];

function getBlockText(block: BlockAstNode): string {
  if (block.type === 'formula') {
    return block.props?.formula || block.content?.[0]?.text || '';
  }
  if (block.props?.text) return block.props.text;
  if (block.content && block.content.length > 0) {
    return block.content.map((c) => c.text).join('');
  }
  return '';
}

function setBlockText(block: BlockAstNode, text: string): BlockAstNode {
  if (block.type === 'formula') {
    return {
      ...block,
      props: { ...block.props, formula: text },
      content: [{ type: 'text', text }],
    };
  }
  return {
    ...block,
    content: [{ type: 'text', text }],
    props: { ...block.props, text },
  };
}

export const NotionBlockEditor: React.FC<NotionBlockEditorProps> = ({
  blocks,
  onChange,
  className = '',
}) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [insertPopoverIndex, setInsertPopoverIndex] = useState<number | null>(null);
  const [compressingIndex, setCompressingIndex] = useState<number | null>(null);
  const [mediaError, setMediaError] = useState<string>('');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const updateBlock = (index: number, newBlock: BlockAstNode) => {
    const next = [...blocks];
    next[index] = newBlock;
    onChange(next);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onChange(next);
    setActiveMenuIndex(null);
  };

  const deleteBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    onChange(next);
    setActiveMenuIndex(null);
  };

  const duplicateBlock = (index: number) => {
    const original = blocks[index];
    const clone: BlockAstNode = {
      ...JSON.parse(JSON.stringify(original)),
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    const next = [...blocks];
    next.splice(index + 1, 0, clone);
    onChange(next);
    setActiveMenuIndex(null);
  };

  const insertBlockAt = (index: number, type: BlockType, defaultProps?: BlockAstNode['props']) => {
    const newBlock: BlockAstNode = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      props: defaultProps || {},
      content: [{ type: 'text', text: '' }],
    };
    const next = [...blocks];
    next.splice(index, 0, newBlock);
    onChange(next);
    setInsertPopoverIndex(null);
  };

  const convertBlockType = (index: number, newType: BlockType) => {
    const current = blocks[index];
    const text = getBlockText(current);
    const def = BLOCK_DEFINITIONS.find((d) => d.type === newType);
    const converted: BlockAstNode = {
      ...current,
      type: newType,
      props: { ...(def?.defaultProps || {}), ...(current.props || {}) },
      content: [{ type: 'text', text }],
    };
    updateBlock(index, converted);
    setActiveMenuIndex(null);
  };

  const handleImageUpload = async (index: number, file: File) => {
    setMediaError('');
    setCompressingIndex(index);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const current = blocks[index];
      updateBlock(index, {
        ...current,
        props: {
          ...current.props,
          url: dataUrl,
        },
      });
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Gagal mengompres gambar.');
    } finally {
      setCompressingIndex(null);
    }
  };

  return (
    <div className={`space-y-1 font-sans ${className}`}>
      {mediaError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{mediaError}</span>
          <button
            type="button"
            onClick={() => setMediaError('')}
            className="p-1 hover:bg-rose-100 rounded text-rose-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {blocks.map((block, index) => {
        const textValue = getBlockText(block);

        return (
          <div
            key={block.id || `idx-${index}`}
            className="group relative flex items-start -mx-4 px-4 py-1 rounded-xl hover:bg-slate-50/80 transition-colors"
          >
            {/* Notion Block Left Handle / Actions */}
            <div className="absolute -left-3 sm:-left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10">
              <button
                type="button"
                onClick={() =>
                  setInsertPopoverIndex(insertPopoverIndex === index ? null : index)
                }
                title="Sisipkan blok di sini"
                className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuIndex(activeMenuIndex === index ? null : index)
                  }
                  title="Opsi blok"
                  className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </button>

                {/* Block Options Dropdown Menu */}
                {activeMenuIndex === index && (
                  <div
                    className="absolute left-6 top-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 space-y-0.5 text-xs text-slate-700"
                    onMouseLeave={() => setActiveMenuIndex(null)}
                  >
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, 'up')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Pindah Ke Atas</span>
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, 'down')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Pindah Ke Bawah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateBlock(index)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplikasi</span>
                    </button>

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                        Ubah Tipe Blok
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-0.5">
                        {BLOCK_DEFINITIONS.map((def) => {
                          const Icon = def.icon;
                          const isCurrent = block.type === def.type;
                          return (
                            <button
                              key={def.type}
                              type="button"
                              onClick={() => convertBlockType(index, def.type)}
                              className={`w-full text-left px-2 py-1 rounded-lg flex items-center gap-2 cursor-pointer ${
                                isCurrent
                                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                                  : 'hover:bg-slate-100'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 text-slate-500" />
                              <span className="truncate">{def.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => deleteBlock(index)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Blok</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Block Content Rendering based on type */}
            <div className="w-full min-w-0 pl-3">
              {/* 1. PARAGRAPH */}
              {block.type === 'paragraph' && (
                <textarea
                  value={textValue}
                  rows={Math.max(1, textValue.split('\n').length)}
                  placeholder="Ketik teks narasi materi di sini..."
                  onChange={(e) => updateBlock(index, setBlockText(block, e.target.value))}
                  className="w-full bg-transparent border-0 p-0 text-sm md:text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0 resize-none leading-relaxed"
                />
              )}

              {/* 2. HEADING */}
              {block.type === 'heading' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Subjudul Level:
                    </span>
                    {[1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() =>
                          updateBlock(index, {
                            ...block,
                            props: { ...block.props, level: lvl as 1 | 2 | 3 },
                          })
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          (block.props?.level || 2) === lvl
                            ? 'bg-chem-forest text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        H{lvl}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={textValue}
                    placeholder="Judul bagian materi..."
                    onChange={(e) => updateBlock(index, setBlockText(block, e.target.value))}
                    className={`w-full bg-transparent border-0 p-0 font-serif font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 ${
                      (block.props?.level || 2) === 1
                        ? 'text-2xl pt-2 pb-1 border-b border-slate-100'
                        : (block.props?.level || 2) === 2
                        ? 'text-xl pt-1'
                        : 'text-lg'
                    }`}
                  />
                </div>
              )}

              {/* 3. FORMULA KIMIA */}
              {block.type === 'formula' && (
                <div className="rounded-2xl border border-chem-border/70 bg-chem-subtle/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-chem-forest flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Persamaan Kimia / Reaksi</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Live Chemistry Preview</span>
                  </div>

                  <input
                    type="text"
                    value={textValue}
                    placeholder="misal: CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l) (ΔH = -890.4 kJ/mol)"
                    onChange={(e) => updateBlock(index, setBlockText(block, e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage"
                  />

                  {/* Quick symbol chips */}
                  <div className="flex flex-wrap gap-1">
                    {QUICK_CHEM_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() =>
                          updateBlock(index, setBlockText(block, textValue + chip.value))
                        }
                        className="px-2 py-0.5 text-[11px] font-mono bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Live Render */}
                  {textValue && (
                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-chem-forest font-semibold text-sm font-mono overflow-x-auto">
                      <ChemFormula formula={textValue} />
                    </div>
                  )}

                  <input
                    type="text"
                    value={block.props?.caption || ''}
                    placeholder="Keterangan rumus reaksi (opsional)..."
                    onChange={(e) =>
                      updateBlock(index, {
                        ...block,
                        props: { ...block.props, caption: e.target.value },
                      })
                    }
                    className="w-full text-[11px] text-slate-500 bg-transparent border-0 p-0 focus:outline-none italic placeholder:text-slate-300"
                  />
                </div>
              )}

              {/* 4. CALLOUT */}
              {block.type === 'callout' && (
                <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-3.5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    {/* Emoji Selector */}
                    <div className="relative group/emoji shrink-0">
                      <button
                        type="button"
                        className="text-xl leading-none p-1 rounded hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Ganti ikon emoji"
                      >
                        {block.props?.emoji || '💡'}
                      </button>
                      <div className="hidden group-hover/emoji:flex absolute left-0 top-8 bg-white border border-slate-200 shadow-lg rounded-xl p-1.5 gap-1 z-20">
                        {CALLOUT_EMOJIS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() =>
                              updateBlock(index, {
                                ...block,
                                props: { ...block.props, emoji: em },
                              })
                            }
                            className="text-lg p-1 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={textValue}
                      rows={Math.max(1, textValue.split('\n').length)}
                      placeholder="Tuliskan catatan penting, stimulus, atau perhatian khusus..."
                      onChange={(e) => updateBlock(index, setBlockText(block, e.target.value))}
                      className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm text-slate-800 placeholder:text-amber-700/40 focus:outline-none focus:ring-0 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* 5. IMAGE */}
              {block.type === 'image' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Gambar Stimulus / Modul</span>
                    </span>
                    {block.props?.url && block.props.url.startsWith('data:') && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                        {formatFileSize(block.props.url.length * 0.75)} (terkompresi)
                      </span>
                    )}
                  </div>

                  {block.props?.url ? (
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white max-h-80 flex items-center justify-center">
                        <img
                          src={block.props.url}
                          alt={block.props.caption || 'Gambar materi'}
                          className="max-h-80 w-auto object-contain"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(index, {
                              ...block,
                              props: { ...block.props, url: '' },
                            })
                          }
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg cursor-pointer transition-colors"
                          title="Hapus Gambar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={block.props?.caption || ''}
                        placeholder="Keterangan gambar (caption)..."
                        onChange={(e) =>
                          updateBlock(index, {
                            ...block,
                            props: { ...block.props, caption: e.target.value },
                          })
                        }
                        className="w-full text-center text-xs text-slate-500 bg-transparent border-0 p-1 focus:outline-none placeholder:text-slate-300 italic"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        ref={(el) => {
                          fileInputRefs.current[block.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                          e.target.value = '';
                        }}
                      />

                      <div
                        onClick={() => fileInputRefs.current[block.id]?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-chem-forest hover:bg-emerald-50/20 rounded-xl p-5 text-center cursor-pointer transition-colors"
                      >
                        {compressingIndex === index ? (
                          <div className="flex flex-col items-center justify-center gap-2 py-2">
                            <Loader2 className="w-6 h-6 text-chem-forest animate-spin" />
                            <span className="text-xs text-chem-forest font-medium">
                              Mengompres gambar ke format BLOB &lt; 300 KB...
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-6 h-6 mx-auto text-slate-400" />
                            <p className="text-xs font-bold text-slate-700">
                              Klik untuk Unggah Gambar
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Otomatis dikompresi ke &lt; 300 KB Data URL untuk penyimpanan ringan
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          atau URL eksternal:
                        </span>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                updateBlock(index, {
                                  ...block,
                                  props: { ...block.props, url: val },
                                });
                              }
                            }
                          }}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. VIDEO YOUTUBE */}
              {block.type === 'video' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <MonitorPlay className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sematkan Video YouTube</span>
                    </span>
                  </div>

                  <input
                    type="url"
                    value={block.props?.url || ''}
                    placeholder="Tempel tautan video YouTube (misal: https://youtu.be/...)"
                    onChange={(e) =>
                      updateBlock(index, {
                        ...block,
                        props: { ...block.props, url: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage"
                  />

                  {block.props?.url && (
                    <div className="mt-2">
                      {getYoutubeEmbedUrl(block.props.url) ? (
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-black">
                          <iframe
                            src={getYoutubeEmbedUrl(block.props.url)!}
                            title="Video YouTube"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                          Format URL YouTube tidak dikenali. Pastikan URL berasal dari youtube.com atau youtu.be.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 7. BULLET LIST */}
              {block.type === 'bulletListItem' && (
                <div className="flex items-start gap-2.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-chem-forest mt-2 shrink-0" />
                  <textarea
                    value={textValue}
                    rows={Math.max(1, textValue.split('\n').length)}
                    placeholder="Poin butir..."
                    onChange={(e) => updateBlock(index, setBlockText(block, e.target.value))}
                    className="w-full bg-transparent border-0 p-0 text-sm md:text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* 8. NUMBERED LIST */}
              {block.type === 'numberedListItem' && (
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <textarea
                    value={textValue}
                    rows={Math.max(1, textValue.split('\n').length)}
                    placeholder="Poin berurut..."
                    onChange={(e) => updateBlock(index, setBlockText(block, e.target.value))}
                    className="w-full bg-transparent border-0 p-0 text-sm md:text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* 9. QUOTE */}
              {block.type === 'quote' && (
                <div className="border-l-3 border-chem-forest pl-3 py-1">
                  <textarea
                    value={textValue}
                    rows={Math.max(1, textValue.split('\n').length)}
                    placeholder="Tulis kutipan atau hukum dasar kimia..."
                    onChange={(e) => updateBlock(index, setBlockText(block, e.target.value))}
                    className="w-full bg-transparent border-0 p-0 text-sm italic text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* 10. DIVIDER */}
              {block.type === 'divider' && (
                <div className="py-2">
                  <hr className="border-t border-slate-200" />
                </div>
              )}
            </div>

            {/* In-between Inserter Popover Modal */}
            {insertPopoverIndex === index && (
              <div
                className="absolute left-4 top-8 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 space-y-1 text-xs text-slate-700"
                onMouseLeave={() => setInsertPopoverIndex(null)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sisipkan Blok Baru
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {BLOCK_DEFINITIONS.map((def) => {
                    const Icon = def.icon;
                    return (
                      <button
                        key={def.type}
                        type="button"
                        onClick={() => insertBlockAt(index, def.type, def.defaultProps)}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer group/btn"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover/btn:bg-chem-forest group-hover/btn:text-white flex items-center justify-center text-slate-600 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 leading-tight">
                            {def.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {def.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Add Block Control */}
      <div className="pt-2">
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setInsertPopoverIndex(
                insertPopoverIndex === blocks.length ? null : blocks.length
              )
            }
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-200 hover:border-chem-forest hover:bg-slate-50 text-xs text-slate-500 hover:text-chem-forest flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Blok Baru</span>
          </button>

          {insertPopoverIndex === blocks.length && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 space-y-1 text-xs text-slate-700"
              onMouseLeave={() => setInsertPopoverIndex(null)}
            >
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Tipe Blok
              </div>
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {BLOCK_DEFINITIONS.map((def) => {
                  const Icon = def.icon;
                  return (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() =>
                        insertBlockAt(blocks.length, def.type, def.defaultProps)
                      }
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer group/btn"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover/btn:bg-chem-forest group-hover/btn:text-white flex items-center justify-center text-slate-600 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {def.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{def.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
