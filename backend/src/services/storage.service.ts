import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export interface SavedFileInfo {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  private baseDir: string;

  constructor(baseDir = UPLOAD_DIR) {
    this.baseDir = path.resolve(baseDir);
    this.ensureDirectory(path.join(this.baseDir, 'images'));
    this.ensureDirectory(path.join(this.baseDir, 'documents'));
  }

  private ensureDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async saveImage(buffer: Buffer, originalName: string, mimeType: string): Promise<SavedFileInfo> {
    const ext = path.extname(originalName).toLowerCase() || '.png';
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Ekstensi berkas gambar tidak diizinkan: ${ext}`);
    }

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(this.baseDir, 'images', uniqueName);

    await fs.promises.writeFile(targetPath, buffer);

    return {
      url: `/uploads/images/${uniqueName}`,
      filename: uniqueName,
      size: buffer.length,
      mimeType,
    };
  }

  async saveDocument(buffer: Buffer, originalName: string, mimeType: string): Promise<SavedFileInfo> {
    const ext = path.extname(originalName).toLowerCase() || '.pdf';
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.txt'];
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Ekstensi berkas dokumen tidak diizinkan: ${ext}`);
    }

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(this.baseDir, 'documents', uniqueName);

    await fs.promises.writeFile(targetPath, buffer);

    return {
      url: `/uploads/documents/${uniqueName}`,
      filename: uniqueName,
      size: buffer.length,
      mimeType,
    };
  }
}

export const storageService = new StorageService();
