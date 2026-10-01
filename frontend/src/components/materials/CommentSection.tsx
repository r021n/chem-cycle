import React, { useEffect, useState } from 'react';
import { MaterialComment } from '../../types/app';
import { commentsApi } from '../../api/comments';
import { ApiError } from '../../api/client';
import { MessageSquare, Send, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { LoadingButton } from '../ui/loading-button';

interface CommentSectionProps {
  materialId: string;
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const CommentSection: React.FC<CommentSectionProps> = ({ materialId }) => {
  const [comments, setComments] = useState<MaterialComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot trap field
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Load comments from backend on mount or when materialId changes
  useEffect(() => {
    let mounted = true;
    setLoadingComments(true);
    commentsApi
      .getComments(materialId)
      .then((data) => {
        if (mounted) {
          setComments(data);
          setLoadingComments(false);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat komentar:', err);
        if (mounted) setLoadingComments(false);
      });

    return () => {
      mounted = false;
    };
  }, [materialId]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cooldown > 0) {
      setError(`Mohon tunggu ${cooldown} detik sebelum mengirim komentar berikutnya.`);
      return;
    }

    if (!name.trim() || !body.trim()) {
      setError('Nama dan kolom komentar wajib diisi.');
      return;
    }

    setSubmitting(true);

    try {
      const newComment = await commentsApi.postComment(materialId, {
        name: name.trim(),
        email: email.trim() || undefined,
        body: body.trim(),
        website_hp: honeypot, // Honeypot trap
      });

      // Prepend newly posted comment
      setComments((prev) => [newComment, ...prev]);
      setBody('');
      setSubmitSuccess(true);
      setCooldown(30); // 30s cooldown before next comment
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          const waitTime = err.retryAfter || 60;
          setCooldown(waitTime);
          setError(
            `Proteksi Anti-Spam: Anda telah mengirim beberapa komentar. Mohon tunggu ${waitTime} detik.`
          );
        } else {
          setError(err.message || 'Gagal mengirim komentar.');
        }
      } else {
        setError('Terjadi kesalahan jaringan saat mengirim komentar.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="comments-heading" className="pt-10 mt-10 border-t border-chem-border">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-chem-sage shrink-0" />
        <h2 id="comments-heading" className="font-serif text-xl font-bold text-chem-dark">
          Komentar Pembaca
        </h2>
        <span className="text-xs font-semibold text-chem-ash">({comments.length})</span>
      </div>

      {/* Identity & Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        {/* Anti-Bot Honeypot field (hidden from human users) */}
        <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
          <label htmlFor="website_hp">Jangan isi kolom ini jika Anda manusia</label>
          <input
            id="website_hp"
            type="text"
            name="website_hp"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="comment-name" className="text-xs font-bold text-chem-dark block">
              Nama <span className="text-chem-warm">*</span>
            </label>
            <input
              id="comment-name"
              type="text"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              className="w-full px-4 py-3 sm:py-2.5 bg-white text-sm sm:text-xs text-chem-dark rounded-xl border border-chem-border focus:border-chem-sage focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="comment-email" className="text-xs font-bold text-chem-dark block">
              Email <span className="font-normal text-chem-ash">(opsional)</span>
            </label>
            <input
              id="comment-email"
              type="email"
              maxLength={100}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 sm:py-2.5 bg-white text-sm sm:text-xs text-chem-dark rounded-xl border border-chem-border focus:border-chem-sage focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="comment-body" className="text-xs font-bold text-chem-dark block">
            Komentar <span className="text-chem-warm">*</span>
          </label>
          <textarea
            id="comment-body"
            required
            maxLength={1500}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Tuliskan tanggapan, pertanyaan, atau hasil refleksi Anda..."
            className="w-full px-4 py-3 bg-white text-sm sm:text-xs text-chem-dark rounded-xl border border-chem-border focus:border-chem-sage focus:outline-none transition-colors resize-y leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Komentar Anda berhasil terkirim dan disimpan!</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          {cooldown > 0 ? (
            <span className="text-[11px] font-mono text-chem-ash">
              Cooldown spam: tunggu {cooldown}s
            </span>
          ) : (
            <span className="text-[11px] text-chem-ash">Maks. 1.500 karakter</span>
          )}

          <LoadingButton
            type="submit"
            loading={submitting}
            loadingLabel="Mengirim..."
            disabled={cooldown > 0}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-11 px-5 py-2.5 bg-chem-forest hover:bg-chem-moss disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Komentar</span>
          </LoadingButton>
        </div>
      </form>

      {/* Comment List */}
      {loadingComments ? (
        <div className="py-8 flex items-center justify-center gap-2 text-xs text-chem-ash">
          <Loader2 className="w-4 h-4 animate-spin text-chem-forest" />
          <span>Memuat tanggapan pembaca...</span>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-chem-ash italic">
          Belum ada komentar. Jadilah yang pertama memberikan tanggapan.
        </p>
      ) : (
        <ul className="space-y-6 sm:space-y-8">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-full bg-chem-glow border border-chem-sage/40 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-chem-forest">{getInitials(c.name)}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-bold text-chem-dark">{c.name}</span>
                  <span className="text-[11px] text-chem-ash">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-xs sm:text-sm text-chem-dark/85 leading-relaxed whitespace-pre-line">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
