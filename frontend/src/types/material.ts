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
  title: string;
  slug: string;
  contentJson: string; // JSON array of BlockAstNode
  summary?: string | null;
  estimatedReadTime: number;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}