import React, { useState } from 'react';
import { BlockAstNode, BlockInlineContent } from '../../types/material';
import { Modal } from '../ui/modal';

interface BlockAstViewerProps {
  contentJson: string | BlockAstNode[];
  className?: string;
}

export const BlockAstViewer: React.FC<BlockAstViewerProps> = ({ contentJson, className }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  let blocks: BlockAstNode[] = [];
  try {
    if (typeof contentJson === 'string') {
      blocks = JSON.parse(contentJson);
    } else if (Array.isArray(contentJson)) {
      blocks = contentJson;
    }
  } catch (err) {
    console.error('Failed to parse block AST:', err);
    return (
      <div className="p-4 border border-rose-200 bg-rose-50 text-rose-800 rounded-lg text-xs">
        {typeof contentJson === 'string' ? contentJson : 'Konten tidak dapat dimuat.'}
      </div>
    );
  }

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return <p className="text-slate-400 italic text-sm">Tidak ada konten teks.</p>;
  }

  const renderInlineContent = (content?: BlockInlineContent[]) => {
    if (!content || content.length === 0) return null;
    return content.map((item, idx) => {
      let element: React.ReactNode = item.text || '';
      if (item.styles?.bold) {
        element = <strong key={idx} className="font-semibold text-slate-900">{element}</strong>;
      }
      if (item.styles?.italic) {
        element = <em key={idx}>{element}</em>;
      }
      if (item.styles?.code) {
        element = (
          <code key={idx} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-xs">
            {element}
          </code>
        );
      }
      if (item.type === 'link' || item.href) {
        element = (
          <a
            key={idx}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 font-medium"
          >
            {element}
          </a>
        );
      }
      return <React.Fragment key={idx}>{element}</React.Fragment>;
    });
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}` : null;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
    } catch {
      return null;
    }
    return null;
  };

  return (
    <div className={`space-y-4 text-slate-800 leading-relaxed ${className || ''}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const level = block.props?.level || 1;
            if (level === 1) {
              return (
                <h1
                  key={block.id || index}
                  className="text-2xl font-bold text-slate-900 mt-6 mb-3 border-b border-slate-200 pb-2"
                >
                  {renderInlineContent(block.content)}
                </h1>
              );
            }
            if (level === 2) {
              return (
                <h2
                  key={block.id || index}
                  className="text-xl font-semibold text-slate-900 mt-5 mb-2"
                >
                  {renderInlineContent(block.content)}
                </h2>
              );
            }
            return (
              <h3
                key={block.id || index}
                className="text-lg font-semibold text-slate-900 mt-4 mb-2"
              >
                {renderInlineContent(block.content)}
              </h3>
            );
          }

          case 'paragraph': {
            return (
              <p key={block.id || index} className="text-sm md:text-base text-slate-700 leading-relaxed">
                {renderInlineContent(block.content)}
              </p>
            );
          }

          case 'bulletListItem': {
            return (
              <div key={block.id || index} className="flex items-start space-x-3 ml-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <div className="text-sm md:text-base text-slate-700">
                  {renderInlineContent(block.content)}
                </div>
              </div>
            );
          }

          case 'numberedListItem': {
            return (
              <div key={block.id || index} className="flex items-start space-x-3 ml-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="text-sm md:text-base text-slate-700">
                  {renderInlineContent(block.content)}
                </div>
              </div>
            );
          }

          case 'quote': {
            return (
              <blockquote
                key={block.id || index}
                className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50/50 rounded-r-lg text-slate-800 text-sm my-4 italic"
              >
                {renderInlineContent(block.content)}
              </blockquote>
            );
          }

          case 'image': {
            const src = block.props?.url;
            if (!src) return null;
            return (
              <figure key={block.id || index} className="my-6 rounded-xl border border-slate-200 p-2 bg-white shadow-xs">
                <img
                  src={src}
                  alt={block.props?.caption || 'Ilustrasi kimia'}
                  onClick={() => setSelectedImage(src)}
                  className="w-full max-h-[500px] object-contain rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                />
                {block.props?.caption && (
                  <figcaption className="text-xs text-slate-500 mt-2 text-center">
                    {block.props.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'video': {
            const embedUrl = getYoutubeEmbedUrl(block.props?.url);
            if (!embedUrl) {
              return (
                <div key={block.id || index} className="p-3 border border-slate-200 bg-slate-50 rounded-lg text-xs">
                  Video URL: <a href={block.props?.url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{block.props?.url}</a>
                </div>
              );
            }
            return (
              <div key={block.id || index} className="my-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950">
                <div className="aspect-video w-full">
                  <iframe
                    src={embedUrl}
                    title="Penjelasan Materi Kimia"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          }

          case 'divider': {
            return <hr key={block.id || index} className="my-6 border-t border-slate-200" />;
          }

          default:
            return (
              <div key={block.id || index} className="text-sm text-slate-700">
                {renderInlineContent(block.content)}
              </div>
            );
        }
      })}

      {/* Image Zoom Modal */}
      {selectedImage && (
        <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} title="Pratinjau Gambar" maxWidth="2xl">
          <div className="flex justify-center p-2 bg-slate-100 rounded-lg">
            <img src={selectedImage} alt="Pratinjau penuh" className="max-h-[75vh] object-contain rounded" />
          </div>
        </Modal>
      )}
    </div>
  );
};
