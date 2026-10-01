import React from 'react';
import { EmbedInfo } from '../../lib/embed';
import { cn } from '../../lib/utils';

export interface EmbedPlayerProps {
  info: EmbedInfo;
  title: string;
  className?: string;
}

/**
 * Responsive embed player.
 * - orientation 'landscape' (16:9) mengisi lebar penuh
 * - orientation 'portrait' (9:16, video pendek: Shorts/Reels/TikTok)
 *   tampil memanjang dengan lebar maksimal 360px agar tidak terlalu tinggi
 */
export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ info, title, className = '' }) => {
  const portrait = info.orientation === 'portrait';
  return (
    <div
      className={cn('w-full', portrait && 'mx-auto max-w-[360px]', className)}
      data-embed-orientation={info.orientation}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950',
          portrait ? 'aspect-[9/16]' : 'aspect-video'
        )}
      >
        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
          {info.label}
        </span>
        <iframe
          src={info.embedUrl}
          title={title}
          loading="lazy"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
};
