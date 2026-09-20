import React from 'react';
import { Material } from '../../types/material';
import { BlockAstViewer } from '../editor/block-ast-viewer';
import { useAuthStore } from '../../stores/auth-store';

interface MaterialReaderModalProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (material: Material) => void;
}

export const MaterialReaderModal: React.FC<MaterialReaderModalProps> = ({
  material,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  if (!isOpen || !material) return null;

  // Derive cover or placeholder
  const coverUrl =
    material.summary?.match(/https?:\/\/[^\s]+(?:\.jpg|\.png|\.webp)/i)?.[0] ||
    'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80';

  return (
    <div
      id="materialReaderModal"
      className="fixed inset-0 z-50 bg-chem-dark/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 font-sans"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-float flex flex-col overflow-hidden border border-chem-border">
        {/* Header Bar */}
        <div className="px-6 py-3.5 border-b border-chem-border flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span
              id="readerBadge"
              className="font-sans text-xs font-semibold text-chem-forest bg-chem-glow/70 px-3 py-1 rounded-full border border-chem-sage/30"
            >
              {material.module?.title || 'Daur Biogeokimia'}
            </span>
            <span className="text-xs text-chem-ash hidden sm:inline">
              • {material.estimatedReadTime || 5} mnt baca
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onEdit && (
              <button
                type="button"
                id="readerAdminEditBtn"
                onClick={() => onEdit(material)}
                className="text-xs px-3 py-1.5 bg-chem-subtle hover:bg-chem-glow/60 text-chem-dark font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-pen text-[10px]"></i>
                <span>Edit Modul</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-chem-ash hover:text-chem-dark hover:bg-chem-subtle rounded-xl transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-6">
          {/* Cover Hero Banner */}
          <div className="h-44 rounded-2xl overflow-hidden bg-chem-subtle border border-chem-border">
            <img
              id="readerCoverImg"
              src={coverUrl}
              alt={material.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>

          {/* Module Title & Icon Header */}
          <div className="space-y-2">
            <div className="text-2xl text-chem-forest" id="readerIconWrap">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <h1
              id="readerModalTitle"
              className="font-serif text-2xl sm:text-3xl font-semibold text-chem-dark leading-tight"
            >
              {material.title}
            </h1>
            {material.summary && (
              <p className="text-xs sm:text-sm text-chem-ash leading-relaxed">
                {material.summary}
              </p>
            )}
          </div>

          {/* Rendered Modular Content Blocks */}
          <div id="readerBlocksBody" className="pt-2 border-t border-chem-border/60">
            <BlockAstViewer contentJson={material.contentJson} />
          </div>
        </div>
      </div>
    </div>
  );
};
