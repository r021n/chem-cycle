import React, { useState } from "react";
import { BlockAstNode } from "../../types/material";
import { Modal } from "../ui/modal";
import { resolveMediaUrl } from "../../lib/media";
import { getEmbedInfo } from "../../lib/embed";
import { renderInlineContent } from "../../lib/rich-text-render";
import { segmentsPlainText } from "../../lib/rich-text";
import { LinkCard } from "./link-card";

interface BlockAstViewerProps {
  contentJson: string | BlockAstNode[];
  className?: string;
}

export const BlockAstViewer: React.FC<BlockAstViewerProps> = ({
  contentJson,
  className,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  let blocks: BlockAstNode[] = [];
  try {
    if (typeof contentJson === "string") {
      blocks = JSON.parse(contentJson);
    } else if (Array.isArray(contentJson)) {
      blocks = contentJson;
    }
  } catch (err) {
    console.error("Failed to parse block AST:", err);
    return (
      <div className="p-4 border border-rose-200 bg-rose-50 text-rose-800 rounded-lg text-xs">
        {typeof contentJson === "string"
          ? contentJson
          : "Konten tidak dapat dimuat."}
      </div>
    );
  }

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return (
      <p className="text-slate-400 italic text-sm">Tidak ada konten teks.</p>
    );
  }

  const alignStyle = (block: BlockAstNode): React.CSSProperties | undefined =>
    block.props?.align && block.props.align !== "left"
      ? { textAlign: block.props.align }
      : undefined;

  const renderBlockContent = (block: BlockAstNode) =>
    renderInlineContent(block.content) || block.props?.text || null;

  return (
    <div
      className={`space-y-4 text-slate-800 leading-relaxed wrap-break-word ${className || ""}`}
    >
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const level = block.props?.level || 1;
            if (level === 1) {
              return (
                <h1
                  key={block.id || index}
                  style={alignStyle(block)}
                  className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 border-b border-slate-200 pb-2"
                >
                  {renderBlockContent(block)}
                </h1>
              );
            }
            if (level === 2) {
              return (
                <h2
                  key={block.id || index}
                  style={alignStyle(block)}
                  className="text-xl font-semibold text-slate-900 mt-5 mb-2"
                >
                  {renderBlockContent(block)}
                </h2>
              );
            }
            return (
              <h3
                key={block.id || index}
                style={alignStyle(block)}
                className="text-lg font-semibold text-slate-900 mt-4 mb-2"
              >
                {renderBlockContent(block)}
              </h3>
            );
          }

          case "paragraph": {
            return (
              <p
                key={block.id || index}
                style={alignStyle(block)}
                className="text-sm md:text-base text-slate-700 leading-relaxed"
              >
                {renderBlockContent(block)}
              </p>
            );
          }

          case "bulletListItem": {
            return (
              <div
                key={block.id || index}
                data-block-list-item="bullet"
                className="flex items-start space-x-3 ml-2"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <div
                  style={alignStyle(block)}
                  className="text-sm md:text-base text-slate-700 flex-1"
                >
                  {renderBlockContent(block)}
                </div>
              </div>
            );
          }

          case "numberedListItem": {
            return (
              <div
                key={block.id || index}
                data-block-list-item="numbered"
                className="flex items-start space-x-3 ml-2"
              >
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div
                  style={alignStyle(block)}
                  className="text-sm md:text-base text-slate-700 flex-1"
                >
                  {renderBlockContent(block)}
                </div>
              </div>
            );
          }

          case "quote": {
            return (
              <blockquote
                key={block.id || index}
                style={alignStyle(block)}
                className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50/50 rounded-r-lg text-slate-800 text-sm my-4 italic"
              >
                {renderBlockContent(block)}
              </blockquote>
            );
          }

          case "link": {
            const url = block.props?.url || "";
            if (!url.trim()) return null;
            return (
              <LinkCard
                key={block.id || index}
                url={url}
                title={block.props?.title}
                description={block.props?.description}
                className="my-4"
              />
            );
          }

          case "image": {
            const rawSrc = block.props?.url;
            if (!rawSrc) return null;
            const src = resolveMediaUrl(rawSrc);
            return (
              <figure
                key={block.id || index}
                className="my-6 rounded-xl border border-slate-200 p-1.5 sm:p-2 bg-white shadow-xs"
              >
                <img
                  src={src}
                  alt={block.props?.caption || "Ilustrasi kimia"}
                  onClick={() => setSelectedImage(src)}
                  className="w-full max-h-80 sm:max-h-125 object-contain rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                />
                {block.props?.caption && (
                  <figcaption className="text-xs text-slate-500 mt-2 text-center">
                    {block.props.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "video": {
            const embed = getEmbedInfo(block.props?.url);
            if (!embed) {
              if (!block.props?.url?.trim()) return null;
              return (
                <div
                  key={block.id || index}
                  className="p-3 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                >
                  Video URL:{" "}
                  <a
                    href={block.props?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline"
                  >
                    {block.props?.url}
                  </a>
                </div>
              );
            }
            return (
              <div
                key={block.id || index}
                className="my-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950"
              >
                <div className="aspect-video w-full">
                  <iframe
                    src={embed.embedUrl}
                    title="Penjelasan Materi Kimia"
                    loading="lazy"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          }

          case "callout": {
            const text = segmentsPlainText(block.content) || block.props?.text || "";
            const emoji = block.props?.emoji || "💡";
            return (
              <div
                key={block.id || index}
                data-block-callout="true"
                className="my-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3"
              >
                <span className="text-xl select-none leading-none shrink-0">
                  {emoji}
                </span>
                <div
                  style={alignStyle(block)}
                  className="text-sm md:text-base text-slate-800 leading-relaxed flex-1"
                >
                  {renderInlineContent(block.content) || text}
                </div>
              </div>
            );
          }

          case "divider": {
            return (
              <hr
                key={block.id || index}
                className="my-6 border-t border-slate-200"
              />
            );
          }

          default:
            return (
              <div key={block.id || index} className="text-sm text-slate-700">
                {renderBlockContent(block)}
              </div>
            );
        }
      })}

      {/* Image Zoom Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Pratinjau Gambar"
          maxWidth="2xl"
        >
          <div className="flex justify-center p-2 bg-slate-100 rounded-lg">
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
