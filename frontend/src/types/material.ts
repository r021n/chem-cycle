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

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface BlockAstNode {
  id: string;
  type:
    | 'heading'
    | 'paragraph'
    | 'bulletListItem'
    | 'numberedListItem'
    | 'quote'
    | 'image'
    | 'video'
    | 'divider'
    | 'callout'
    | 'link';
  props?: {
    level?: 1 | 2 | 3;
    url?: string;
    caption?: string;
    previewUrl?: string;
    text?: string;
    emoji?: string;
    align?: TextAlign;
    title?: string;
    description?: string;
  };
  content?: BlockInlineContent[];
  children?: BlockAstNode[];
}