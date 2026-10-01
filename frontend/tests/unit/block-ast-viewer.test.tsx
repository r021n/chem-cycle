import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlockAstViewer } from '../../src/components/editor/block-ast-viewer';
import { BlockAstNode } from '../../src/types/material';

describe('Block AST Viewer Unit Tests', () => {
  it('should render headings and paragraphs from AST correctly', () => {
    const ast: BlockAstNode[] = [
      {
        id: '1',
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: 'Konsep Termokimia' }],
      },
      {
        id: '2',
        type: 'paragraph',
        content: [{ type: 'text', text: 'Kalor adalah bentuk energi yang berpindah.' }],
      },
    ];

    render(<BlockAstViewer contentJson={JSON.stringify(ast)} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Konsep Termokimia');
    expect(screen.getByText('Kalor adalah bentuk energi yang berpindah.')).toBeInTheDocument();
  });

  it('should render bullet list items and callout quotes', () => {
    const ast: BlockAstNode[] = [
      {
        id: '3',
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Sistem Terbuka' }],
      },
      {
        id: '4',
        type: 'quote',
        content: [{ type: 'text', text: 'Catatan penting: ΔH bernilai negatif pada reaksi eksoterm.' }],
      },
    ];

    render(<BlockAstViewer contentJson={ast} />);

    expect(screen.getByText('Sistem Terbuka')).toBeInTheDocument();
    expect(screen.getByText(/ΔH bernilai negatif/i)).toBeInTheDocument();
  });

  it('should render YouTube video iframe with correct embed url', () => {
    const ast: BlockAstNode[] = [
      {
        id: '5',
        type: 'video',
        props: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      },
    ];

    render(<BlockAstViewer contentJson={ast} />);

    const iframe = screen.getByTitle('Penjelasan Materi Kimia');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('should render underline, strike and paragraph alignment', () => {
    const ast: BlockAstNode[] = [
      {
        id: '6',
        type: 'paragraph',
        props: { align: 'center' },
        content: [
          { type: 'text', text: 'tebal', styles: { bold: true } },
          { type: 'text', text: 'bawah', styles: { underline: true } },
          { type: 'text', text: 'coret', styles: { strike: true } },
        ],
      },
    ];

    render(<BlockAstViewer contentJson={ast} />);

    expect(screen.getByText('tebal').tagName).toBe('STRONG');
    expect(screen.getByText('bawah').tagName).toBe('U');
    expect(screen.getByText('coret').tagName).toBe('S');
    expect(screen.getByText(/tebal/).closest('p')).toHaveStyle({ textAlign: 'center' });
  });

  it('should render a link block as an anchor card', () => {
    const ast: BlockAstNode[] = [
      {
        id: '7',
        type: 'link',
        props: {
          url: 'https://chem.libretexts.org/thing',
          title: 'LibreTexts Kimia',
          description: 'Referensi konsep kimia',
        },
      },
    ];

    render(<BlockAstViewer contentJson={ast} />);

    const link = screen.getByRole('link', { name: /LibreTexts Kimia/i });
    expect(link).toHaveAttribute('href', 'https://chem.libretexts.org/thing');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText(/Referensi konsep kimia/)).toBeInTheDocument();
  });

  it('should embed non-YouTube videos such as TikTok', () => {
    const ast: BlockAstNode[] = [
      {
        id: '8',
        type: 'video',
        props: { url: 'https://www.tiktok.com/@teacher/video/7123456789012345678' },
      },
    ];

    render(<BlockAstViewer contentJson={ast} />);

    const iframe = screen.getByTitle('Penjelasan Materi Kimia');
    expect(iframe).toHaveAttribute('src', 'https://www.tiktok.com/embed/7123456789012345678');
  });
});
