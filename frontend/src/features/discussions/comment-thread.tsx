import React, { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { DiscussionComment } from '../../types/discussion';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils';

interface CommentItemProps {
  comment: DiscussionComment;
  onReply: (parentCommentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onDelete,
  level = 0,
}) => {
  const { user } = useAuthStore();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user?.id === comment.author.id || user?.role === 'admin';

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setReplying(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`space-y-2 font-sans ${level > 0 ? 'border-l-2 border-chem-sage/30 ml-4 pl-3.5 mt-2' : 'pt-2'}`}>
      <div className="border border-chem-border/70 rounded-2xl p-3.5 bg-chem-paper hover:border-chem-sage/50 transition-colors">
        {/* Comment Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-chem-dark">
              {comment.author.fullName}
            </span>
            <Badge variant={comment.author.role === 'admin' ? 'teacher' : 'student'}>
              {comment.author.role === 'admin' ? 'Guru' : 'Siswa'}
            </Badge>
            <span className="text-[10px] text-chem-ash">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReplying(!replying)}
              className="text-xs font-semibold text-chem-forest hover:text-chem-moss flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-reply text-[10px]"></i>
              <span>Balas</span>
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                title="Hapus Komentar"
                className="p-1 text-chem-ash hover:text-rose-600 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>
            )}
          </div>
        </div>

        {/* Comment Body */}
        <p className="text-xs text-chem-dark/85 mt-1 whitespace-pre-line leading-relaxed">
          {comment.content}
        </p>
      </div>

      {/* Reply Input Form */}
      {replying && (
        <form onSubmit={handleSendReply} className="ml-2 flex items-center gap-2">
          <input
            type="text"
            required
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Balas kepada ${comment.author.fullName}...`}
            className="flex-1 bg-white px-3.5 py-2 text-xs text-chem-dark border border-chem-border rounded-xl focus:outline-none focus:border-chem-sage"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-3.5 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-semibold rounded-xl shadow-subtle disabled:opacity-50"
          >
            {submitting ? 'Mengirim...' : 'Kirim'}
          </button>
          <button
            type="button"
            onClick={() => setReplying(false)}
            className="px-3 py-2 text-xs text-chem-ash hover:text-chem-dark"
          >
            Batal
          </button>
        </form>
      )}

      {/* Render Child Replies recursively */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
