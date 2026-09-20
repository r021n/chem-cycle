export interface BlockInlineContent {
  type: 'text' | 'link';
  text: string;
  href?: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
  };
}

export interface BlockAstNode {
  id: string;
  type: 'heading' | 'paragraph' | 'bulletListItem' | 'numberedListItem' | 'quote' | 'image' | 'video' | 'divider';
  props?: {
    level?: 1 | 2 | 3;
    url?: string;
    caption?: string;
    previewUrl?: string;
  };
  content?: BlockInlineContent[];
  children?: BlockAstNode[];
}

export interface Material {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  contentJson: string; // JSON array of BlockAstNode
  summary?: string | null;
  estimatedReadTime: number;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  module?: Module | null;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  orderIndex: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  materials?: Material[];
}

export interface CreateMaterialPayload {
  moduleId: string;
  title: string;
  slug?: string;
  contentJson: string;
  summary?: string | null;
  estimatedReadTime?: number;
  orderIndex?: number;
  isPublished?: boolean;
}

export interface UpdateMaterialPayload {
  moduleId?: string;
  title?: string;
  slug?: string;
  contentJson?: string;
  summary?: string | null;
  estimatedReadTime?: number;
  orderIndex?: number;
  isPublished?: boolean;
}

