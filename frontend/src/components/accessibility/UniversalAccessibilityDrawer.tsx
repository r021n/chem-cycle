import React from 'react';
import { useAccessibilityStore, ContrastMode } from '../../store/accessibilityStore';
import {
  Accessibility,
  X,
  RotateCcw,
  Languages,
  Eye,
  Type,
  Highlighter,
  SlidersHorizontal,
  Focus,
  Volume2,
  Minus,
  Plus,
  Compass,
  Sparkles,
  MousePointer,
  SplitSquareVertical,
  Check,
} from 'lucide-react';

export const UniversalAccessibilityDrawer: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    toggleOpen,
    language,
    setLanguage,
    contrastMode,
    setContrastMode,
    fontSizeDelta,
    increaseFontSize,
    decreaseFontSize,
    fontWeight,
    setFontWeight,
    lineHeight,
    setLineHeight,
    letterSpacing,
    setLetterSpacing,
    dyslexiaFont,
    toggleDyslexiaFont,
    highlightLinks,
    toggleHighlightLinks,
    highlightHeadings,
    toggleHighlightHeadings,
    stopAnimations,
    toggleStopAnimations,
    hideImages,
    toggleHideImages,
    showAltText,
    toggleShowAltText,
    superFocus,
    toggleSuperFocus,
    readingGuide,
    toggleReadingGuide,
    bigCursor,
    toggleBigCursor,
    setHeadingOutlineOpen,
    screenReaderActive,
    setScreenReaderActive,
    resetAll,
  } = useAccessibilityStore();

  const contrastOptions: Array<{ mode: ContrastMode; label: string; desc: string; bg: string }> = [
    { mode: 'normal', label: 'Standar', desc: 'Warna default platform', bg: 'bg-white text-slate-800' },
    { mode: 'monochrome', label: 'Monokrom', desc: 'Skala abu-abu (grayscale)', bg: 'bg-zinc-300 text-zinc-900' },
    { mode: 'low-saturation', label: 'Saturasi Rendah', desc: 'Warna lebih lembut', bg: 'bg-emerald-100 text-emerald-900' },
    { mode: 'high-saturation', label: 'Saturasi Tinggi', desc: 'Warna lebih cerah', bg: 'bg-emerald-300 text-emerald-950 font-bold' },
    { mode: 'dark-contrast', label: 'Kontras Gelap', desc: 'Latar gelap ramah mata', bg: 'bg-zinc-900 text-emerald-300 border border-zinc-700' },
    { mode: 'medium-contrast', label: 'Kontras Sedang', desc: 'Peningkatan kontras 25%', bg: 'bg-amber-100 text-amber-950' },
    { mode: 'high-contrast', label: 'Kontras Tinggi', desc: 'Peningkatan kontras 60%', bg: 'bg-black text-white font-bold' },
    { mode: 'yellow-black', label: 'Kuning - Hitam', desc: 'Standar visibilitas WCAG AAA', bg: 'bg-black text-yellow-300 font-bold border border-yellow-400' },
  ];

  return (
    <>
      {/* Global Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={toggleOpen}
          aria-label="Buka Pengaturan Aksesibilitas Universal (Alt+A)"
          className="group relative flex items-center gap-2.5 bg-chem-forest hover:bg-chem-moss text-white px-4 py-3.5 rounded-full shadow-float border-2 border-chem-mint/30 hover:border-chem-glow transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-chem-glow/50"
        >
          <Accessibility className="w-5 h-5 text-chem-glow animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            {language === 'id' ? 'Aksesibilitas' : 'Accessibility'}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-chem-glow">
            UDL
          </span>
        </button>
      </div>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl flex flex-col border-l border-chem-border transition-transform duration-300 ease-in-out font-sans ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Panel Aksesibilitas Universal"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4.5 bg-chem-forest text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-chem-mint/20 border border-chem-mint/30 flex items-center justify-center text-chem-glow">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                {language === 'id' ? 'Aksesibilitas Universal' : 'Universal Accessibility'}
                <span className="text-[10px] font-mono bg-chem-glow/20 text-chem-glow px-2 py-0.5 rounded-full">
                  WCAG 2.1 AA
                </span>
              </h2>
              <p className="text-[11px] text-chem-glow/80">
                {language === 'id'
                  ? 'Penyesuaian kenyamanan visual & alat bantu'
                  : 'Visual adjustments & assistive tools'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetAll}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Reset ke Pengaturan Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label="Tutup Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-chem-dark">
          {/* Section 1: Bahasa Antarmuka */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-chem-forest uppercase tracking-wider">
              <Languages className="w-4 h-4 text-chem-sage" />
              <span>{language === 'id' ? 'Bahasa Antarmuka' : 'Interface Language'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  language === 'id'
                    ? 'bg-chem-glow/70 border-chem-sage text-chem-forest font-bold shadow-xs'
                    : 'bg-chem-subtle/50 border-chem-border text-chem-ash hover:bg-chem-subtle'
                }`}
              >
                🇮🇩 Bahasa Indonesia {language === 'id' && <Check className="w-3.5 h-3.5 text-chem-sage" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-chem-glow/70 border-chem-sage text-chem-forest font-bold shadow-xs'
                    : 'bg-chem-subtle/50 border-chem-border text-chem-ash hover:bg-chem-subtle'
                }`}
              >
                🇬🇧 English {language === 'en' && <Check className="w-3.5 h-3.5 text-chem-sage" />}
              </button>
            </div>
          </div>

          {/* Section 2: Skema Warna & Kontras */}
          <div className="space-y-3 pt-3 border-t border-chem-border">
            <div className="flex items-center gap-2 text-xs font-bold text-chem-forest uppercase tracking-wider">
              <Eye className="w-4 h-4 text-chem-sage" />
              <span>{language === 'id' ? 'Skema Warna & Kontras' : 'Color Schemes & Contrast'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {contrastOptions.map((opt) => (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setContrastMode(opt.mode)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-18 ${
                    opt.bg
                  } ${
                    contrastMode === opt.mode
                      ? 'ring-2 ring-chem-forest border-transparent shadow-xs'
                      : 'border-chem-border hover:border-chem-sage'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-tight">{opt.label}</span>
                    {contrastMode === opt.mode && <Check className="w-3.5 h-3.5 text-chem-forest shrink-0" />}
                  </div>
                  <span className="text-[10px] opacity-75 line-clamp-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Penyesuaian Tipografi */}
          <div className="space-y-3.5 pt-3 border-t border-chem-border">
            <div className="flex items-center gap-2 text-xs font-bold text-chem-forest uppercase tracking-wider">
              <Type className="w-4 h-4 text-chem-sage" />
              <span>{language === 'id' ? 'Penyesuaian Tipografi' : 'Typography Settings'}</span>
            </div>

            {/* Font Size delta */}
            <div className="bg-chem-subtle/70 p-3 rounded-2xl border border-chem-border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-chem-dark">
                  {language === 'id' ? 'Ukuran Teks' : 'Font Size'}
                </p>
                <p className="text-[10px] text-chem-ash">
                  {fontSizeDelta === 0
                    ? '100% (Standar)'
                    : `${100 + fontSizeDelta * 10}%`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decreaseFontSize}
                  disabled={fontSizeDelta <= -2}
                  className="w-8 h-8 rounded-lg bg-white border border-chem-border flex items-center justify-center text-chem-forest hover:bg-chem-glow/50 disabled:opacity-40 cursor-pointer"
                  title="Kecilkan Teks (A-)"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-xs font-mono font-bold">
                  {fontSizeDelta > 0 ? `+${fontSizeDelta}` : fontSizeDelta}
                </span>
                <button
                  type="button"
                  onClick={increaseFontSize}
                  disabled={fontSizeDelta >= 3}
                  className="w-8 h-8 rounded-lg bg-white border border-chem-border flex items-center justify-center text-chem-forest hover:bg-chem-glow/50 disabled:opacity-40 cursor-pointer"
                  title="Besarkan Teks (A+)"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Font Weight */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-chem-ash">
                {language === 'id' ? 'Ketebalan Huruf' : 'Font Weight'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'medium', 'bold'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setFontWeight(w)}
                    className={`py-1.5 px-2 rounded-lg border text-xs capitalize cursor-pointer transition-all ${
                      fontWeight === w
                        ? 'bg-chem-forest text-white font-bold border-chem-forest'
                        : 'bg-white border-chem-border text-chem-ash hover:bg-chem-subtle'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height & Letter Spacing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-chem-ash">
                  {language === 'id' ? 'Tinggi Baris' : 'Line Height'}
                </label>
                <select
                  value={lineHeight}
                  onChange={(e) => setLineHeight(e.target.value as 'normal' | 'relaxed' | 'loose')}
                  className="w-full text-xs p-2 rounded-xl bg-white border border-chem-border text-chem-dark cursor-pointer"
                >
                  <option value="normal">Normal (1.6)</option>
                  <option value="relaxed">Renggang (1.8)</option>
                  <option value="loose">Sangat Renggang (2.2)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-chem-ash">
                  {language === 'id' ? 'Spasi Huruf' : 'Letter Spacing'}
                </label>
                <select
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(e.target.value as 'normal' | 'wide' | 'wider')}
                  className="w-full text-xs p-2 rounded-xl bg-white border border-chem-border text-chem-dark cursor-pointer"
                >
                  <option value="normal">Normal</option>
                  <option value="wide">Lebar (+0.06em)</option>
                  <option value="wider">Sangat Lebar (+0.12em)</option>
                </select>
              </div>
            </div>

            {/* Dyslexia Font Toggle */}
            <div className="bg-chem-subtle/70 p-3 rounded-2xl border border-chem-border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-chem-dark">
                  {language === 'id' ? 'Font Ramah Disleksia' : 'Dyslexia Friendly Font'}
                </p>
                <p className="text-[10px] text-chem-ash">
                  {language === 'id'
                    ? 'Tipografi khusus untuk kemudahan navigasi kata'
                    : 'Weighted letter shapes to reduce letter flipping'}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleDyslexiaFont}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  dyslexiaFont ? 'bg-chem-sage' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    dyslexiaFont ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 4: Penanda Visual Konten */}
          <div className="space-y-3 pt-3 border-t border-chem-border">
            <div className="flex items-center gap-2 text-xs font-bold text-chem-forest uppercase tracking-wider">
              <Highlighter className="w-4 h-4 text-chem-sage" />
              <span>{language === 'id' ? 'Penanda Visual Konten' : 'Visual Content Markers'}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-chem-border bg-chem-paper hover:bg-chem-subtle/50 transition-colors">
                <span className="text-xs font-medium">
                  {language === 'id' ? 'Sorot Tautan (Highlight Links)' : 'Highlight Links'}
                </span>
                <button
                  type="button"
                  onClick={toggleHighlightLinks}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    highlightLinks ? 'bg-chem-sage' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      highlightLinks ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-chem-border bg-chem-paper hover:bg-chem-subtle/50 transition-colors">
                <span className="text-xs font-medium">
                  {language === 'id' ? 'Sorot Judul (Highlight Headings)' : 'Highlight Headings'}
                </span>
                <button
                  type="button"
                  onClick={toggleHighlightHeadings}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    highlightHeadings ? 'bg-chem-sage' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      highlightHeadings ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Kontrol Media & Distraksi */}
          <div className="space-y-3 pt-3 border-t border-chem-border">
            <div className="flex items-center gap-2 text-xs font-bold text-chem-forest uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-chem-sage" />
              <span>{language === 'id' ? 'Kontrol Media & Distraksi' : 'Media & Distraction Control'}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-chem-border bg-chem-paper hover:bg-chem-subtle/50 transition-colors">
                <span className="text-xs font-medium">
                  {language === 'id' ? 'Hentikan Animasi Visual' : 'Pause All Animations'}
                </span>
                <button
                  type="button"
                  onClick={toggleStopAnimations}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    stopAnimations ? 'bg-chem-sage' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      stopAnimations ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-chem-border bg-chem-paper hover:bg-chem-subtle/50 transition-colors">
                <span className="text-xs font-medium">
                  {language === 'id' ? 'Sembunyikan Gambar' : 'Hide Images'}
                </span>
                <button
                  type="button"
                  onClick={toggleHideImages}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    hideImages ? 'bg-chem-sage' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      hideImages ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-chem-border bg-chem-paper hover:bg-chem-subtle/50 transition-colors">
                <span className="text-xs font-medium">
                  {language === 'id' ? 'Tampilkan Deskripsi Alt-Text' : 'Show Alt-Text Badges'}
                </span>
                <button
                  type="button"
                  onClick={toggleShowAltText}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    showAltText ? 'bg-chem-sage' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                      showAltText ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Alat Bantu Asistif */}
          <div className="space-y-3 pt-3 border-t border-chem-border">
            <div className="flex items-center gap-2 text-xs font-bold text-chem-forest uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-chem-sage" />
              <span>{language === 'id' ? 'Alat Bantu Asistif Khusus' : 'Special Assistive Tools'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Super Focus */}
              <button
                type="button"
                onClick={toggleSuperFocus}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  superFocus
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    : 'bg-chem-subtle/60 border-chem-border text-chem-dark hover:border-chem-sage'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Focus className="w-4 h-4 text-chem-sage" />
                  <span className="text-[10px] font-bold uppercase">{superFocus ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <span className="text-xs font-bold">Super Focus</span>
                <span className="text-[10px] text-chem-ash leading-tight">
                  Masking fokus baca mengikuti kursor
                </span>
              </button>

              {/* Garis Panduan Membaca */}
              <button
                type="button"
                onClick={toggleReadingGuide}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  readingGuide
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    : 'bg-chem-subtle/60 border-chem-border text-chem-dark hover:border-chem-sage'
                }`}
              >
                <div className="flex items-center justify-between">
                  <SplitSquareVertical className="w-4 h-4 text-chem-sage" />
                  <span className="text-[10px] font-bold uppercase">{readingGuide ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <span className="text-xs font-bold">Panduan Baca</span>
                <span className="text-[10px] text-chem-ash leading-tight">
                  Penggaris bar horizontal pemandu mata
                </span>
              </button>

              {/* Kursor Besar */}
              <button
                type="button"
                onClick={toggleBigCursor}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  bigCursor
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    : 'bg-chem-subtle/60 border-chem-border text-chem-dark hover:border-chem-sage'
                }`}
              >
                <div className="flex items-center justify-between">
                  <MousePointer className="w-4 h-4 text-chem-sage" />
                  <span className="text-[10px] font-bold uppercase">{bigCursor ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <span className="text-xs font-bold">Kursor Besar</span>
                <span className="text-[10px] text-chem-ash leading-tight">
                  Pointer kontras tinggi ekstra besar
                </span>
              </button>

              {/* Pembaca Layar TTS */}
              <button
                type="button"
                onClick={() => setScreenReaderActive(!screenReaderActive)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  screenReaderActive
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    : 'bg-chem-subtle/60 border-chem-border text-chem-dark hover:border-chem-sage'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Volume2 className="w-4 h-4 text-chem-sage" />
                  <span className="text-[10px] font-bold uppercase">{screenReaderActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <span className="text-xs font-bold">Screen Reader</span>
                <span className="text-[10px] text-chem-ash leading-tight">
                  Pembaca suara teks otomatis (TTS)
                </span>
              </button>
            </div>

            {/* Heading Structure Tree Navigator */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setHeadingOutlineOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-chem-sage/30 bg-chem-glow/40 hover:bg-chem-glow text-chem-forest text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-chem-sage" />
              <span>{language === 'id' ? 'Buka Peta Struktur Heading Dokumen' : 'Open Heading Structure Navigator'}</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-chem-subtle border-t border-chem-border text-center shrink-0">
          <p className="text-[11px] text-chem-ash">
            Platform Pembelajaran Kimia Inklusif • UDL & WCAG 2.1 AA Compliant
          </p>
        </div>
      </div>
    </>
  );
};
