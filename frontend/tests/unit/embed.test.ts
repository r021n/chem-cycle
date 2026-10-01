import { describe, it, expect } from 'vitest';
import { getEmbedInfo, EMBED_PLATFORM_HINT } from '../../src/lib/embed';

describe('getEmbedInfo - multi platform resolver', () => {
  it('resolves YouTube watch, short, shorts and embed urls', () => {
    expect(getEmbedInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')?.embedUrl).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    );
    expect(getEmbedInfo('https://youtu.be/dQw4w9WgXcQ')?.embedUrl).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    );
    expect(getEmbedInfo('https://www.youtube.com/shorts/abc123')?.embedUrl).toBe(
      'https://www.youtube.com/embed/abc123'
    );
    expect(getEmbedInfo('https://www.youtube.com/embed/abc123')?.platform).toBe('youtube');
  });

  it('resolves Vimeo and Dailymotion', () => {
    expect(getEmbedInfo('https://vimeo.com/76979871')?.embedUrl).toBe(
      'https://player.vimeo.com/video/76979871'
    );
    expect(
      getEmbedInfo('https://www.dailymotion.com/video/x2iuewm')?.embedUrl
    ).toBe('https://www.dailymotion.com/embed/video/x2iuewm');
    expect(getEmbedInfo('https://dai.ly/x2iuewm')?.platform).toBe('dailymotion');
  });

  it('resolves Facebook video pages to plugin embed', () => {
    const info = getEmbedInfo('https://www.facebook.com/somepage/videos/123456789/');
    expect(info?.platform).toBe('facebook');
    expect(info?.embedUrl).toContain('facebook.com/plugins/video.php?href=');
  });

  it('resolves Instagram posts and reels', () => {
    expect(getEmbedInfo('https://www.instagram.com/p/ABC123/')?.embedUrl).toBe(
      'https://www.instagram.com/p/ABC123/embed'
    );
    expect(getEmbedInfo('https://www.instagram.com/reels/XYZ789/')?.embedUrl).toBe(
      'https://www.instagram.com/reel/XYZ789/embed'
    );
  });

  it('resolves TikTok video permalinks', () => {
    expect(getEmbedInfo('https://www.tiktok.com/@user/video/7123456789012345678')?.embedUrl).toBe(
      'https://www.tiktok.com/embed/7123456789012345678'
    );
  });

  it('resolves Twitter/X status urls', () => {
    expect(getEmbedInfo('https://x.com/someone/status/1234567890')?.embedUrl).toBe(
      'https://platform.twitter.com/embed/Tweet.html?id=1234567890'
    );
    expect(getEmbedInfo('https://twitter.com/someone/status/1234567890')?.platform).toBe(
      'twitter'
    );
  });

  it('resolves Google Drive, Loom and Twitch', () => {
    expect(getEmbedInfo('https://drive.google.com/file/d/FILEID123/view')?.embedUrl).toBe(
      'https://drive.google.com/file/d/FILEID123/preview'
    );
    expect(getEmbedInfo('https://www.loom.com/share/abcd1234')?.embedUrl).toBe(
      'https://www.loom.com/embed/abcd1234'
    );
    const twitch = getEmbedInfo('https://www.twitch.tv/videos/987654321');
    expect(twitch?.embedUrl).toContain('player.twitch.tv/?video=987654321');
    const channel = getEmbedInfo('https://www.twitch.tv/somechannel');
    expect(channel?.embedUrl).toContain('channel=somechannel');
  });

  it('returns null for unknown hosts and short links that need server redirect', () => {
    expect(getEmbedInfo('https://example.com/watch?v=1')).toBeNull();
    expect(getEmbedInfo('https://fb.watch/xyz')).toBeNull();
    expect(getEmbedInfo('https://vt.tiktok.com/abc')).toBeNull();
    expect(getEmbedInfo('')).toBeNull();
    expect(getEmbedInfo(undefined)).toBeNull();
    expect(getEmbedInfo('bukan url')).toBeNull();
  });

  it('normalizes urls without protocol', () => {
    expect(getEmbedInfo('youtu.be/abc123')?.embedUrl).toBe('https://www.youtube.com/embed/abc123');
  });

  it('exposes a platform hint list for UI placeholders', () => {
    expect(EMBED_PLATFORM_HINT).toContain('YouTube');
    expect(EMBED_PLATFORM_HINT).toContain('TikTok');
  });

  it('marks short-form videos as portrait and regular videos as landscape', () => {
    expect(getEmbedInfo('https://www.youtube.com/shorts/abc123')?.orientation).toBe('portrait');
    expect(getEmbedInfo('https://www.youtube.com/watch?v=abc123')?.orientation).toBe('landscape');
    expect(getEmbedInfo('https://youtu.be/abc123')?.orientation).toBe('landscape');
    expect(
      getEmbedInfo('https://www.tiktok.com/@user/video/7123456789012345678')?.orientation
    ).toBe('portrait');
    expect(getEmbedInfo('https://www.instagram.com/reels/XYZ789/')?.orientation).toBe('portrait');
    expect(getEmbedInfo('https://www.instagram.com/reel/XYZ789/')?.orientation).toBe('portrait');
    expect(getEmbedInfo('https://www.instagram.com/p/ABC123/')?.orientation).toBe('landscape');
    expect(getEmbedInfo('https://www.facebook.com/page/reel/999/')?.orientation).toBe('portrait');
    expect(
      getEmbedInfo('https://www.facebook.com/page/videos/123456789/')?.orientation
    ).toBe('landscape');
    expect(getEmbedInfo('https://vimeo.com/76979871')?.orientation).toBe('landscape');
    expect(getEmbedInfo('https://x.com/someone/status/1234567890')?.orientation).toBe('landscape');
  });
});
