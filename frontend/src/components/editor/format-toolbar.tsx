import React, { useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Link2,
  TextAlignStart,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
} from 'lucide-react';
import { TextAlign } from '../../types/material';
import { applyInlineCommand, applyInlineLink } from '../../lib/rich-text';
import { cn } from '../../lib/utils';

export interface FormatToolbarProps {
  align?: TextAlign;
  onAlign?: (align: TextAlign) => void;
  showTextStyles?: boolean;
  showAlign?: boolean;
  className?: string;
}

const ALIGN_ITEMS: { value: TextAlign; icon: React.ElementType; title: string }[] = [
  { value: 'left', icon: TextAlignStart, title: 'Rata Kiri' },
  { value: 'center', icon: TextAlignCenter, title: 'Rata Tengah' },
  { value: 'right', icon: TextAlignEnd, title: 'Rata Kanan' },
  { value: 'justify', icon: TextAlignJustify, title: 'Rata Kedua Sisi' },
];

const btn =
  'p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors';

export const FormatToolbar: React.FC<FormatToolbarProps> = ({
  align = 'left',
  onAlign,
  showTextStyles = true,
  showAlign = true,
  className = '',
}) => {
  const [states, setStates] = useState({ bold: false, italic: false, underline: false });

  useEffect(() => {
    const handler = () => {
      try {
        const next = {
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
        };
        setStates((prev) =>
          prev.bold === next.bold && prev.italic === next.italic && prev.underline === next.underline
            ? prev
            : next
        );
      } catch {
        // queryCommandState can throw when there is no active selection
      }
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  const styleBtn = (active: boolean) =>
    cn(btn, active && 'bg-chem-glow text-chem-forest hover:bg-chem-glow hover:text-chem-forest');

  return (
    <div className={cn('flex flex-wrap items-center gap-0.5', className)}>
      {showTextStyles && (
        <>
          <button
            type="button"
            title="Tebal (Bold)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyInlineCommand('bold')}
            className={styleBtn(states.bold)}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Miring (Italic)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyInlineCommand('italic')}
            className={styleBtn(states.italic)}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Garis Bawah (Underline)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyInlineCommand('underline')}
            className={styleBtn(states.underline)}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Sisipkan Tautan"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const url = window.prompt('Masukkan URL tautan:', 'https://');
              if (url && url.trim()) applyInlineLink(url);
            }}
            className={btn}
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          {showAlign && <span className="w-px h-4 bg-slate-200 mx-1" />}
        </>
      )}

      {showAlign &&
        ALIGN_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              type="button"
              title={item.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onAlign?.(item.value)}
              className={styleBtn(align === item.value)}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
    </div>
  );
};
