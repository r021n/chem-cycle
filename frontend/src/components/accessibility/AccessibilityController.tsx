import React, { useEffect, useState, useRef } from 'react';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { Volume2, VolumeX, Pause, Play, X, ListTree, ArrowDown } from 'lucide-react';

export const AccessibilityController: React.FC = () => {
  const {
    contrastMode,
    fontSizeDelta,
    fontWeight,
    lineHeight,
    letterSpacing,
    dyslexiaFont,
    highlightLinks,
    highlightHeadings,
    stopAnimations,
    hideImages,
    bigCursor,
    superFocus,
    readingGuide,
    headingOutlineOpen,
    setHeadingOutlineOpen,
    screenReaderActive,
    setScreenReaderActive,
    speechRate,
    setSpeechRate,
    language,
  } = useAccessibilityStore();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Sync DOM classes and root font size
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Reset accessibility classes
    const classesToRemove: string[] = [];
    body.classList.forEach((cls) => {
      if (cls.startsWith('acc-')) {
        classesToRemove.push(cls);
      }
    });
    classesToRemove.forEach((cls) => body.classList.remove(cls));

    // Contrast
    if (contrastMode !== 'normal') {
      if (contrastMode === 'monochrome') body.classList.add('acc-monochrome');
      else if (contrastMode === 'low-saturation') body.classList.add('acc-low-sat');
      else if (contrastMode === 'high-saturation') body.classList.add('acc-high-sat');
      else if (contrastMode === 'dark-contrast') body.classList.add('acc-dark-contrast');
      else if (contrastMode === 'medium-contrast') body.classList.add('acc-medium-contrast');
      else if (contrastMode === 'high-contrast') body.classList.add('acc-high-contrast');
      else if (contrastMode === 'yellow-black') body.classList.add('acc-yellow-black');
    }

    // Typography
    if (dyslexiaFont) body.classList.add('acc-dyslexia');
    if (fontWeight === 'medium') body.classList.add('acc-weight-medium');
    if (fontWeight === 'bold') body.classList.add('acc-weight-bold');
    if (lineHeight === 'relaxed') body.classList.add('acc-lh-relaxed');
    if (lineHeight === 'loose') body.classList.add('acc-lh-loose');
    if (letterSpacing === 'wide') body.classList.add('acc-ls-wide');
    if (letterSpacing === 'wider') body.classList.add('acc-ls-wider');

    // Visual Markers
    if (highlightLinks) body.classList.add('acc-highlight-links');
    if (highlightHeadings) body.classList.add('acc-highlight-headings');

    // Distraction & Media
    if (stopAnimations) body.classList.add('acc-stop-animations');
    if (hideImages) body.classList.add('acc-hide-images');
    if (bigCursor) body.classList.add('acc-big-cursor');

    // Font size scale on root
    const baseRem = 16;
    const deltaRem = fontSizeDelta * 1.5;
    html.style.fontSize = `${baseRem + deltaRem}px`;
  }, [
    contrastMode,
    fontSizeDelta,
    fontWeight,
    lineHeight,
    letterSpacing,
    dyslexiaFont,
    highlightLinks,
    highlightHeadings,
    stopAnimations,
    hideImages,
    bigCursor,
  ]);

  // Track mouse coordinates for reading guide and super focus
  useEffect(() => {
    if (!readingGuide && !superFocus) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingGuide, superFocus]);

  // Extract headings on active page when outline is opened
  useEffect(() => {
    if (headingOutlineOpen) {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
      const items = elements.map((el, i) => {
        let id = el.id;
        if (!id) {
          id = `heading-outline-${i}`;
          el.id = id;
        }
        return {
          id,
          text: el.textContent?.trim() || `Judul ${i + 1}`,
          level: parseInt(el.tagName.replace('H', ''), 10),
        };
      });
      setHeadings(items);
    }
  }, [headingOutlineOpen]);

  // Screen Reader / Web Speech Synthesizer
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleStartSpeech = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    // Get selected text or main page text
    const selected = window.getSelection()?.toString();
    const textToRead =
      selected && selected.length > 5
        ? selected
        : document.querySelector('main')?.innerText || document.body.innerText;

    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 3000));
    utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
    utterance.rate = speechRate;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
    setScreenReaderActive(true);
  };

  const handlePauseSpeech = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleStopSpeech = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setScreenReaderActive(false);
  };

  const jumpToHeading = (id: string) => {
    setHeadingOutlineOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('sr-highlight-speaking');
      setTimeout(() => target.classList.remove('sr-highlight-speaking'), 2000);
    }
  };

  return (
    <>
      {/* 1. Reading Guide Line */}
      {readingGuide && (
        <div
          className="fixed left-0 right-0 pointer-events-none z-50 border-b-2 border-emerald-500 bg-emerald-500/15 transition-transform duration-75"
          style={{
            top: 0,
            transform: `translateY(${mousePos.y}px)`,
            height: '24px',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
          }}
        />
      )}

      {/* 2. Super Focus Masking */}
      {superFocus && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 bg-black/75 transition-all duration-75"
            style={{ height: Math.max(0, mousePos.y - 70) }}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-black/75 transition-all duration-75"
            style={{ top: Math.min(window.innerHeight, mousePos.y + 70) }}
          />
        </div>
      )}

      {/* 3. Screen Reader Floating Tool Strip */}
      {screenReaderActive && (
        <div className="fixed bottom-24 right-6 z-50 bg-chem-dark text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce-short">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold">
              {language === 'id' ? 'Pembaca Layar' : 'Screen Reader'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            {!isSpeaking ? (
              <button
                type="button"
                onClick={handleStartSpeech}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Mulai Membaca"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseSpeech}
                className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                title={isPaused ? 'Lanjutkan' : 'Jeda'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Lanjut' : 'Jeda'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStopSpeech}
              className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer text-xs"
              title="Hentikan"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-white/20 pl-2">
            <span className="text-[10px] text-chem-glow">Kec:</span>
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setSpeechRate(rate)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  speechRate === rate ? 'bg-emerald-500 text-black font-bold' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStopSpeech}
            className="text-white/60 hover:text-white p-1 ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Heading Structure Quick-Jump Modal */}
      {headingOutlineOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-chem-border overflow-hidden">
            <div className="px-5 py-4 bg-chem-subtle border-b border-chem-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-chem-forest">
                <ListTree className="w-5 h-5 text-chem-sage" />
                <h3 className="font-semibold text-sm">
                  {language === 'id' ? 'Navigasi Struktur Heading Dokumen' : 'Heading Structure Navigation'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHeadingOutlineOpen(false)}
                className="p-1 text-chem-ash hover:text-chem-dark rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {headings.length === 0 ? (
                <p className="text-xs text-chem-ash italic py-6 text-center">
                  {language === 'id' ? 'Tidak ditemukan heading pada halaman ini.' : 'No headings found on this page.'}
                </p>
              ) : (
                headings.map((h, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToHeading(h.id)}
                    className={`w-full text-left p-2.5 rounded-xl hover:bg-chem-glow/60 transition-colors flex items-center gap-2 group cursor-pointer ${
                      h.level === 1
                        ? 'font-bold text-chem-dark text-sm bg-chem-subtle/50'
                        : h.level === 2
                        ? 'font-semibold text-chem-forest text-xs pl-5'
                        : 'text-chem-ash text-xs pl-8'
                    }`}
                  >
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-chem-paper border border-chem-border text-chem-ash">
                      H{h.level}
                    </span>
                    <span className="flex-1 truncate">{h.text}</span>
                    <ArrowDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-chem-sage transition-opacity" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
