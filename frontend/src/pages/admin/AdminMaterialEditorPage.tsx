import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { BlockAstNode } from '../../types/material';
import {
  ArrowLeft,
  Check,
  Eye,
  Edit3,
  Image as ImageIcon,
  Save,
  Trash2,
} from 'lucide-react';
import { NotionBlockEditor } from '../../components/editor/NotionBlockEditor';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { compressImageToDataUrl } from '../../lib/media';

function deriveSlug(title: string): string {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return s || 'materi';
}

export const AdminMaterialEditorPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const isCreateNew = !materialId || materialId === 'baru';
  const navigate = useNavigate();
  const { materials, addMaterial, updateMaterial } = useDataStore();

  const loadedIdRef = useRef<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [coverError, setCoverError] = useState('');

  // Minimal Blog States
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);

  // Notion Blocks
  const [blocks, setBlocks] = useState<BlockAstNode[]>([
    {
      id: 'b-init-1',
      type: 'paragraph',
      content: [{ type: 'text', text: '' }],
    },
  ]);

  // Load existing material if editing
  useEffect(() => {
    if (isCreateNew) {
      if (loadedIdRef.current !== 'baru') {
        loadedIdRef.current = 'baru';
        setOrderIndex(materials.length + 1);
      }
      return;
    }

    if (loadedIdRef.current === materialId) return;

    const existing = materials.find((m) => m.id === materialId);
    if (!existing) return;

    loadedIdRef.current = materialId;
    setTitle(existing.title || '');
    setSummary(existing.summary || '');
    setCoverUrl(existing.coverUrl || '');
    setIsPublished(existing.isPublished);
    setOrderIndex(existing.orderIndex || 1);

    // Parse blocks
    if (Array.isArray(existing.contentJson)) {
      setBlocks(existing.contentJson);
    } else if (typeof existing.contentJson === 'string') {
      try {
        const parsed = JSON.parse(existing.contentJson);
        if (Array.isArray(parsed)) {
          setBlocks(parsed);
        } else {
          setBlocks([
            {
              id: 'b-raw-0',
              type: 'paragraph',
              content: [{ type: 'text', text: existing.contentJson }],
            },
          ]);
        }
      } catch {
        const lines = (existing.contentJson as string).split('\n\n').filter(Boolean);
        setBlocks(
          lines.map((l, i) => ({
            id: `b-raw-${i}`,
            type: 'paragraph',
            content: [{ type: 'text', text: l }],
          }))
        );
      }
    }
  }, [materialId, isCreateNew, materials]);

  // Handle Cover Upload
  const handleCoverUpload = async (file: File) => {
    setCoverError('');
    setIsCompressingCover(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setCoverUrl(dataUrl);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Gagal memproses gambar sampul.');
    } finally {
      setIsCompressingCover(false);
    }
  };

  // Save Material (Pure Blog)
  const handleSave = () => {
    const finalTitle = title.trim() || 'Materi Tanpa Judul';
    const finalSlug = deriveSlug(finalTitle);

    const payload = {
      title: finalTitle,
      slug: finalSlug,
      summary: summary.trim(),
      coverUrl,
      orderIndex: Number(orderIndex) || 1,
      isPublished,
      contentJson: blocks,
    };

    if (!isCreateNew && materialId) {
      updateMaterial(materialId, payload);
    } else {
      const created = addMaterial(payload);
      navigate(`/admin/materi/${created.id}/edit`, { replace: true });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-28">
      {/* Top Minimalist Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              to="/admin/materi"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Materi</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-700 truncate max-w-[160px] sm:max-w-xs">
              {title || (isCreateNew ? 'Draf Baru' : 'Edit')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Tab switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tulis</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pratinjau</span>
              </button>
            </div>

            {/* Published Toggle */}
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {isPublished ? 'Terbit' : 'Draf'}
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-chem-forest hover:bg-chem-moss text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-chem-glow" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-8">
        {activeTab === 'preview' ? (
          /* PURE BLOG PREVIEW (Medium / Notion Reading View) */
          <article className="space-y-8 py-4">
            {coverUrl && (
              <div className="h-60 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                {title || 'Judul Materi'}
              </h1>
              {summary && (
                <p className="text-base sm:text-lg text-slate-500 leading-relaxed font-sans">
                  {summary}
                </p>
              )}
            </div>

            {/* Blog Post Body */}
            <div className="prose max-w-none">
              <BlockAstViewer contentJson={blocks} />
            </div>
          </article>
        ) : (
          /* PURE BLOG EDITOR (Medium / Notion Authoring View) */
          <div className="space-y-6">
            {/* Optional Cover Image */}
            <div className="group relative">
              {coverUrl ? (
                <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={coverUrl} alt="Sampul" className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Ganti Sampul</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="px-3 py-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-xl text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 py-1 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>+ Tambah Sampul</span>
                </button>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                  e.target.value = '';
                }}
              />
              {isCompressingCover && (
                <div className="text-xs text-chem-forest mt-1">
                  Mengompresi gambar &lt; 300 KB...
                </div>
              )}
              {coverError && <div className="text-xs text-rose-600 mt-1">{coverError}</div>}
            </div>

            {/* Seamless Huge Blog Title Input */}
            <div>
              <input
                type="text"
                value={title}
                placeholder="Judul Materi..."
                onChange={(e) => setTitle(e.target.value)}
                className="w-full font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 bg-transparent p-0 leading-tight"
              />
            </div>

            {/* Subtitle / Excerpt (Optional) */}
            <div>
              <input
                type="text"
                value={summary}
                placeholder="Tuliskan subjudul atau ringkasan singkat (opsional)..."
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-base sm:text-lg text-slate-500 placeholder:text-slate-300 border-none outline-none focus:ring-0 bg-transparent p-0"
              />
            </div>

            <hr className="border-t border-slate-100 my-2" />

            {/* Notion Block Canvas */}
            <div className="pt-2">
              <NotionBlockEditor blocks={blocks} onChange={setBlocks} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
