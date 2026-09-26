import React, { useMemo, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { MaterialComment } from '../../types/app';
import { MessageSquare, Send } from 'lucide-react';

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
  const { materials, addMaterialComment } = useDataStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const material = materials.find((m) => m.id === materialId);

  const comments = useMemo(() => {
    const list: MaterialComment[] = material?.comments ?? [];
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [material?.comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      setError('Nama dan kolom komentar wajib diisi.');
      return;
    }
    addMaterialComment(materialId, {
      name: name.trim(),
      email: email.trim() || undefined,
      body: body.trim(),
    });
    setName('');
    setEmail('');
    setBody('');
    setError('');
  };

  return (
    <section aria-labelledby="comments-heading" className="pt-10 mt-10 border-t border-chem-border">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-chem-sage" />
        <h2 id="comments-heading" className="font-serif text-xl font-bold text-chem-dark">
          Komentar Pembaca
        </h2>
        <span className="text-xs font-semibold text-chem-ash">({comments.length})</span>
      </div>

      {/* Identity & Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="comment-name" className="text-xs font-bold text-chem-dark block">
              Nama <span className="text-chem-warm">*</span>
            </label>
            <input
              id="comment-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              className="w-full px-4 py-2.5 bg-white text-xs text-chem-dark rounded-xl border border-chem-border focus:border-chem-sage focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="comment-email" className="text-xs font-bold text-chem-dark block">
              Email <span className="font-normal text-chem-ash">(opsional)</span>
            </label>
            <input
              id="comment-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-2.5 bg-white text-xs text-chem-dark rounded-xl border border-chem-border focus:border-chem-sage focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="comment-body" className="text-xs font-bold text-chem-dark block">
            Komentar <span className="text-chem-warm">*</span>
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Tuliskan tanggapan, pertanyaan, atau hasil refleksi Anda..."
            className="w-full px-4 py-3 bg-white text-xs text-chem-dark rounded-xl border border-chem-border focus:border-chem-sage focus:outline-none transition-colors resize-y leading-relaxed"
          />
        </div>

        {error && <p className="text-xs text-chem-warm font-semibold">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-chem-forest hover:bg-chem-moss text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Kirim Komentar
          </button>
        </div>
      </form>

      {/* Comment List */}
      {comments.length === 0 ? (
        <p className="text-xs text-chem-ash italic">
          Belum ada komentar. Jadilah yang pertama memberikan tanggapan.
        </p>
      ) : (
        <ul className="space-y-8">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-4">
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
