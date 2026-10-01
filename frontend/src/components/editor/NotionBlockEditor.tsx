import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Type,
  Heading2,
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
  Sparkles,
  Minimize2,
  Maximize2,
  Link2,
} from 'lucide-react';
import { BlockAstNode, BlockInlineContent, TextAlign } from '../../types/material';
import { compressImageToDataUrl } from '../../lib/media';
import { EMBED_PLATFORM_HINT, getEmbedInfo } from '../../lib/embed';
import { segmentsPlainText } from '../../lib/rich-text';
import { cn } from '../../lib/utils';
import { RichTextEditable } from './rich-text-editable';
import { FormatToolbar } from './format-toolbar';
import { LinkCard } from './link-card';

export interface NotionBlockEditorProps {
  blocks: BlockAstNode[];
  onChange: (blocks: BlockAstNode[]) => void;
  className?: string;
  defaultViewHeight?: 'compact' | 'medium' | 'full';
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
    type: 'callout',
    label: 'Kotak Catatan',
    desc: 'Poin penting, stimulus, atau tip',
    icon: AlertCircle,
    defaultProps: { emoji: '💡' },
  },
  {
    type: 'image',
    label: 'Gambar Stimulus',
    desc: 'Upload otomatis kompres < 300KB',
    icon: ImageIcon,
  },
  {
    type: 'video',
    label: 'Video / Embed',
    desc: 'Sematkan video dari platform apa pun',
    icon: MonitorPlay,
  },
  {
    type: 'link',
    label: 'Tautan / URL',
    desc: 'Kartu tautan ke sumber luar',
    icon: Link2,
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

const CALLOUT_EMOJIS = ['💡', '⚠️', '🧪', '📌', '🔍', '📝', '❓', '⚡'];

const TEXT_BLOCK_TYPES: BlockType[] = [
  'paragraph',
  'heading',
  'callout',
  'bulletListItem',
  'numberedListItem',
  'quote',
];

function isTextBlockType(type: BlockType): boolean {
  return TEXT_BLOCK_TYPES.includes(type);
}

function getBlockText(block: BlockAstNode): string {
  const fromContent = segmentsPlainText(block.content);
  if (fromContent) return fromContent;
  if (block.props?.text) return block.props.text;
  return '';
}

function setBlockContent(block: BlockAstNode, content: BlockAstNode['content']): BlockAstNode {
  return {
    ...block,
    content,
    props: { ...block.props, text: segmentsPlainText(content) },
  };
}

function getBlockContent(block: BlockAstNode): BlockInlineContent[] {
  if (block.content && block.content.length > 0) return block.content;
  if (block.props?.text) return [{ type: 'text', text: block.props.text }];
  return [];
}

function getBlockSnippet(block: BlockAstNode): string {
  const text = getBlockText(block);
  if (text.trim()) {
    return text.replace(/\s+/g, ' ').slice(0, 65);
  }
  if (block.type === 'image') {
    return block.props?.caption || (block.props?.url ? 'Gambar terunggah' : '(Gambar belum diunggah)');
  }
  if (block.type === 'video') {
    const embed = getEmbedInfo(block.props?.url);
    if (embed) return `${embed.label} · Video`;
    return block.props?.url ? '(Tautan video belum didukung)' : '(Tautan video belum disematkan)';
  }
  if (block.type === 'link') {
    const url = block.props?.url || '';
    if (!url.trim()) return '(Tautan belum diisi)';
    return block.props?.title?.trim() || url.replace(/^https?:\/\//, '').slice(0, 65);
  }
  if (block.type === 'divider') {
    return 'Garis Pembatas Horizontal';
  }
  return '(Blok kosong)';
}

type InserterLocation =
  | { type: 'between'; index: number }
  | { type: 'quick'; index: number }
  | { type: 'bottom' }
  | null;

export const NotionBlockEditor: React.FC<NotionBlockEditorProps> = ({
  blocks,
  onChange,
  className = '',
  defaultViewHeight = 'full',
}) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [activeInserter, setActiveInserter] = useState<InserterLocation>(null);
  const [compressingIndex, setCompressingIndex] = useState<number | null>(null);
  const [mediaError, setMediaError] = useState<string>('');
  const [viewHeightMode, setViewHeightMode] = useState<'compact' | 'medium' | 'full'>(defaultViewHeight);
  const [collapsedBlockIds, setCollapsedBlockIds] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const inserterPopoverRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeInserter) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        inserterPopoverRef.current &&
        !inserterPopoverRef.current.contains(e.target as Node)
      ) {
        setActiveInserter(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveInserter(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeInserter]);

  useEffect(() => {
    if (activeMenuIndex === null) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(e.target as Node)
      ) {
        setActiveMenuIndex(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenuIndex(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuIndex]);

  const toggleBlockCollapse = (id: string) => {
    setCollapsedBlockIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allCollapsed = blocks.length > 0 && blocks.every((b) => !!collapsedBlockIds[b.id]);

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedBlockIds({});
    } else {
      const next: Record<string, boolean> = {};
      blocks.forEach((b) => {
        next[b.id] = true;
      });
      setCollapsedBlockIds(next);
    }
  };

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
    setActiveInserter(null);
  };

  const convertBlockType = (index: number, newType: BlockType) => {
    const current = blocks[index];
    const wasText = isTextBlockType(current.type);
    const willBeText = isTextBlockType(newType);
    const def = BLOCK_DEFINITIONS.find((d) => d.type === newType);

    let content = current.content;
    const nextProps = { ...(def?.defaultProps || {}), ...(current.props || {}) };
    if (willBeText && !wasText) {
      const text = getBlockText(current);
      content = [{ type: 'text', text }];
      nextProps.text = text;
    }

    const converted: BlockAstNode = {
      ...current,
      type: newType,
      props: nextProps,
      content,
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

  const renderBlockTypePicker = (
    targetIndex: number,
    title: string,
    positionClass: string = 'left-1/2 -translate-x-1/2 top-7'
  ) => (
    <div
      ref={inserterPopoverRef}
      className={cn(
        'absolute w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-40 space-y-1 text-xs text-slate-700',
        positionClass
      )}
    >
        <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <button
            type="button"
            onClick={() => setActiveInserter(null)}
            className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
          >
            Tutup
          </button>
        </div>
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {BLOCK_DEFINITIONS.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => insertBlockAt(targetIndex, item.type, item.defaultProps)}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer group/btn"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover/btn:bg-chem-forest group-hover/btn:text-white flex items-center justify-center text-slate-600 transition-colors shrink-0">
                  <ItemIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      {/* Top Density & Height View Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-chem-forest" />
          <span>Blok Konten</span>
          <span className="text-[11px] font-normal text-slate-400">({blocks.length} blok)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-500">Tinggi View:</span>
            <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setViewHeightMode('full')}
                className={cn(
                  'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                  viewHeightMode === 'full'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="Tampilan Dinamis (mengikuti panjang teks secara alami - default)"
              >
                Dinamis
              </button>
              <button
                type="button"
                onClick={() => setViewHeightMode('medium')}
                className={cn(
                  'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                  viewHeightMode === 'medium'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="Tampilan Sedang (~260px per blok)"
              >
                Sedang
              </button>
              <button
                type="button"
                onClick={() => setViewHeightMode('compact')}
                className={cn(
                  'px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                  viewHeightMode === 'compact'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="Tampilan Kompak (~140px per blok)"
              >
                Kompak
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleCollapseAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-600 cursor-pointer transition-colors"
            title="Ciutkan atau bentangkan semua blok"
          >
            {allCollapsed ? (
              <>
                <Maximize2 className="w-3 h-3 text-chem-forest" />
                <span>Bentangkan Semua</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3 h-3 text-slate-500" />
                <span>Ciutkan Semua</span>
              </>
            )}
          </button>
        </div>
      </div>

      {mediaError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
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

      {/* Block List */}
      <div className="space-y-2.5">
        {blocks.map((block, index) => {
          const def = BLOCK_DEFINITIONS.find((d) => d.type === block.type) || BLOCK_DEFINITIONS[0];
          const Icon = def.icon;
          const isCollapsed = !!collapsedBlockIds[block.id];
          const handleContentChange = (segments: BlockInlineContent[]) =>
            updateBlock(index, setBlockContent(block, segments));
          const align = block.props?.align || 'left';

          return (
            <div key={block.id || `idx-${index}`} className="space-y-2">
              {/* In-between Inserter Line on hover */}
              {index > 0 && (
                <div className="group/inserter relative py-1 flex items-center justify-center -my-1 z-10">
                  <div className="w-full border-t border-dashed border-slate-200 group-hover/inserter:border-chem-sage transition-colors" />
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInserter(
                        activeInserter?.type === 'between' && activeInserter.index === index
                          ? null
                          : { type: 'between', index }
                      )
                    }
                    className="absolute opacity-0 group-hover/inserter:opacity-100 transition-opacity bg-white hover:bg-chem-glow/50 text-slate-500 hover:text-chem-forest border border-slate-300 hover:border-chem-sage px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Sisipkan Blok di Sini</span>
                  </button>

                  {/* Inserter Popover for in-between */}
                  {activeInserter?.type === 'between' &&
                    activeInserter.index === index &&
                    renderBlockTypePicker(index, 'Sisipkan Blok Baru', 'left-1/2 -translate-x-1/2 top-6')}
                </div>
              )}

              {/* Block Card */}
              <div
                className={cn(
                  'group/block relative rounded-2xl border transition-all',
                  block.type === 'callout'
                    ? 'bg-amber-50/30 border-amber-200/60'
                    : block.type === 'divider'
                    ? 'border-dashed border-slate-200 bg-slate-50/40'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                )}
              >
                {/* Block Header with Notion Handles & Controls */}
                <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {/* Collapse / Expand Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleBlockCollapse(block.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                      title={isCollapsed ? 'Bentangkan Blok' : 'Ciutkan Blok'}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Notion Gutter Action Button with dropdown */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuIndex(activeMenuIndex === index ? null : index)
                        }
                        title="Opsi blok"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center cursor-pointer transition-colors"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Block Options Dropdown Menu */}
                      {activeMenuIndex === index && (
                        <div
                          ref={menuDropdownRef}
                          className="absolute left-7 top-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 space-y-0.5 text-xs text-slate-700"
                        >
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveBlock(index, 'up')}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                            <span>Pindah Ke Atas</span>
                          </button>
                          <button
                            type="button"
                            disabled={index === blocks.length - 1}
                            onClick={() => moveBlock(index, 'down')}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                            <span>Pindah Ke Bawah</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateBlock(index)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Duplikasi</span>
                          </button>

                          <div className="pt-1 mt-1 border-t border-slate-100">
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                              Ubah Tipe Blok
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-0.5">
                              {BLOCK_DEFINITIONS.map((item) => {
                                const ItemIcon = item.icon;
                                const isCurrent = block.type === item.type;
                                return (
                                  <button
                                    key={item.type}
                                    type="button"
                                    onClick={() => convertBlockType(index, item.type)}
                                    className={`w-full text-left px-2 py-1 rounded-lg flex items-center gap-2 cursor-pointer ${
                                      isCurrent
                                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                                        : 'hover:bg-slate-100'
                                    }`}
                                  >
                                    <ItemIcon className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="truncate">{item.label}</span>
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

                    {/* Block Type Badge */}
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shrink-0">
                      <span
                        className={cn(
                          'w-5 h-5 rounded-md flex items-center justify-center text-xs',
                          block.type === 'callout'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="tracking-tight">{def.label}</span>
                    </span>

                    {/* Snippet preview when collapsed */}
                    {isCollapsed && (
                      <span className="text-xs text-slate-400 truncate italic select-none ml-1">
                        "{getBlockSnippet(block)}"
                      </span>
                    )}
                  </div>

                  {/* Right Quick Action Controls */}
                  <div className="flex items-center gap-0.5 opacity-60 group-hover/block:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, 'up')}
                      className="p-1 text-slate-400 hover:text-chem-forest hover:bg-slate-100 rounded-md disabled:opacity-25 transition-colors cursor-pointer"
                      title="Geser Naik"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, 'down')}
                      className="p-1 text-slate-400 hover:text-chem-forest hover:bg-slate-100 rounded-md disabled:opacity-25 transition-colors cursor-pointer"
                      title="Geser Turun"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateBlock(index)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      title="Duplikasi Blok"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveInserter(
                            activeInserter?.type === 'quick' && activeInserter.index === index
                              ? null
                              : { type: 'quick', index }
                          )
                        }
                        className="p-1 text-slate-400 hover:text-chem-forest hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="Sisipkan Blok di Bawah"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* Inserter Popover for insert below */}
                      {activeInserter?.type === 'quick' &&
                        activeInserter.index === index &&
                        renderBlockTypePicker(index + 1, 'Sisipkan Blok di Bawah', 'right-full top-0 mr-2')}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteBlock(index)}
                      className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Hapus Blok"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Body Content (Hidden when collapsed, height follows viewHeightMode) */}
                {!isCollapsed && (
                  <div
                    className={cn(
                      'px-3 pb-3 pt-2 transition-all',
                      viewHeightMode === 'compact' && 'max-h-36 overflow-y-auto pr-2',
                      viewHeightMode === 'medium' && 'max-h-64 overflow-y-auto pr-2',
                      viewHeightMode === 'full' && 'max-h-none'
                    )}
                  >
                    {/* Format Toolbar (text blocks) */}
                    {isTextBlockType(block.type) && (
                      <div className="flex justify-end mb-1.5 -mt-0.5 opacity-60 hover:opacity-100 transition-opacity">
                        <FormatToolbar
                          align={align}
                          onAlign={(nextAlign: TextAlign) =>
                            updateBlock(index, {
                              ...block,
                              props: { ...block.props, align: nextAlign },
                            })
                          }
                        />
                      </div>
                    )}

                    {/* 1. PARAGRAPH */}
                    {block.type === 'paragraph' && (
                      <RichTextEditable
                        content={getBlockContent(block)}
                        onChange={handleContentChange}
                        placeholder="Ketik teks narasi materi di sini..."
                        className="text-sm md:text-base text-slate-800 leading-relaxed"
                        style={{ textAlign: align }}
                      />
                    )}

                    {/* 2. HEADING */}
                    {block.type === 'heading' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Tingkat:
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
                        <RichTextEditable
                          content={getBlockContent(block)}
                          onChange={handleContentChange}
                          placeholder="Judul bagian materi..."
                          multiline={false}
                          className={`font-serif font-bold text-slate-900 ${
                            (block.props?.level || 2) === 1
                              ? 'text-xl pt-1'
                              : (block.props?.level || 2) === 2
                              ? 'text-lg pt-0.5'
                              : 'text-base'
                          }`}
                          style={{ textAlign: align }}
                        />
                      </div>
                    )}

                    {/* 3. CALLOUT */}
                    {block.type === 'callout' && (
                      <div className="space-y-2">
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

                          <RichTextEditable
                            content={getBlockContent(block)}
                            onChange={handleContentChange}
                            placeholder="Tuliskan catatan penting, stimulus, atau perhatian khusus..."
                            className="w-full text-xs sm:text-sm text-slate-800 leading-relaxed font-sans flex-1"
                            style={{ textAlign: align }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 4. IMAGE */}
                    {block.type === 'image' && (
                      <div className="space-y-2">
                        {block.props?.url ? (
                          <div className="space-y-2">
                            <div
                              className={cn(
                                'relative rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1',
                                viewHeightMode === 'compact'
                                  ? 'max-h-28'
                                  : viewHeightMode === 'medium'
                                  ? 'max-h-48'
                                  : 'max-h-96'
                              )}
                            >
                              <img
                                src={block.props.url}
                                alt={block.props.caption || 'Gambar materi'}
                                className={cn(
                                  'w-auto object-contain',
                                  viewHeightMode === 'compact'
                                    ? 'max-h-28'
                                    : viewHeightMode === 'medium'
                                    ? 'max-h-48'
                                    : 'max-h-96'
                                )}
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
                              placeholder="Keterangan gambar (caption opsional)..."
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
                          <div className="space-y-2">
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
                              className="border-2 border-dashed border-slate-200 hover:border-chem-forest hover:bg-emerald-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors"
                            >
                              {compressingIndex === index ? (
                                <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                                  <Loader2 className="w-5 h-5 text-chem-forest animate-spin" />
                                  <span className="text-xs text-chem-forest font-medium">
                                    Mengompres gambar ke format BLOB &lt; 300 KB...
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Upload className="w-5 h-5 mx-auto text-slate-400" />
                                  <p className="text-xs font-bold text-slate-700">
                                    Klik untuk Unggah Gambar
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    Otomatis dikompresi ke &lt; 300 KB Data URL
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
                                placeholder="https://..."
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

                    {/* 5. VIDEO / EMBED (multi-platform) */}
                    {block.type === 'video' && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={block.props?.url || ''}
                          placeholder="Tempel tautan video (YouTube, TikTok, Instagram, Facebook, ...)"
                          onChange={(e) =>
                            updateBlock(index, {
                              ...block,
                              props: { ...block.props, url: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage"
                        />

                        {block.props?.url && (
                          <div className="mt-2">
                            {getEmbedInfo(block.props.url) ? (
                              <div
                                className={cn(
                                  'w-full rounded-xl overflow-hidden border border-slate-200 bg-black relative',
                                  viewHeightMode === 'compact'
                                    ? 'max-h-36 aspect-video'
                                    : 'aspect-video'
                                )}
                              >
                                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                                  {getEmbedInfo(block.props.url)!.label}
                                </span>
                                <iframe
                                  src={getEmbedInfo(block.props.url)!.embedUrl}
                                  title={`Video ${
                                    getEmbedInfo(block.props.url)!.label
                                  }`}
                                  className="w-full h-full border-0"
                                  loading="lazy"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                                URL video belum dikenali. Platform yang didukung: {EMBED_PLATFORM_HINT}.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5b. LINK / URL CARD */}
                    {block.type === 'link' && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={block.props?.url || ''}
                          placeholder="Tempel tautan URL (misal: https://sumber.belajar.id/...)"
                          onChange={(e) =>
                            updateBlock(index, {
                              ...block,
                              props: { ...block.props, url: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage font-mono"
                        />
                        <input
                          type="text"
                          value={block.props?.title || ''}
                          placeholder="Judul kartu tautan (opsional, default = nama domain)..."
                          onChange={(e) =>
                            updateBlock(index, {
                              ...block,
                              props: { ...block.props, title: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage"
                        />
                        <input
                          type="text"
                          value={block.props?.description || ''}
                          placeholder="Deskripsi singkat (opsional)..."
                          onChange={(e) =>
                            updateBlock(index, {
                              ...block,
                              props: { ...block.props, description: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-chem-sage"
                        />
                        {block.props?.url?.trim() && (
                          <LinkCard
                            url={block.props.url}
                            title={block.props.title}
                            description={block.props.description}
                          />
                        )}
                      </div>
                    )}

                    {/* 6. BULLET LIST */}
                    {block.type === 'bulletListItem' && (
                      <div className="flex items-start gap-2.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-chem-forest mt-2 shrink-0" />
                        <RichTextEditable
                          content={getBlockContent(block)}
                          onChange={handleContentChange}
                          placeholder="Poin butir..."
                          className="flex-1 text-sm md:text-base text-slate-800 leading-relaxed"
                          style={{ textAlign: align }}
                        />
                      </div>
                    )}

                    {/* 7. NUMBERED LIST */}
                    {block.type === 'numberedListItem' && (
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <RichTextEditable
                          content={getBlockContent(block)}
                          onChange={handleContentChange}
                          placeholder="Poin berurut..."
                          className="flex-1 text-sm md:text-base text-slate-800 leading-relaxed"
                          style={{ textAlign: align }}
                        />
                      </div>
                    )}

                    {/* 8. QUOTE */}
                    {block.type === 'quote' && (
                      <div className="border-l-3 border-chem-forest pl-3 py-1">
                        <RichTextEditable
                          content={getBlockContent(block)}
                          onChange={handleContentChange}
                          placeholder="Tulis kutipan atau hukum dasar kimia..."
                          className="text-sm italic text-slate-700 leading-relaxed"
                          style={{ textAlign: align }}
                        />
                      </div>
                    )}

                    {/* 9. DIVIDER */}
                    {block.type === 'divider' && (
                      <div className="py-2 flex items-center gap-3 text-slate-300">
                        <div className="flex-1 border-t border-slate-200 border-dashed" />
                        <span className="text-[10px] font-mono text-slate-400 select-none">
                          Garis Pembatas
                        </span>
                        <div className="flex-1 border-t border-slate-200 border-dashed" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Add Block Control */}
      <div className="pt-2">
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActiveInserter(
                activeInserter?.type === 'bottom' ? null : { type: 'bottom' }
              )
            }
            className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-slate-300 hover:border-chem-sage hover:bg-chem-glow/20 text-xs font-semibold text-slate-600 hover:text-chem-forest flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-chem-forest" />
            <span>Tambah Blok Baru</span>
          </button>

          {activeInserter?.type === 'bottom' &&
            renderBlockTypePicker(blocks.length, 'Pilih Tipe Blok', 'left-1/2 -translate-x-1/2 bottom-full mb-3')}
        </div>
      </div>
    </div>
  );
};
