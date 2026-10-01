import { describe, it, expect } from 'vitest';
import {
  segmentsToHtml,
  htmlToSegments,
  segmentsPlainText,
  sanitizeHref,
  escapeHtml,
} from '../../src/lib/rich-text';
import { BlockInlineContent } from '../../src/types/material';

function toEl(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
}

describe('escapeHtml / sanitizeHref', () => {
  it('escapes html special characters', () => {
    expect(escapeHtml('<b>&"\'</b>')).toBe('&lt;b&gt;&amp;&quot;&#39;&lt;/b&gt;');
  });

  it('allows http(s), mailto and in-page anchors', () => {
    expect(sanitizeHref('https://contoh.id/a')).toBe('https://contoh.id/a');
    expect(sanitizeHref('http://contoh.id')).toBe('http://contoh.id');
    expect(sanitizeHref('mailto:budi@contoh.id')).toBe('mailto:budi@contoh.id');
    expect(sanitizeHref('#footnote')).toBe('#footnote');
  });

  it('prefixes bare domains and blocks javascript: urls', () => {
    expect(sanitizeHref('contoh.id/bab1')).toBe('https://contoh.id/bab1');
    expect(sanitizeHref('javascript:alert(1)')).toBeNull();
    expect(sanitizeHref('')).toBeNull();
    expect(sanitizeHref(null)).toBeNull();
  });
});

describe('segmentsToHtml', () => {
  it('renders bold, italic, underline and strike tags', () => {
    const segments: BlockInlineContent[] = [
      { type: 'text', text: 'penting', styles: { bold: true } },
      { type: 'text', text: 'miring', styles: { italic: true } },
      { type: 'text', text: 'bawah', styles: { underline: true } },
      { type: 'text', text: 'coret', styles: { strike: true } },
    ];
    const html = segmentsToHtml(segments);
    expect(html).toContain('<strong>penting</strong>');
    expect(html).toContain('<em>miring</em>');
    expect(html).toContain('<u>bawah</u>');
    expect(html).toContain('<s>coret</s>');
  });

  it('nests combined styles and wraps links', () => {
    const html = segmentsToHtml([
      {
        type: 'link',
        href: 'https://contoh.id',
        text: 'tebal',
        styles: { bold: true, underline: true },
      },
    ]);
    expect(html).toBe(
      '<a href="https://contoh.id" target="_blank" rel="noopener noreferrer"><strong><u>tebal</u></strong></a>'
    );
  });

  it('converts newlines to <br> and escapes text', () => {
    expect(segmentsToHtml([{ type: 'text', text: 'a\n<b>' }])).toBe('a<br>&lt;b&gt;');
  });

  it('drops unsafe link hrefs', () => {
    const html = segmentsToHtml([{ type: 'link', href: 'javascript:alert(1)', text: 'klik' }]);
    expect(html).toBe('klik');
  });
});

describe('htmlToSegments', () => {
  it('parses formatting tags into styles', () => {
    const segments = htmlToSegments(toEl('<strong>tebal</strong><em>miring</em><u>bawah</u>'));
    expect(segments).toEqual([
      { type: 'text', text: 'tebal', styles: { bold: true } },
      { type: 'text', text: 'miring', styles: { italic: true } },
      { type: 'text', text: 'bawah', styles: { underline: true } },
    ]);
  });

  it('keeps nested styles and link hrefs', () => {
    const segments = htmlToSegments(
      toEl('<a href="https://contoh.id"><strong>tebal</strong></a>')
    );
    expect(segments).toEqual([
      {
        type: 'link',
        href: 'https://contoh.id',
        text: 'tebal',
        styles: { bold: true },
      },
    ]);
  });

  it('converts <br> and block elements into newlines', () => {
    expect(segmentsPlainText(htmlToSegments(toEl('satu<br>dua')))).toBe('satu\ndua');
    expect(segmentsPlainText(htmlToSegments(toEl('<div>satu</div><div>dua</div>')))).toBe(
      'satu\ndua'
    );
  });

  it('merges adjacent segments with identical styles', () => {
    const segments = htmlToSegments(toEl('<strong>a</strong><strong>b</strong>'));
    expect(segments).toEqual([{ type: 'text', text: 'ab', styles: { bold: true } }]);
  });

  it('round-trips segments through html', () => {
    const original: BlockInlineContent[] = [
      { type: 'text', text: 'Soal ' },
      { type: 'text', text: 'penting', styles: { bold: true, underline: true } },
      { type: 'text', text: ' ada di ' },
      { type: 'link', href: 'https://contoh.id', text: 'tautan' },
      { type: 'text', text: '.' },
    ];
    const roundTrip = htmlToSegments(toEl(segmentsToHtml(original)));
    expect(roundTrip).toEqual(original);
  });
});
