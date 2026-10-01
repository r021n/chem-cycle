import React, { useState } from 'react';
import { QuizSection } from '../../types/app';
import { resolveMediaUrl } from '../../lib/media';
import { getEmbedInfo } from '../../lib/embed';
import { segmentsPlainText } from '../../lib/rich-text';
import { renderInlineContent } from '../../lib/rich-text-render';
import { Modal } from '../ui/modal';
import { LinkCard } from './link-card';

interface QuizSectionViewerProps {
  sections: QuizSection[];
  className?: string;
}

export const QuizSectionViewer: React.FC<QuizSectionViewerProps> = ({
  sections,
  className,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!sections || sections.length === 0) return null;

  const alignStyle = (align?: string): React.CSSProperties | undefined =>
    align && align !== 'left'
      ? { textAlign: align as React.CSSProperties['textAlign'] }
      : undefined;

  const renderText = (section: {
    content?: Parameters<typeof renderInlineContent>[0];
    text?: string;
  }) =>
    section.content?.length
      ? renderInlineContent(section.content)
      : section.text || '';

  return (
    <div className={`space-y-4 break-words ${className || ''}`}>
      {sections.map((section, index) => {
        switch (section.type) {
          case 'text': {
            const plain = segmentsPlainText(section.content) || section.text || '';
            return plain.trim() ? (
              <p
                key={section.id || index}
                style={alignStyle(section.align)}
                className="text-sm sm:text-base text-chem-dark leading-relaxed whitespace-pre-wrap"
              >
                {renderText(section)}
              </p>
            ) : null;
          }

          case 'heading': {
            const plain = segmentsPlainText(section.content) || section.text || '';
            if (!plain.trim()) return null;
            const headingStyle = alignStyle(section.align);
            return section.level === 3 ? (
              <h4
                key={section.id || index}
                style={headingStyle}
                className="text-sm sm:text-base font-bold text-chem-dark pt-1"
              >
                {renderText(section)}
              </h4>
            ) : (
              <h3
                key={section.id || index}
                style={headingStyle}
                className="font-serif text-lg sm:text-xl font-bold text-chem-dark pt-1"
              >
                {renderText(section)}
              </h3>
            );
          }

          case 'callout': {
            const plain = segmentsPlainText(section.content) || section.text || '';
            return plain.trim() ? (
              <div
                key={section.id || index}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950"
              >
                <span className="text-lg leading-none shrink-0">{section.emoji || '💡'}</span>
                <p
                  style={alignStyle(section.align)}
                  className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap flex-1"
                >
                  {renderText(section)}
                </p>
              </div>
            ) : null;
          }

          case 'divider':
            return <hr key={section.id || index} className="my-2 border-t border-chem-border" />;

          case 'image': {
            const imgSrc = resolveMediaUrl(section.dataUrl);
            return section.dataUrl ? (
              <figure
                key={section.id || index}
                className="rounded-2xl border border-chem-border bg-chem-subtle/50 p-2"
              >
                <img
                  src={imgSrc}
                  alt={section.caption || 'Ilustrasi soal'}
                  onClick={() => setSelectedImage(imgSrc)}
                  className="w-full max-h-[280px] sm:max-h-[420px] object-contain rounded-xl cursor-zoom-in hover:opacity-95 transition-opacity"
                />
                {section.caption?.trim() && (
                  <figcaption className="text-[11px] text-chem-ash text-center mt-2">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            ) : null;
          }

          case 'youtube': {
            const embed = getEmbedInfo(section.url);
            if (!embed) {
              return section.url.trim() ? (
                <a
                  key={section.id || index}
                  href={section.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-indigo-600 underline break-all"
                >
                  {section.url}
                </a>
              ) : null;
            }
            return (
              <div
                key={section.id || index}
                className="rounded-2xl overflow-hidden border border-chem-border bg-chem-dark"
              >
                <div className="aspect-video w-full">
                  <iframe
                    src={embed.embedUrl}
                    title="Video Pembelajaran Kimia"
                    loading="lazy"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          }

          case 'link': {
            if (!section.url.trim()) return null;
            return (
              <LinkCard
                key={section.id || index}
                url={section.url}
                title={section.title}
                description={section.description}
              />
            );
          }

          case 'orderedList':
            return section.items.filter((item) => item.trim()).length > 0 ? (
              <ol key={section.id || index} className="space-y-2 list-decimal pl-6 marker:text-chem-forest marker:font-bold">
                {section.items
                  .filter((item) => item.trim())
                  .map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-chem-dark leading-relaxed">
                      {item}
                    </li>
                  ))}
              </ol>
            ) : null;

          case 'unorderedList':
            return section.items.filter((item) => item.trim()).length > 0 ? (
              <ul key={section.id || index} className="space-y-2 list-disc pl-6 marker:bg-chem-forest marker:rounded-full">
                {section.items
                  .filter((item) => item.trim())
                  .map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-chem-dark leading-relaxed">
                      {item}
                    </li>
                  ))}
              </ul>
            ) : null;

          default:
            return null;
        }
      })}

      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Pratinjau Gambar"
          maxWidth="2xl"
        >
          <div className="flex justify-center p-2 bg-chem-subtle rounded-xl">
            <img
              src={selectedImage}
              alt="Pratinjau penuh"
              className="max-h-[75vh] object-contain rounded"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
