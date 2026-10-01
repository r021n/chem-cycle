import React, { useEffect, useRef, useState } from 'react';
import { BlockInlineContent } from '../../types/material';
import {
  applyInsertLineBreak,
  applyInsertPlainText,
  htmlToSegments,
  segmentsPlainText,
  segmentsToHtml,
} from '../../lib/rich-text';
import { cn } from '../../lib/utils';

export interface RichTextEditableProps {
  content?: BlockInlineContent[];
  onChange: (segments: BlockInlineContent[]) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  grow?: boolean;
  style?: React.CSSProperties;
}

export const RichTextEditable: React.FC<RichTextEditableProps> = ({
  content,
  onChange,
  placeholder,
  className = '',
  multiline = true,
  grow = true,
  style,
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<string>('');
  const [isEmpty, setIsEmpty] = useState(() => segmentsPlainText(content).length === 0);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const html = segmentsToHtml(content);
    if (html === lastEmittedRef.current) return;
    el.innerHTML = html;
    lastEmittedRef.current = html;
    setIsEmpty(html.length === 0);
    if (grow) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, 24)}px`;
    }
  }, [content, grow]);

  const sync = () => {
    const el = elRef.current;
    if (!el) return;
    const segments = htmlToSegments(el);
    lastEmittedRef.current = segmentsToHtml(segments);
    setIsEmpty(segmentsPlainText(segments).length === 0);
    if (grow) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, 24)}px`;
    }
    onChange(segments);
  };

  return (
    <div
      ref={elRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      spellCheck={false}
      data-placeholder={placeholder}
      data-empty={isEmpty ? 'true' : undefined}
      onInput={sync}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        applyInsertPlainText(text);
        sync();
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return;
        if (!multiline) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        applyInsertLineBreak();
        sync();
      }}
      className={cn(
        'rte whitespace-pre-wrap break-words focus:outline-none',
        isEmpty && placeholder && 'rte-placeholder',
        className
      )}
      style={style}
    />
  );
};
