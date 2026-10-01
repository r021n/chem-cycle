import { BlockInlineContent } from '../types/material';

type InlineStyles = NonNullable<BlockInlineContent['styles']>;

export type InlineCommand = 'bold' | 'italic' | 'underline' | 'strikeThrough';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHref(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('#')) return trimmed;
  if (/^javascript:/i.test(trimmed)) return null;
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

export function segmentsPlainText(segments?: BlockInlineContent[] | null): string {
  if (!segments || segments.length === 0) return '';
  return segments.map((s) => s.text).join('');
}

export function segmentsToHtml(segments?: BlockInlineContent[] | null): string {
  if (!segments || segments.length === 0) return '';
  return segments
    .map((seg) => {
      if (!seg.text) return '';
      let html = escapeHtml(seg.text).replace(/\n/g, '<br>');
      const styles = seg.styles;
      if (styles?.code) html = `<code>${html}</code>`;
      if (styles?.strike) html = `<s>${html}</s>`;
      if (styles?.underline) html = `<u>${html}</u>`;
      if (styles?.italic) html = `<em>${html}</em>`;
      if (styles?.bold) html = `<strong>${html}</strong>`;
      const href = seg.type === 'link' ? sanitizeHref(seg.href) : null;
      if (href) {
        html = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
      }
      return html;
    })
    .join('');
}

function sameStyles(a?: InlineStyles, b?: InlineStyles): boolean {
  return (
    !!a?.bold === !!b?.bold &&
    !!a?.italic === !!b?.italic &&
    !!a?.underline === !!b?.underline &&
    !!a?.strike === !!b?.strike &&
    !!a?.code === !!b?.code
  );
}

function withFlag(base: InlineStyles | undefined, flag: keyof InlineStyles): InlineStyles {
  return { ...(base || {}), [flag]: true };
}

function pushText(
  out: BlockInlineContent[],
  text: string,
  styles: InlineStyles | undefined,
  href: string | null
): void {
  if (!text) return;
  const type: BlockInlineContent['type'] = href ? 'link' : 'text';
  const last = out[out.length - 1];
  const lastHref = last?.type === 'link' ? last.href || null : null;
  if (last && last.type === type && lastHref === href && sameStyles(last.styles, styles)) {
    last.text += text;
    return;
  }
  const seg: BlockInlineContent = { type, text };
  if (href) seg.href = href;
  if (styles && Object.keys(styles).length > 0) seg.styles = { ...styles };
  out.push(seg);
}

function pushBreak(out: BlockInlineContent[]): void {
  const last = out[out.length - 1];
  if (!last) return;
  if (last.type === 'text' && !last.styles) {
    last.text += '\n';
    return;
  }
  out.push({ type: 'text', text: '\n' });
}

export function htmlToSegments(root: HTMLElement): BlockInlineContent[] {
  const out: BlockInlineContent[] = [];

  const walk = (node: Node, styles: InlineStyles | undefined, href: string | null, depth: number) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(out, node.nodeValue || '', styles, href);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName;

    if (tag === 'BR') {
      pushBreak(out);
      return;
    }
    if (tag === 'SCRIPT' || tag === 'STYLE') return;

    let nextStyles = styles;
    let nextHref = href;

    switch (tag) {
      case 'STRONG':
      case 'B':
        nextStyles = withFlag(styles, 'bold');
        break;
      case 'EM':
      case 'I':
        nextStyles = withFlag(styles, 'italic');
        break;
      case 'U':
        nextStyles = withFlag(styles, 'underline');
        break;
      case 'S':
      case 'STRIKE':
      case 'DEL':
        nextStyles = withFlag(styles, 'strike');
        break;
      case 'CODE':
        nextStyles = withFlag(styles, 'code');
        break;
      case 'A':
        nextHref = sanitizeHref(el.getAttribute('href'));
        break;
      case 'DIV':
      case 'P':
        if (depth > 0) pushBreak(out);
        break;
      default:
        break;
    }

    const children = el.childNodes;
    for (let i = 0; i < children.length; i += 1) {
      walk(children[i], nextStyles, nextHref, depth + 1);
    }
  };

  walk(root, undefined, null, 0);
  return out;
}

export function applyInlineCommand(command: InlineCommand): boolean {
  try {
    return document.execCommand(command, false);
  } catch {
    return false;
  }
}

export function applyInlineLink(rawUrl: string): boolean {
  const href = sanitizeHref(rawUrl);
  if (!href) return false;
  try {
    return document.execCommand('createLink', false, href);
  } catch {
    return false;
  }
}

export function applyInsertPlainText(text: string): boolean {
  try {
    return document.execCommand('insertText', false, text);
  } catch {
    return false;
  }
}

export function applyInsertLineBreak(): boolean {
  try {
    return document.execCommand('insertLineBreak', false);
  } catch {
    return false;
  }
}
