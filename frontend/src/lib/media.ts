export const MAX_MEDIA_BYTES = 300 * 1024;

const MAX_DIMENSION = 1600;
const QUALITY_LADDER = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25];
const MAX_ITERATIONS = 8;

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca berkas gambar.'));
    reader.readAsDataURL(blob);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Berkas gambar tidak dapat dimuat.'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

export function getYoutubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.includes('youtube.com/watch')) {
      const urlObj = new URL(trimmed);
      const v = urlObj.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (trimmed.startsWith('youtu.be/')) {
      const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (trimmed.includes('youtu.be/')) {
      const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (trimmed.includes('youtube.com/embed/')) {
      return trimmed;
    }
    if (trimmed.includes('youtube.com/shorts/')) {
      const id = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function compressImageToDataUrl(
  file: File,
  maxBytes: number = MAX_MEDIA_BYTES
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Berkas yang dipilih bukan gambar.');
  }

  if (file.size <= maxBytes && !file.type.includes('svg')) {
    return blobToDataUrl(file);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    if (!naturalWidth || !naturalHeight) {
      throw new Error('Dimensi gambar tidak valid.');
    }

    const baseScale = Math.min(1, MAX_DIMENSION / Math.max(naturalWidth, naturalHeight));
    let scale = baseScale;
    let lastBlob: Blob | null = null;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITY_LADDER) {
        const blob = await canvasToBlob(canvas, quality);
        if (!blob) continue;
        if (!lastBlob || blob.size < lastBlob.size) lastBlob = blob;
        if (blob.size <= maxBytes) {
          return blobToDataUrl(blob);
        }
      }

      canvas.width = 1;
      canvas.height = 1;
      scale *= 0.7;
    }

    if (lastBlob && lastBlob.size <= maxBytes) {
      return blobToDataUrl(lastBlob);
    }

    throw new Error('Ukuran gambar masih melebihi 300 KB setelah kompresi. Coba gambar lain.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}