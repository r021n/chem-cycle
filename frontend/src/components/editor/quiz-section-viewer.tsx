import React, { useState } from 'react';
import { QuizSection } from '../../types/app';
import { getYoutubeEmbedUrl } from '../../lib/media';
import { Modal } from '../ui/modal';
import { ChemFormula } from '../common/ChemFormula';

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

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {sections.map((section, index) => {
        switch (section.type) {
          case 'text':
            return section.text.trim() ? (
              <p
                key={section.id || index}
                className="text-sm sm:text-base text-chem-dark leading-relaxed whitespace-pre-wrap"
              >
                {section.text}
              </p>
            ) : null;

          case 'formula':
            return section.formula.trim() ? (
              <div
                key={section.id || index}
                className="p-3.5 sm:p-4 rounded-2xl bg-chem-glow/40 border border-chem-sage/40 flex flex-col items-center justify-center text-center space-y-1 shadow-2xs"
              >
                <div className="overflow-x-auto max-w-full py-1">
                  <ChemFormula
                    formula={section.formula}
                    className="text-base sm:text-lg font-bold text-chem-forest"
                  />
                </div>
                {section.caption?.trim() && (
                  <p className="text-[11px] text-chem-ash italic">{section.caption}</p>
                )}
              </div>
            ) : null;

          case 'heading':
            return section.text.trim() ? (
              section.level === 3 ? (
                <h4 key={section.id || index} className="text-sm sm:text-base font-bold text-chem-dark pt-1">
                  {section.text}
                </h4>
              ) : (
                <h3 key={section.id || index} className="font-serif text-lg sm:text-xl font-bold text-chem-dark pt-1">
                  {section.text}
                </h3>
              )
            ) : null;

          case 'callout':
            return section.text.trim() ? (
              <div
                key={section.id || index}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950"
              >
                <span className="text-lg leading-none shrink-0">{section.emoji || '💡'}</span>
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap flex-1">{section.text}</p>
              </div>
            ) : null;

          case 'divider':
            return <hr key={section.id || index} className="my-2 border-t border-chem-border" />;

          case 'image':
            return section.dataUrl ? (
              <figure
                key={section.id || index}
                className="rounded-2xl border border-chem-border bg-chem-subtle/50 p-2"
              >
                <img
                  src={section.dataUrl}
                  alt={section.caption || 'Ilustrasi soal'}
                  onClick={() => setSelectedImage(section.dataUrl)}
                  className="w-full max-h-[420px] object-contain rounded-xl cursor-zoom-in hover:opacity-95 transition-opacity"
                />
                {section.caption?.trim() && (
                  <figcaption className="text-[11px] text-chem-ash text-center mt-2">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            ) : null;

          case 'youtube': {
            const embedUrl = getYoutubeEmbedUrl(section.url);
            if (!embedUrl) {
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
                    src={embedUrl}
                    title="Video Pembelajaran Kimia"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
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
