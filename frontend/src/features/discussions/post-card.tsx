import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-client';
import { DiscussionPost, DiscussionComment } from '../../types/discussion';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils';
import { CommentItem } from './comment-thread';
import { Heart, MessageSquare, Trash2, Send } from 'lucide-react';

interface PostCardProps {
  post: DiscussionPost;
  onDeletePost: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDeletePost }) => {
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const isOwner = user?.id === post.author.id || user?.role === 'admin';

  // Fetch comments for this post
  const { data: commentsData, isLoading: loadingComments } = useQuery({
    queryKey: queryKeys.discussions.comments(post.id),
    queryFn: () =>
      api.get<{ success: boolean; data: DiscussionComment[] }>(
        `/discussions/posts/${post.id}/comments`
      ),
    enabled: showComments,
  });

  const comments = commentsData?.data || [];

  // Toggle Like Mutation
  const toggleLikeMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; data: { hasLiked: boolean; likeCount: number } }>(
        `/discussions/posts/${post.id}/like`
      ),
    onMutate: () => {
      // Optimistic update
      setHasLiked((prev) => !prev);
      setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
    },
    onError: () => {
      // Revert if failed
      setHasLiked(post.hasLiked);
      setLikeCount(post.likeCount);
      addToast('Gagal menyukai postingan', 'error');
    },
    onSuccess: (res) => {
      setHasLiked(res.data.hasLiked);
      setLikeCount(res.data.likeCount);
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: (payload: { content: string; parentCommentId?: string }) =>
      api.post(`/discussions/posts/${post.id}/comments`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.comments(post.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.feed() });
      setNewCommentText('');
      addToast('Komentar berhasil ditambahkan', 'success');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal mengirim komentar';
      addToast(msg, 'error');
    },
  });

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/discussions/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.comments(post.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.feed() });
      addToast('Komentar dihapus', 'info');
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Gagal menghapus komentar';
      addToast(msg, 'error');
    },
  });

  const handleRootCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    addCommentMutation.mutate({ content: newCommentText.trim() });
  };

  const handleReplyComment = async (parentCommentId: string, replyContent: string) => {
    await addCommentMutation.mutateAsync({
      content: replyContent,
      parentCommentId,
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Yakin ingin menghapus komentar ini?')) {
      await deleteCommentMutation.mutateAsync(commentId);
    }
  };

  const authorInitials = post.author.fullName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="bg-white rounded-2xl border border-chem-border p-5 shadow-subtle space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-chem-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-chem-forest text-chem-glow flex items-center justify-center font-bold text-xs shadow-xs">
            {authorInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-chem-dark">
                {post.author.fullName}
              </span>
              <Badge variant={post.author.role === 'admin' ? 'teacher' : 'student'}>
                {post.author.role === 'admin' ? 'Guru' : 'Siswa'}
              </Badge>
            </div>
            <span className="text-[10px] text-chem-ash">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => onDeletePost(post.id)}
            title="Hapus Postingan"
            className="p-1 rounded-lg text-chem-ash hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-xs sm:text-sm text-chem-dark leading-relaxed whitespace-pre-line">
        {post.content}
      </p>

      {/* Full-bleed Media Attachment */}
      {post.mediaUrl && (
        <div className="rounded-xl overflow-hidden border border-chem-border bg-chem-subtle">
          <img
            src={post.mediaUrl}
            alt="Lampiran diskusi kimia"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Social Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-chem-border/60 text-xs">
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            type="button"
            onClick={() => toggleLikeMutation.mutate()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer select-none active:scale-95 ${
              hasLiked
                ? 'border-rose-300 bg-rose-50 text-rose-600'
                : 'border-chem-border bg-white text-chem-ash hover:text-chem-dark hover:bg-chem-subtle'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current text-rose-600' : 'text-chem-ash'}`} />
            <span>{likeCount} Suka</span>
          </button>

          {/* Comment Toggle Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="px-3 py-1.5 rounded-xl border border-chem-border bg-white text-chem-ash hover:text-chem-dark hover:bg-chem-subtle flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-chem-ash" />
            <span>{post.commentCount} Komentar</span>
          </button>
        </div>
      </div>

      {/* Threaded Comment Section */}
      {showComments && (
        <div className="pt-3 border-t border-chem-border/60 space-y-3.5">
          {/* Add Root Comment Form */}
          <form onSubmit={handleRootCommentSubmit} className="flex items-center gap-2">
            <input
              type="text"
              required
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Tuliskan komentar atau tanggapan..."
              className="flex-1 bg-chem-subtle/70 px-3.5 py-2 text-xs text-chem-dark border border-chem-border rounded-xl focus:bg-white focus:outline-none focus:border-chem-sage transition-all"
            />
            <button
              type="submit"
              disabled={addCommentMutation.isPending}
              className="px-3.5 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle flex items-center gap-1 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>Kirim</span>
            </button>
          </form>

          {/* Comments List */}
          {loadingComments ? (
            <div className="py-4 text-center text-xs text-chem-ash">
              Memuat komentar diskusi...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-chem-ash italic py-2">
              Belum ada tanggapan. Jadilah yang pertama berkomentar!
            </p>
          ) : (
            <div className="space-y-2.5 pt-1">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReplyComment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
