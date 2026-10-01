import React from 'react';
import { BlockInlineContent } from '../types/material';
import { sanitizeHref } from './rich-text';

export function renderInlineContent(content?: BlockInlineContent[]): React.ReactNode {
  if (!content || content.length === 0) return null;
  return content.map((item, idx) => {
    let element: React.ReactNode = item.text || '';
    if (item.styles?.bold) {
      element = (
        <strong key={`${idx}-b`} className="font-semibold text-slate-900">
          {element}
        </strong>
      );
    }
    if (item.styles?.italic) {
      element = <em key={`${idx}-i`}>{element}</em>;
    }
    if (item.styles?.underline) {
      element = <u key={`${idx}-u`}>{element}</u>;
    }
    if (item.styles?.strike) {
      element = <s key={`${idx}-s`}>{element}</s>;
    }
    if (item.styles?.code) {
      element = (
        <code
          key={`${idx}-c`}
          className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-xs"
        >
          {element}
        </code>
      );
    }
    if (item.type === 'link' || item.href) {
      const href = sanitizeHref(item.href);
      if (href) {
        element = (
          <a
            key={`${idx}-a`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 font-medium"
          >
            {element}
          </a>
        );
      }
    }
    return <React.Fragment key={idx}>{element}</React.Fragment>;
  });
}
