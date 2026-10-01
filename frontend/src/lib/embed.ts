export type EmbedPlatform =
  | 'youtube'
  | 'vimeo'
  | 'dailymotion'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'gdrive'
  | 'loom'
  | 'twitch';

export type EmbedOrientation = 'landscape' | 'portrait';

export interface EmbedInfo {
  platform: EmbedPlatform;
  label: string;
  embedUrl: string;
  orientation: EmbedOrientation;
}

const PLATFORM_LABELS: Record<EmbedPlatform, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  dailymotion: 'Dailymotion',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'X / Twitter',
  gdrive: 'Google Drive',
  loom: 'Loom',
  twitch: 'Twitch',
};

export const EMBED_PLATFORM_HINT = Object.values(PLATFORM_LABELS).join(', ');

function toURL(raw?: string): URL | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProto);
  } catch {
    return null;
  }
}

function getParent(): string {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
}

function info(
  platform: EmbedPlatform,
  embedUrl: string,
  orientation: EmbedOrientation = 'landscape'
): EmbedInfo {
  return { platform, label: PLATFORM_LABELS[platform], embedUrl, orientation };
}

export function getEmbedInfo(rawUrl?: string): EmbedInfo | null {
  const url = toURL(rawUrl);
  if (!url) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const path = url.pathname;

  // YouTube: youtu.be/<id>, watch?v=, /shorts/, /live/, /embed/
  if (
    host === 'youtu.be' ||
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com'
  ) {
    if (host === 'youtu.be') {
      const id = path.split('/').filter(Boolean)[0];
      return id ? info('youtube', `https://www.youtube.com/embed/${id}`) : null;
    }
    const v = url.searchParams.get('v');
    if (v) return info('youtube', `https://www.youtube.com/embed/${v}`);
    const shorts = path.match(/^\/shorts\/([^/?#]+)/);
    if (shorts) {
      return info('youtube', `https://www.youtube.com/embed/${shorts[1]}`, 'portrait');
    }
    const m = path.match(/^\/(?:embed|live)\/([^/?#]+)/);
    if (m) return info('youtube', `https://www.youtube.com/embed/${m[1]}`);
    return null;
  }

  // Vimeo: vimeo.com/<id>, vimeo.com/video/<id>
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    if (host === 'player.vimeo.com') return info('vimeo', url.href);
    const m = path.match(/^\/(?:video\/)?(\d+)/);
    return m ? info('vimeo', `https://player.vimeo.com/video/${m[1]}`) : null;
  }

  // Dailymotion: dailymotion.com/video/<id>, dai.ly/<id>
  if (host === 'dailymotion.com' || host === 'dai.ly') {
    if (host === 'dai.ly') {
      const id = path.split('/').filter(Boolean)[0];
      return id ? info('dailymotion', `https://www.dailymotion.com/embed/video/${id}`) : null;
    }
    const m = path.match(/^\/(?:embed\/)?video\/([^/?#]+)/);
    if (m) return info('dailymotion', `https://www.dailymotion.com/embed/video/${m[1]}`);
    return null;
  }

  // Facebook: /videos/<id>, /watch?v=, /reel/<id> (fb.watch = short link, no client redirect)
  if (
    host === 'facebook.com' ||
    host === 'm.facebook.com' ||
    host === 'fb.com' ||
    host === 'fb.watch'
  ) {
    if (host === 'fb.watch') return null;
    const isVideoPath =
      /\/videos\//.test(path) || /\/watch\/?/.test(path) || /\/reel\//.test(path);
    if (!isVideoPath) return null;
    const orientation: EmbedOrientation = /\/reel\//.test(path) ? 'portrait' : 'landscape';
    return info(
      'facebook',
      `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.href)}&show_text=false`,
      orientation
    );
  }

  // Instagram: /p/<code>, /reel/<code>, /reels/<code>, /tv/<code>
  if (host === 'instagram.com' || host === 'instagr.am') {
    const m = path.match(/^\/(p|reel|reels|tv)\/([^/?#]+)/);
    if (!m) return null;
    const kind = m[1] === 'reels' ? 'reel' : m[1];
    const orientation: EmbedOrientation =
      kind === 'reel' || kind === 'tv' ? 'portrait' : 'landscape';
    return info('instagram', `https://www.instagram.com/${kind}/${m[2]}/embed`, orientation);
  }

  // TikTok: /@user/video/<id> (vm./vt./t/ = short links, cannot resolve client-side)
  if (host === 'tiktok.com' || host === 'm.tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    const embedSelf = path.match(/^\/embed\/([A-Za-z0-9]+)/);
    if (embedSelf) return info('tiktok', `https://www.tiktok.com/embed/${embedSelf[1]}`, 'portrait');
    const video = path.match(/^\/@[^/]+\/video\/(\d+)/);
    if (video) return info('tiktok', `https://www.tiktok.com/embed/${video[1]}`, 'portrait');
    return null;
  }

  // Twitter / X: /<user>/status/<id>
  if (
    host === 'twitter.com' ||
    host === 'x.com' ||
    host === 'mobile.twitter.com' ||
    host === 'mobile.x.com'
  ) {
    const m = path.match(/^\/[^/]+\/status\/(\d+)/);
    return m ? info('twitter', `https://platform.twitter.com/embed/Tweet.html?id=${m[1]}`) : null;
  }

  // Google Drive: /file/d/<id>, /open?id=<id>
  if (host === 'drive.google.com') {
    const m = path.match(/^\/file\/d\/([^/?#]+)/);
    if (m) return info('gdrive', `https://drive.google.com/file/d/${m[1]}/preview`);
    const openId = url.searchParams.get('id');
    if (openId && path.startsWith('/open')) {
      return info('gdrive', `https://drive.google.com/file/d/${openId}/preview`);
    }
    return null;
  }

  // Loom: /share/<id>, /embed/<id>
  if (host === 'loom.com') {
    const m = path.match(/^\/(?:share|embed)\/([^/?#]+)/);
    return m ? info('loom', `https://www.loom.com/embed/${m[1]}`) : null;
  }

  // Twitch: /videos/<id>, /<channel>, clips.twitch.tv/<slug>
  if (host === 'clips.twitch.tv') {
    const slug = path.split('/').filter(Boolean)[0];
    return slug
      ? info('twitch', `https://clips.twitch.tv/embed?clip=${slug}&parent=${getParent()}`)
      : null;
  }
  if (host === 'twitch.tv' || host === 'm.twitch.tv') {
    const video = path.match(/^\/videos\/(\d+)/);
    if (video) {
      return info('twitch', `https://player.twitch.tv/?video=${video[1]}&parent=${getParent()}`);
    }
    const channel = path.match(/^\/([A-Za-z0-9_]+)\/?$/);
    const reserved = ['embed', 'directory', 'jobs', 'p', 'settings', 'subscriptions', 'login'];
    if (channel && !reserved.includes(channel[1].toLowerCase())) {
      return info('twitch', `https://player.twitch.tv/?channel=${channel[1]}&parent=${getParent()}`);
    }
    return null;
  }

  return null;
}
