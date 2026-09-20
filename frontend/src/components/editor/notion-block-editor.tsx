import React, { useState, useEffect, useRef } from 'react';
import { BlockAstNode } from '../../types/material';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { api } from '../../lib/api-client';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Video,
  Minus,
  Upload,
} from 'lucide-react';

interface NotionBlockEditorProps {
  initialContent?: string | BlockAstNode[];
  onChange: (blocks: BlockAstNode[], jsonString: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export const NotionBlockEditor: React.FC<NotionBlockEditorProps> = ({
  initialContent,
  onChange,
  onSave,
  isSaving = false,
}) => {
  const [blocks, setBlocks] = useState<BlockAstNode[]>(() => {
    if (!initialContent) {
      return [
        {
          id: `block-${Date.now()}`,
          type: 'heading',
          props: { level: 1 },
          content: [{ type: 'text', text: 'Judul Dokumen' }],
        },
        {
          id: `block-${Date.now() + 1}`,
          type: 'paragraph',
          content: [{ type: 'text', text: 'Tulis penjelasan materi kimia di sini...' }],
        },
      ];
    }
    try {
      if (typeof initialContent === 'string') {
        return JSON.parse(initialContent);
      }
      return initialContent;
    } catch {
      return [
        {
          id: `block-${Date.now()}`,
          type: 'paragraph',
          content: [{ type: 'text', text: String(initialContent) }],
        },
      ];
    }
  });

  const [activeSlashMenuIndex, setActiveSlashMenuIndex] = useState<number | null>(null);
  const [slashFilter, setSlashFilter] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetBlockId, setUploadTargetBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    } else {
      const timer = setTimeout(() => setSaveStatus('saved'), 400);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  const updateParent = (newBlocks: BlockAstNode[]) => {
    setBlocks(newBlocks);
    onChange(newBlocks, JSON.stringify(newBlocks));
  };

  const handleTextChange = (id: string, text: string) => {
    if (text.startsWith('/')) {
      const idx = blocks.findIndex((b) => b.id === id);
      setActiveSlashMenuIndex(idx);
      setSlashFilter(text.slice(1).toLowerCase());
    } else {
      if (activeSlashMenuIndex !== null) {
        setActiveSlashMenuIndex(null);
      }
    }

    const updated = blocks.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          content: [{ type: 'text' as const, text }],
        };
      }
      return b;
    });
    updateParent(updated);
  };

  const addBlock = (afterIndex: number, type: BlockAstNode['type'] = 'paragraph') => {
    const newBlock: BlockAstNode = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      props: type === 'heading' ? { level: 2 } : {},
      content: [{ type: 'text', text: '' }],
    };

    const updated = [...blocks];
    updated.splice(afterIndex + 1, 0, newBlock);
    updateParent(updated);
    setActiveSlashMenuIndex(null);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const updated = blocks.filter((b) => b.id !== id);
    updateParent(updated);
    setActiveSlashMenuIndex(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    updateParent(updated);
  };

  const changeBlockType = (index: number, type: BlockAstNode['type'], level?: 1 | 2 | 3) => {
    const updated = [...blocks];
    const current = updated[index];
    updated[index] = {
      ...current,
      type,
      props: {
        ...current.props,
        level: level || (type === 'heading' ? 2 : undefined),
      },
      content: current.content?.map((c) => ({
        ...c,
        text: c.text.startsWith('/') ? '' : c.text,
      })) || [{ type: 'text', text: '' }],
    };
    updateParent(updated);
    setActiveSlashMenuIndex(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetBlockId) return;

    try {
      setSaveStatus('saving');
      const res = await api.uploadImage(file);
      if (res.success && res.data?.url) {
        const updated = blocks.map((b) => {
          if (b.id === uploadTargetBlockId) {
            return {
              ...b,
              type: 'image' as const,
              props: {
                url: res.data.url,
                caption: file.name,
              },
            };
          }
          return b;
        });
        updateParent(updated);
      }
    } catch (err) {
      console.error('Upload image error:', err);
    } finally {
      setSaveStatus('saved');
      setUploadTargetBlockId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const slashCommands = [
    { label: 'Heading 1', type: 'heading' as const, level: 1 as const, icon: Heading1, desc: 'Judul Bab Utama' },
    { label: 'Heading 2', type: 'heading' as const, level: 2 as const, icon: Heading2, desc: 'Sub-Judul Bagian' },
    { label: 'Heading 3', type: 'heading' as const, level: 3 as const, icon: Heading3, desc: 'Topik Kecil' },
    { label: 'Teks Paragraf', type: 'paragraph' as const, icon: Plus, desc: 'Teks deskriptif' },
    { label: 'Daftar Poin (Bullet)', type: 'bulletListItem' as const, icon: List, desc: 'Daftar butir poin' },
    { label: 'Daftar Bernomor (Numbered)', type: 'numberedListItem' as const, icon: ListOrdered, desc: 'Langkah terurut' },
    { label: 'Kutipan / Rumus (Quote)', type: 'quote' as const, icon: Quote, desc: 'Catatan penting rumus kimia' },
    { label: 'Gambar Kimia', type: 'image' as const, icon: ImageIcon, desc: 'Struktur molekul atau foto' },
    { label: 'Video YouTube', type: 'video' as const, icon: Video, desc: 'Embed video pembelajaran' },
    { label: 'Garis Pembatas (Divider)', type: 'divider' as const, icon: Minus, desc: 'Garis pemisah section' },
  ];

  const filteredCommands = slashCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(slashFilter) || cmd.type.toLowerCase().includes(slashFilter)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-4 md:p-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 mb-6 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700">
            Editor Blok Materi
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              saveStatus === 'saving'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {saveStatus === 'saving' ? 'Menyimpan...' : 'Tersimpan di Draf'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => addBlock(blocks.length - 1, 'paragraph')}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Blok Teks
          </Button>
          {onSave && (
            <Button size="sm" variant="primary" onClick={onSave} isLoading={isSaving}>
              Simpan Materi
            </Button>
          )}
        </div>
      </div>

      {/* Editor Blocks Container */}
      <div className="space-y-4">
        {blocks.map((block, index) => {
          const rawText = block.content?.[0]?.text || '';

          return (
            <div
              key={block.id}
              className="group relative border border-transparent hover:border-slate-200 rounded-lg p-2 transition-colors"
            >
              {/* Block Side Toolbar Controls */}
              <div className="absolute -left-1 md:-left-12 top-2 flex md:flex-col items-center space-x-1 md:space-x-0 md:space-y-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-lg shadow-sm p-1 z-20">
                <button
                  type="button"
                  title="Pindah ke Atas"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Pindah ke Bawah"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Tambah Blok di Bawah"
                  onClick={() => addBlock(index)}
                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Hapus Blok"
                  onClick={() => removeBlock(block.id)}
                  disabled={blocks.length <= 1}
                  className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Block Content Rendering based on type */}
              {block.type === 'heading' && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-400 select-none">
                    H{block.props?.level || 1}
                  </span>
                  <input
                    type="text"
                    value={rawText}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    placeholder="Judul / Heading (Ketik '/' untuk menu blok)..."
                    className={`w-full font-bold text-slate-900 border-b border-slate-200 focus:border-indigo-600 focus:outline-none py-1 bg-transparent ${
                      block.props?.level === 1
                        ? 'text-2xl'
                        : block.props?.level === 2
                        ? 'text-xl'
                        : 'text-lg'
                    }`}
                  />
                </div>
              )}

              {block.type === 'paragraph' && (
                <textarea
                  value={rawText}
                  onChange={(e) => handleTextChange(block.id, e.target.value)}
                  placeholder="Tulis paragraf materi... (Ketik '/' untuk bantuan perintah)"
                  rows={2}
                  className="w-full text-sm leading-relaxed text-slate-800 border-b border-transparent focus:border-slate-300 focus:outline-none py-1 bg-transparent resize-y"
                />
              )}

              {block.type === 'bulletListItem' && (
                <div className="flex items-start space-x-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                  <input
                    type="text"
                    value={rawText}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    placeholder="Poin daftar butir..."
                    className="w-full text-sm text-slate-800 border-b border-slate-200 focus:border-indigo-600 focus:outline-none py-1 bg-transparent"
                  />
                </div>
              )}

              {block.type === 'numberedListItem' && (
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={rawText}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    placeholder="Langkah terurut..."
                    className="w-full text-sm text-slate-800 border-b border-slate-200 focus:border-indigo-600 focus:outline-none py-1 bg-transparent"
                  />
                </div>
              )}

              {block.type === 'quote' && (
                <div className="border-l-4 border-indigo-500 pl-3 bg-indigo-50/50 rounded-r-lg p-2.5">
                  <textarea
                    value={rawText}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    placeholder="Catatan penting atau formula kimia..."
                    rows={2}
                    className="w-full text-sm text-slate-800 bg-transparent focus:outline-none resize-none"
                  />
                </div>
              )}

              {block.type === 'image' && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">Blok Gambar</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setUploadTargetBlockId(block.id);
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" /> Unggah Berkas
                    </Button>
                  </div>
                  <Input
                    label="Tautan Gambar (URL)"
                    value={block.props?.url || ''}
                    placeholder="https://example.com/gambar-kimia.jpg atau /uploads/..."
                    onChange={(e) => {
                      const updated = blocks.map((b) =>
                        b.id === block.id
                          ? { ...b, props: { ...b.props, url: e.target.value } }
                          : b
                      );
                      updateParent(updated);
                    }}
                  />
                  <Input
                    label="Keterangan Gambar (Caption)"
                    value={block.props?.caption || ''}
                    placeholder="Contoh: Ilustrasi Reaksi Eksoterm Termokimia"
                    onChange={(e) => {
                      const updated = blocks.map((b) =>
                        b.id === block.id
                          ? { ...b, props: { ...b.props, caption: e.target.value } }
                          : b
                      );
                      updateParent(updated);
                    }}
                  />
                  {block.props?.url && (
                    <div className="mt-2 border border-slate-200 rounded-lg p-2 bg-white max-w-sm">
                      <img
                        src={block.props.url}
                        alt={block.props.caption || 'Preview'}
                        className="max-h-40 object-contain mx-auto rounded"
                      />
                    </div>
                  )}
                </div>
              )}

              {block.type === 'video' && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                  <span className="text-xs font-semibold text-slate-700">Blok Video YouTube</span>
                  <Input
                    label="Tautan YouTube Video"
                    value={block.props?.url || ''}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => {
                      const updated = blocks.map((b) =>
                        b.id === block.id
                          ? { ...b, props: { ...b.props, url: e.target.value } }
                          : b
                      );
                      updateParent(updated);
                    }}
                  />
                </div>
              )}

              {block.type === 'divider' && (
                <div className="py-2">
                  <hr className="border-t border-slate-200" />
                  <span className="text-[10px] text-slate-400 uppercase">
                    Garis Pemisah
                  </span>
                </div>
              )}

              {/* Slash Command Popup Menu */}
              {activeSlashMenuIndex === index && (
                <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5 max-h-60 overflow-y-auto">
                  <div className="text-[10px] font-semibold uppercase px-2.5 py-1 text-slate-400 border-b border-slate-100">
                    Pilih Jenis Blok
                  </div>
                  {filteredCommands.length === 0 ? (
                    <div className="text-xs p-2 text-slate-500">
                      Tidak ada opsi cocok
                    </div>
                  ) : (
                    filteredCommands.map((cmd) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={`${cmd.type}-${cmd.level || ''}`}
                          type="button"
                          onClick={() => changeBlockType(index, cmd.type, cmd.level)}
                          className="w-full flex items-center space-x-2.5 px-2.5 py-2 text-left text-xs rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <div className="truncate">
                            <div className="font-medium">{cmd.label}</div>
                            <div className="text-[10px] text-slate-400">{cmd.desc}</div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Quick Append */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-center">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => addBlock(blocks.length - 1, 'paragraph')}
        >
          <Plus className="w-4 h-4 mr-1" /> Tambah Blok Baru
        </Button>
      </div>
    </div>
  );
};
