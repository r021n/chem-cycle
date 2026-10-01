import React, { useState } from 'react';
import { ArrowUpRight, Link2 } from 'lucide-react';
import { sanitizeHref } from '../../lib/rich-text';
import { cn } from '../../lib/utils';

export interface LinkCardProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
}

function hostOf(url: string): string | null {
  try {
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function originOf(url: string): string | null {
  try {
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(href).origin;
  } catch {
    return null;
  }
}

export const LinkCard: React.FC<LinkCardProps> = ({ url, title, description, className = '' }) => {
  const [faviconOk, setFaviconOk] = useState(true);
  const href = sanitizeHref(url);
  const host = hostOf(url);
  const origin = originOf(url);

  if (!href || !host) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-700',
          className
        )}
      >
        URL tidak valid: <span className="font-mono break-all">{url || '(kosong)'}</span>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-chem-sage hover:bg-chem-glow/20',
        className
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
        {faviconOk && origin ? (
          <img
            src={`${origin}/favicon.ico`}
            alt=""
            className="w-5 h-5 object-contain"
            onError={() => setFaviconOk(false)}
          />
        ) : (
          <Link2 className="w-4 h-4 text-slate-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-chem-forest">
          {title?.trim() || host}
        </div>
        <div className="text-xs text-slate-400 truncate">{host}</div>
        {description?.trim() && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
        )}
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-chem-forest shrink-0" />
    </a>
  );
};
