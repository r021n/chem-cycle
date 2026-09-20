import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { DiscussionPost } from '../../types/discussion';
import { PostCard } from './post-card';

export const DiscussionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch discussions feed
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.discussions.feed(1),
    queryFn: () =>
      api.get<{
        success: boolean;
        data: {
          posts: DiscussionPost[];
          pagination: { page: number; limit: number; hasMore: boolean };
        };
      }>('/discussions/posts'),
  });

  const posts = data?.data?.posts || [];

  // Create Post Mutation
  const createPostMutation = useMutation({
    mutationFn: (body: { content: string; mediaUrl?: string | null }) =>
      api.post('/discussions/posts', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.feed(1) });
      addToast('Postingan diskusi berhasil dibagikan', 'success');
      setContent('');
      setMediaUrl(null);
      setImageUrlInput('');
      setShowImageInput(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal memposting diskusi';
      addToast(msg, 'error');
    },
  });

  // Delete Post Mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => api.delete(`/discussions/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.feed(1) });
      addToast('Postingan diskusi berhasil dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus postingan';
      addToast(msg, 'error');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await api.uploadImage(file);
      if (res.success && res.data?.url) {
        setMediaUrl(res.data.url);
        addToast('Foto berhasil diunggah', 'success');
      }
    } catch {
      addToast('Gagal mengunggah foto', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const finalMediaUrl = mediaUrl || (imageUrlInput.trim() ? imageUrlInput.trim() : null);

    createPostMutation.mutate({
      content: content.trim(),
      mediaUrl: finalMediaUrl,
    });
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Yakin ingin menghapus postingan ini?')) {
      deletePostMutation.mutate(postId);
    }
  };

  const authorInitials = user?.fullName?.[0]?.toUpperCase() || 'U';

  return (
    <section id="page-diskusi" className="page-view max-w-xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-chem-border">
        <h2 className="font-serif text-2xl sm:text-3xl text-chem-dark">Komunitas Diskusi</h2>
        <p className="text-xs text-chem-ash mt-0.5">
          Ruang percakapan saintifik, tanya jawab materi daur alam, dan dokumentasi riset siswa.
        </p>
      </div>

      {/* Social Post Creator Box (Section 4.6.1) */}
      <div className="bg-white rounded-2xl border border-chem-border p-4 shadow-subtle space-y-3">
        <form onSubmit={handlePostSubmit} className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <div
              id="postAuthorAvatar"
              className="w-9 h-9 rounded-full bg-chem-forest text-chem-glow text-xs flex items-center justify-center font-bold shrink-0 shadow-xs"
            >
              {authorInitials}
            </div>

            <input
              type="text"
              id="discussionInputText"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bagikan pemikiran atau pertanyaan siklus hari ini..."
              className="w-full text-xs px-4 py-2.5 bg-chem-subtle/70 rounded-full border border-chem-border focus:bg-white focus:outline-none focus:border-chem-sage transition-all text-chem-dark placeholder:text-chem-ash/60"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-chem-border/70 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="flex items-center gap-1.5 text-chem-ash hover:text-chem-forest transition-colors cursor-pointer"
              >
                <i className="fa-regular fa-image text-chem-sage"></i>
                <span className="text-[11px] font-medium">Sertakan Gambar (URL)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-1.5 text-chem-ash hover:text-chem-forest transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-upload text-chem-sage text-[10px]"></i>
                <span className="text-[11px] font-medium">
                  {uploadingImage ? 'Mengunggah...' : 'Unggah Foto'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={createPostMutation.isPending}
              className="px-5 py-1.5 bg-chem-forest hover:bg-chem-dark text-chem-glow font-bold text-xs rounded-full shadow-subtle transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane text-[10px]"></i>
              <span>{createPostMutation.isPending ? 'Mengirim...' : 'Bagikan'}</span>
            </button>
          </div>

          {/* Dynamic Image Input Field */}
          {showImageInput && (
            <div id="discussionImageInputBox" className="pt-2">
              <input
                type="text"
                id="discussionImageUrl"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Masukkan URL tautan gambar (Unsplash atau langsung)..."
                className="w-full text-xs px-3 py-2 bg-chem-subtle/50 border border-chem-border rounded-xl focus:bg-white focus:outline-none focus:border-chem-sage text-chem-dark"
              />
            </div>
          )}

          {/* Uploaded media preview */}
          {mediaUrl && (
            <div className="relative rounded-xl overflow-hidden border border-chem-border bg-chem-subtle max-h-48 flex items-center justify-center">
              <img src={mediaUrl} alt="Preview" className="max-h-48 object-contain" />
              <button
                type="button"
                onClick={() => setMediaUrl(null)}
                className="absolute top-2 right-2 p-1 bg-chem-dark/70 hover:bg-chem-dark text-white rounded-full transition-colors"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Social Posts Stream */}
      <div id="discussionStreamContainer" className="space-y-5">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-chem-ash">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-chem-sage border-t-transparent rounded-full animate-spin"></div>
            Memuat aliran percakapan komunitas...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-chem-border text-xs text-chem-ash">
            Belum ada postingan diskusi. Mulailah percakapan pertama Anda di atas!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onDeletePost={handleDeletePost} />
          ))
        )}
      </div>
    </section>
  );
};

export default DiscussionsPage;
