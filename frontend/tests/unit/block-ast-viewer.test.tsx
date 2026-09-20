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
});
