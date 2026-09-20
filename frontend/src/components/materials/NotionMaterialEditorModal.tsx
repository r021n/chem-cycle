import React, { useState, useEffect } from 'react';
import { Material, Module } from '../../types/material';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-client';

interface NotionBlockItem {
  id: string;
  type: 'heading' | 'text' | 'callout' | 'image' | 'youtube';
  content?: string;
  url?: string;
  caption?: string;
  videoId?: string;
}

interface NotionMaterialEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialToEdit?: Material | null;
  modules: Module[];
}

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
];

const ICONS_PALETTE = [
  { icon: 'fa-leaf', label: 'Daun / Tumbuhan', color: 'text-chem-moss' },
  { icon: 'fa-water', label: 'Air / Hidrologi', color: 'text-sky-600' },
  { icon: 'fa-seedling', label: 'Tunas Tanah', color: 'text-emerald-600' },
  { icon: 'fa-flask', label: 'Labu Kimia', color: 'text-amber-600' },
  { icon: 'fa-atom', label: 'Struktur Atom', color: 'text-purple-600' },
  { icon: 'fa-earth-americas', label: 'Biosfer Global', color: 'text-blue-600' },
  { icon: 'fa-wind', label: 'Atmosfer & Gas', color: 'text-teal-600' },
];

export const NotionMaterialEditorModal: React.FC<NotionMaterialEditorModalProps> = ({
  isOpen,
  onClose,
  materialToEdit,
  modules,
}) => {
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Biogeokimia Global');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [coverUrl, setCoverUrl] = useState(COVER_PRESETS[0]);
  const [selectedIcon, setSelectedIcon] = useState('fa-leaf');
  const [showIconPalette, setShowIconPalette] = useState(false);
  const [estimatedReadTime, setEstimatedReadTime] = useState(5);
  const [blocks, setBlocks] = useState<NotionBlockItem[]>([]);

  useEffect(() => {
    if (materialToEdit) {
      setTitle(materialToEdit.title);
      setSelectedModuleId(materialToEdit.moduleId);
      setEstimatedReadTime(materialToEdit.estimatedReadTime || 5);
      try {
        const parsed = JSON.parse(materialToEdit.contentJson);
        if (Array.isArray(parsed)) {
          // Normalise into notion blocks
          const normalised: NotionBlockItem[] = parsed.map((b, i) => {
            if (b.type === 'heading') {
              const txt = typeof b.content === 'string' ? b.content : b.content?.[0]?.text || '';
              return { id: b.id || `blk-${i}`, type: 'heading', content: txt };
            }
            if (b.type === 'quote' || b.type === 'callout') {
              const txt = typeof b.content === 'string' ? b.content : b.content?.[0]?.text || '';
              return { id: b.id || `blk-${i}`, type: 'callout', content: txt };
            }
            if (b.type === 'image') {
              return {
                id: b.id || `blk-${i}`,
                type: 'image',
                url: b.props?.url || b.url || '',
                caption: b.props?.caption || b.caption || '',
              };
            }
            if (b.type === 'video' || b.type === 'youtube') {
              const videoId = b.videoId || (b.props?.url ? b.props.url.split('v=')[1]?.split('&')[0] || '' : '');
              return {
                id: b.id || `blk-${i}`,
                type: 'youtube',
                videoId,
                caption: b.caption || 'Video Pembelajaran',
              };
            }
            // Paragraph/text
            const txt = typeof b.content === 'string' ? b.content : b.content?.[0]?.text || '';
            return { id: b.id || `blk-${i}`, type: 'text', content: txt };
          });
          setBlocks(normalised);
        }
      } catch {
        setBlocks([
          { id: 'b-1', type: 'heading', content: materialToEdit.title },
          { id: 'b-2', type: 'text', content: 'Tulis penjelasan materi di sini...' },
        ]);
      }
    } else {
      // Clean slate for new material
      setTitle('');
      setCategory('Biogeokimia Global');
      setSelectedModuleId(modules[0]?.id || '');
      setEstimatedReadTime(5);
      setCoverUrl(COVER_PRESETS[Math.floor(Math.random() * COVER_PRESETS.length)]);
      setSelectedIcon('fa-leaf');
      setBlocks([
        {
          id: 'b-1',
          type: 'heading',
          content: 'Inersia Gas Nitrogen & Fiksasi Biologis',
        },
        {
          id: 'b-2',
          type: 'text',
          content:
            'Meskipun gas nitrogen (N₂) mendominasi 78% komposisi udara, ikatan kovalen rangkap tiga membuatnya memerlukan pengolahan biologis oleh mikroorganisme tanah.',
        },
        {
          id: 'b-3',
          type: 'callout',
          content:
            'Peran Bakteri Diazotrof: Mikroorganisme seperti Rhizobium bersimbiosis pada akar tanaman legum mengikat gas bebas menjadi nitrat terlarut.',
        },
      ]);
    }
  }, [materialToEdit, modules, isOpen]);

  // Convert NotionBlockItem[] into standard AST representation
  const serializeAst = () => {
    return blocks.map((b, idx) => {
      if (b.type === 'heading') {
        return {
          id: b.id || `h-${idx}`,
          type: 'heading',
          props: { level: 2 },
          content: [{ type: 'text', text: b.content || '' }],
        };
      }
      if (b.type === 'callout') {
        return {
          id: b.id || `c-${idx}`,
          type: 'quote',
          content: [{ type: 'text', text: b.content || '' }],
        };
      }
      if (b.type === 'image') {
        return {
          id: b.id || `img-${idx}`,
          type: 'image',
          props: { url: b.url || '', caption: b.caption || '' },
        };
      }
      if (b.type === 'youtube') {
        const fullUrl = b.videoId?.startsWith('http')
          ? b.videoId
          : `https://www.youtube.com/watch?v=${b.videoId || 'o1_Xmjvh4U8'}`;
        return {
          id: b.id || `vid-${idx}`,
          type: 'video',
          props: { url: fullUrl },
        };
      }
      return {
        id: b.id || `p-${idx}`,
        type: 'paragraph',
        content: [{ type: 'text', text: b.content || '' }],
      };
    });
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Judul modul wajib diisi');
      if (!selectedModuleId && modules.length > 0) {
        throw new Error('Pilih bab modul terkait');
      }

      const ast = serializeAst();
      const contentJson = JSON.stringify(ast);

      if (materialToEdit) {
        return api.put(`/materials/${materialToEdit.id}`, {
          title: title.trim(),
          contentJson,
          estimatedReadTime,
          moduleId: selectedModuleId || materialToEdit.moduleId,
        });
      }

      return api.post('/materials', {
        title: title.trim(),
        contentJson,
        estimatedReadTime,
        moduleId: selectedModuleId || (modules[0]?.id ?? ''),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.list });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      addToast(
        materialToEdit ? 'Modul materi berhasil diperbarui' : 'Modul materi baru berhasil disimpan',
        'success'
      );
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : (err as Error).message || 'Gagal menyimpan modul';
      addToast(msg, 'error');
    },
  });

  const randomizeCover = () => {
    const next = COVER_PRESETS[Math.floor(Math.random() * COVER_PRESETS.length)];
    setCoverUrl(next);
  };

  const addBlock = (type: NotionBlockItem['type']) => {
    const newBlock: NotionBlockItem = {
      id: `blk-${Date.now()}`,
      type,
      content:
        type === 'heading'
          ? 'Judul Sub-Topik Baru'
          : type === 'callout'
          ? 'Catatan konsep penting...'
          : type === 'text'
          ? 'Tuliskan uraian konsep kimia...'
          : '',
      url: type === 'image' ? 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80' : undefined,
      caption: type === 'image' ? 'Keterangan gambar' : undefined,
      videoId: type === 'youtube' ? 'o1_Xmjvh4U8' : undefined,
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBlock = (id: string, updates: Partial<NotionBlockItem>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  if (!isOpen) return null;

  return (
    <div
      id="notionEditorModal"
      className="fixed inset-0 z-50 bg-chem-dark/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 font-sans"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-float flex flex-col overflow-hidden border border-chem-border">
        {/* Notion Top Bar */}
        <div className="px-6 py-3 border-b border-chem-border flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-chem-ash">
            <i className="fa-solid fa-pen-nib text-chem-sage"></i>
            <span className="font-serif italic text-chem-dark text-sm">
              {materialToEdit ? 'Edit Materi Siklus' : 'Editor Materi Siklus'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="px-4 py-1.5 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className="fa-solid fa-check text-[10px]"></i>
              <span>{saveMutation.isPending ? 'Menyimpan...' : 'Simpan Modul'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-chem-ash hover:text-chem-dark rounded-lg cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Notion Canvas Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 space-y-6">
          {/* Cover Banner */}
          <div className="relative group rounded-2xl overflow-hidden h-36 bg-chem-subtle border border-chem-border">
            <img
              id="notionDocCover"
              src={coverUrl}
              alt="Notion Banner"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <button
              type="button"
              onClick={randomizeCover}
              className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white/90 hover:bg-white text-[11px] font-medium text-chem-dark rounded-lg shadow-xs backdrop-blur-xs flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-chem-sage text-xs"></i>
              <span>Ganti Sampul</span>
            </button>
          </div>

          {/* Page Icon Picker & Title */}
          <div className="space-y-2 -mt-10 relative z-10 pl-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowIconPalette(!showIconPalette)}
                className="w-14 h-14 rounded-2xl bg-white border border-chem-border shadow-subtle flex items-center justify-center text-xl text-chem-forest cursor-pointer hover:scale-105 transition-transform"
                title="Pilih Ikon Modul"
              >
                <i className={`fa-solid ${selectedIcon}`}></i>
              </button>

              {showIconPalette && (
                <div
                  id="iconPalettePicker"
                  className="p-2 bg-white border border-chem-border shadow-float rounded-2xl flex items-center gap-2"
                >
                  {ICONS_PALETTE.map((p) => (
                    <button
                      key={p.icon}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(p.icon);
                        setShowIconPalette(false);
                      }}
                      className={`p-2 hover:bg-chem-subtle rounded-xl ${p.color} cursor-pointer`}
                      title={p.label}
                    >
                      <i className={`fa-solid ${p.icon}`}></i>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              id="notionDocTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Modul Siklus..."
              className="w-full font-serif text-2xl sm:text-3xl text-chem-dark border-none outline-none focus:ring-0 px-0 bg-transparent placeholder:text-chem-ash/40"
            />

            <div className="flex flex-wrap items-center gap-4 text-xs text-chem-ash font-sans pt-1">
              <div className="flex items-center gap-2">
                <span>Kategori:</span>
                <input
                  type="text"
                  id="notionDocCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border-b border-chem-border text-chem-dark px-1 py-0.5 bg-transparent focus:outline-none focus:border-chem-sage text-xs font-sans font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <span>Bab:</span>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="border-b border-chem-border text-chem-dark bg-transparent text-xs py-0.5 focus:outline-none"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Waktu baca:</span>
                <input
                  type="number"
                  min={1}
                  value={estimatedReadTime}
                  onChange={(e) => setEstimatedReadTime(Number(e.target.value))}
                  className="w-12 border-b border-chem-border text-chem-dark px-1 py-0.5 text-xs bg-transparent focus:outline-none text-center"
                />
                <span>menit</span>
              </div>
            </div>
          </div>

          {/* Modular Blocks Controls */}
          <div className="pt-4 border-t border-chem-border/70 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-chem-ash">
                Blok Konten Modular
              </span>

              <div className="flex items-center gap-1 bg-chem-subtle p-1 rounded-xl text-xs font-sans">
                <button
                  type="button"
                  onClick={() => addBlock('heading')}
                  className="px-2.5 py-1 text-chem-dark hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-heading text-[10px]"></i> Judul
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('text')}
                  className="px-2.5 py-1 text-chem-dark hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-paragraph text-[10px]"></i> Teks
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('callout')}
                  className="px-2.5 py-1 text-chem-dark hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-circle-info text-[10px]"></i> Catatan
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image')}
                  className="px-2.5 py-1 text-chem-dark hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-regular fa-image text-[10px]"></i> Gambar
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('youtube')}
                  className="px-2.5 py-1 text-chem-dark hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-brands fa-youtube text-rose-600 text-[10px]"></i> Video
                </button>
              </div>
            </div>

            {/* Rendered Block Rows */}
            <div id="notionEditorBlocksList" className="space-y-3">
              {blocks.length === 0 ? (
                <p className="text-xs text-chem-ash text-center py-6 italic border border-dashed border-chem-border rounded-xl">
                  Belum ada blok konten. Klik tombol jenis blok di atas untuk menambahkan.
                </p>
              ) : (
                blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className="p-3.5 bg-chem-paper rounded-2xl border border-chem-border space-y-2 relative group hover:border-chem-sage/60 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] font-sans text-chem-ash">
                      <span className="font-semibold uppercase text-[10px] tracking-wider text-chem-forest">
                        Blok #{idx + 1}: {block.type.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="p-1 text-chem-ash hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Hapus blok"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>

                    {block.type === 'heading' && (
                      <input
                        type="text"
                        value={block.content || ''}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Tuliskan sub-judul materi..."
                        className="w-full font-serif text-lg text-chem-dark bg-white px-3 py-1.5 border border-chem-border rounded-xl focus:outline-none focus:border-chem-sage"
                      />
                    )}

                    {block.type === 'text' && (
                      <textarea
                        rows={3}
                        value={block.content || ''}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Tulis penjelasan ilmiah di sini..."
                        className="w-full text-xs text-chem-dark bg-white p-3 border border-chem-border rounded-xl focus:outline-none focus:border-chem-sage resize-y"
                      />
                    )}

                    {block.type === 'callout' && (
                      <div className="p-3 bg-chem-subtle/80 border-l-4 border-chem-sage rounded-r-xl space-y-1">
                        <span className="text-[10px] font-bold text-chem-moss uppercase">
                          Kotak Info / Sorotan Konsep
                        </span>
                        <textarea
                          rows={2}
                          value={block.content || ''}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Peran reaksi penting atau catatan kunci..."
                          className="w-full text-xs text-chem-dark bg-white p-2.5 border border-chem-border rounded-lg focus:outline-none"
                        />
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-2 text-xs">
                        <input
                          type="text"
                          value={block.url || ''}
                          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                          placeholder="URL Tautan Gambar (cth: https://...)"
                          className="w-full text-xs bg-white px-3 py-1.5 border border-chem-border rounded-xl focus:outline-none"
                        />
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                          placeholder="Takarir / Caption Gambar"
                          className="w-full text-xs bg-white px-3 py-1.5 border border-chem-border rounded-xl focus:outline-none italic text-chem-ash"
                        />
                      </div>
                    )}

                    {block.type === 'youtube' && (
                      <div className="space-y-2 text-xs">
                        <input
                          type="text"
                          value={block.videoId || ''}
                          onChange={(e) => updateBlock(block.id, { videoId: e.target.value })}
                          placeholder="YouTube Video ID atau URL (cth: o1_Xmjvh4U8)"
                          className="w-full text-xs bg-white px-3 py-1.5 border border-chem-border rounded-xl focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
