import { apiClient, API_BASE_URL } from './client';

export interface UploadMediaResult {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/api/')) {
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}${url}`;
  }
  return url;
}

export const mediaApi = {
  async uploadMediaBlob(blob: Blob, filename: string = 'media-upload'): Promise<UploadMediaResult> {
    const formData = new FormData();
    formData.append('file', blob, filename);

    const res = await apiClient<{ success: boolean; data: UploadMediaResult }>('/media', {
      method: 'POST',
      body: formData,
    });

    return res.data;
  },

  async uploadFile(file: File): Promise<UploadMediaResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const res = await apiClient<{ success: boolean; data: UploadMediaResult }>('/media', {
      method: 'POST',
      body: formData,
    });

    return res.data;
  },
};
