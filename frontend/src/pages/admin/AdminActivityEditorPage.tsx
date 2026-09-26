import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { ActivityAttachment } from '../../types/app';
import { BlockAstNode } from '../../types/material';
import {
  ArrowLeft,
  Check,
  Edit3,
  Eye,
  FileText,
  Link2,
  Paperclip,
  Save,
  Trash2,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { NotionBlockEditor } from '../../components/editor/NotionBlockEditor';
import { BlockAstViewer } from '../../components/editor/block-ast-viewer';
import { formatFileSize } from '../../lib/utils';
import { compressImageToDataUrl } from '../../lib/media';

function deriveSlug(title: string): string {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return s || 'aktivitas';
}

export const AdminActivityEditorPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const isCreateNew = !activityId || activityId === 'baru';
  const navigate = useNavigate();
  const { activities, addActivity, updateActivity } = useDataStore();

  const loadedIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Announcement States
  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);

  // Link Attachment Modal/Input State
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  // Notion Blocks
  const [blocks, setBlocks] = useState<BlockAstNode[]>([
    {
      id: 'b-init-1',
      type: 'paragraph',
      content: [{ type: 'text', text: '' }],
    },
  ]);

  // Attachments (Google Classroom style)
  const [attachments, setAttachments] = useState<ActivityAttachment[]>([]);

  // Load existing activity if editing
  useEffect(() => {
    if (isCreateNew) {
      if (loadedIdRef.current !== 'baru') {
        loadedIdRef.current = 'baru';
        setOrderIndex(activities.length + 1);
      }
      return;
    }

    if (loadedIdRef.current === activityId) return;

    const target = activities.find((a) => a.id === activityId);
    if (!target) return;

    loadedIdRef.current = activityId;
    setTitle(target.title || '');
    setIsPublished(target.isPublished);
    setOrderIndex(target.orderIndex || 1);

    if (target.attachments && Array.isArray(target.attachments)) {
      setAttachments(target.attachments);
    }

    // Parse blocks
    if (Array.isArray(target.contentJson)) {
      setBlocks(target.contentJson);
    } else if (typeof target.contentJson === 'string') {
      try {
        const parsed = JSON.parse(target.contentJson);
        if (Array.isArray(parsed)) {
          setBlocks(parsed);
        } else {
          setBlocks([
            {
              id: 'b-raw-0',
              type: 'paragraph',
              content: [{ type: 'text', text: target.contentJson }],
            },
          ]);
        }
      } catch {
        const text = target.contentJson as string;
        setBlocks([
          {
            id: 'b-raw-0',
            type: 'paragraph',
            content: [{ type: 'text', text }],
          },
        ]);
      }
    } else if (target.phenomenonIntro?.narrative) {
      // Backwards compatibility with older activity format
      setBlocks([
        {
          id: 'b-intro-1',
          type: 'heading',
          props: { level: 2 },
          content: [{ type: 'text', text: target.phenomenonIntro.title || 'Pengantar' }],
        },
        {
          id: 'b-intro-2',
          type: 'paragraph',
          content: [{ type: 'text', text: target.phenomenonIntro.narrative }],
        },
      ]);
      if (target.phenomenonIntro.imageUrl) {
        setAttachments([
          {
            id: 'att-legacy-img',
            name: 'Gambar Stimulus Fenomena',
            url: target.phenomenonIntro.imageUrl,
            type: 'image',
          },
        ]);
      }
    }
  }, [activityId, isCreateNew, activities]);

  // Handle File Upload Attachment
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      let fileUrl = '';
      if (file.type.startsWith('image/')) {
        fileUrl = await compressImageToDataUrl(file);
      } else {
        // Read file as data URL
        fileUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Gagal membaca file'));
          reader.readAsDataURL(file);
        });
      }

      const newAttachment: ActivityAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        url: fileUrl,
        size: formatFileSize(file.size),
        type: file.type.startsWith('image/') ? 'image' : 'file',
      };
      setAttachments((prev) => [...prev, newAttachment]);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Add Link Attachment
  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const newAttachment: ActivityAttachment = {
      id: `att-${Date.now()}`,
      name: linkTitle.trim() || url,
      url,
      type: 'link',
    };
    setAttachments((prev) => [...prev, newAttachment]);
    setLinkUrl('');
    setLinkTitle('');
    setShowLinkInput(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Save Announcement / Activity
  const handleSave = () => {
    const finalTitle = title.trim() || 'Aktivitas Tanpa Judul';
    const finalSlug = deriveSlug(finalTitle);

    const payload = {
      title: finalTitle,
      slug: finalSlug,
      isPublished,
      orderIndex: Number(orderIndex) || 1,
      contentJson: blocks,
      attachments,
      summary: blocks
        .map((b) => b.content?.map((c) => c.text).join('') || b.props?.text || '')
        .filter(Boolean)
        .slice(0, 2)
        .join(' '),
    };

    if (!isCreateNew && activityId) {
      updateActivity(activityId, payload);
    } else {
      const created = addActivity(payload);
      navigate(`/admin/aktivitas/${created.id}/edit`, { replace: true });
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
              to="/admin/aktivitas"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Aktivitas</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-700 truncate max-w-[160px] sm:max-w-xs">
              {title || (isCreateNew ? 'Posting Baru' : 'Edit')}
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
          /* GOOGLE CLASSROOM ANNOUNCEMENT PREVIEW */
          <article className="space-y-6 py-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-chem-forest text-white flex items-center justify-center font-bold text-sm">
                  G
                </div>
                <div>
                  <span className="font-semibold text-sm text-slate-900 block">
                    Guru Pengajar
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Pengumuman & Aktivitas Kelas
                  </span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                {title || 'Judul Pengumuman'}
              </h1>

              {/* Body */}
              <div className="prose max-w-none">
                <BlockAstViewer contentJson={blocks} />
              </div>

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Lampiran ({attachments.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-chem-forest bg-slate-50/70 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-chem-forest shrink-0">
                          {att.type === 'link' ? (
                            <Link2 className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-slate-800 block truncate group-hover:text-chem-forest">
                            {att.name}
                          </span>
                          {att.size && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {att.size}
                            </span>
                          )}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        ) : (
          /* ANNOUNCEMENT EDITOR (Notion block authoring + File attachments) */
          <div className="space-y-6">
            {/* Huge Title Input */}
            <div>
              <input
                type="text"
                value={title}
                placeholder="Bagikan sesuatu kepada kelas..."
                onChange={(e) => setTitle(e.target.value)}
                className="w-full font-serif text-3xl sm:text-4xl font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 bg-transparent p-0 leading-tight"
              />
            </div>

            <hr className="border-t border-slate-100 my-1" />

            {/* Notion Block Canvas */}
            <div className="py-2">
              <NotionBlockEditor blocks={blocks} onChange={setBlocks} />
            </div>

            <hr className="border-t border-slate-100 my-4" />

            {/* ATTACHMENTS SECTION (Google Classroom style) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Lampiran File & Tautan</span>
                </span>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3 text-slate-500" />
                    <span>{isUploading ? 'Mengunggah...' : 'Upload File'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Link2 className="w-3 h-3 text-slate-500" />
                    <span>Tautan</span>
                  </button>
                </div>
              </div>

              {/* Add Link Input Popover */}
              {showLinkInput && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="url"
                      value={linkUrl}
                      placeholder="https://..."
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage"
                    />
                    <input
                      type="text"
                      value={linkTitle}
                      placeholder="Judul tautan (opsional)..."
                      onChange={(e) => setLinkTitle(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-chem-sage"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowLinkInput(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 rounded cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-3 py-1 bg-chem-forest text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Tambahkan
                    </button>
                  </div>
                </div>
              )}

              {/* Attachment Items List */}
              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                          {att.type === 'link' ? (
                            <Link2 className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-slate-800 block truncate">
                            {att.name}
                          </span>
                          {att.size && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {att.size}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer shrink-0"
                        title="Hapus Lampiran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum ada file atau tautan yang dilampirkan.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
