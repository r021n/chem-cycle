import React, { useEffect, useState, useRef } from 'react';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  X,
  ListTree,
  ArrowDown,
  SkipForward,
  SkipBack,
  GripVertical,
} from 'lucide-react';

interface ReadSegment {
  el: HTMLElement;
  text: string;
}

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
  const [segments, setSegments] = useState<ReadSegment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(-1);
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number } | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const segmentsRef = useRef<ReadSegment[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Sync DOM classes and root font size
  useEffect(() => {
    const contentRoot = document.getElementById('accessible-content-root');
    const body = document.body;
    const html = document.documentElement;
    const target = contentRoot || body;

    // Reset accessibility classes on both target and body
    const removeAccClasses = (el: HTMLElement) => {
      const classesToRemove: string[] = [];
      el.classList.forEach((cls) => {
        if (cls.startsWith('acc-')) {
          classesToRemove.push(cls);
        }
      });
      classesToRemove.forEach((cls) => el.classList.remove(cls));
    };

    if (contentRoot) removeAccClasses(contentRoot);
    removeAccClasses(body);

    // Contrast
    if (contrastMode !== 'normal') {
      if (contrastMode === 'monochrome') target.classList.add('acc-monochrome');
      else if (contrastMode === 'low-saturation') target.classList.add('acc-low-sat');
      else if (contrastMode === 'high-saturation') target.classList.add('acc-high-sat');
      else if (contrastMode === 'dark-contrast') target.classList.add('acc-dark-contrast');
      else if (contrastMode === 'medium-contrast') target.classList.add('acc-medium-contrast');
      else if (contrastMode === 'high-contrast') target.classList.add('acc-high-contrast');
      else if (contrastMode === 'yellow-black') target.classList.add('acc-yellow-black');
    }

    // Typography
    if (dyslexiaFont) target.classList.add('acc-dyslexia');
    if (fontWeight === 'medium') target.classList.add('acc-weight-medium');
    if (fontWeight === 'bold') target.classList.add('acc-weight-bold');
    if (lineHeight === 'relaxed') target.classList.add('acc-lh-relaxed');
    if (lineHeight === 'loose') target.classList.add('acc-lh-loose');
    if (letterSpacing === 'wide') target.classList.add('acc-ls-wide');
    if (letterSpacing === 'wider') target.classList.add('acc-ls-wider');

    // Visual Markers
    if (highlightLinks) target.classList.add('acc-highlight-links');
    if (highlightHeadings) target.classList.add('acc-highlight-headings');

    // Distraction & Media
    if (stopAnimations) target.classList.add('acc-stop-animations');
    if (hideImages) target.classList.add('acc-hide-images');
    if (bigCursor) target.classList.add('acc-big-cursor');

    // Font size scale: apply zoom/scale only to page content container without affecting html/drawer
    if (contentRoot) {
      html.style.fontSize = '';
      const zoomRatio = 1 + fontSizeDelta * 0.09375;
      contentRoot.style.zoom = String(zoomRatio);
    } else {
      const baseRem = 16;
      const deltaRem = fontSizeDelta * 1.5;
      html.style.fontSize = `${baseRem + deltaRem}px`;
    }
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

  // Screen Reader / Built-in Browser Web Speech Synthesizer (100% Offline via OS Speech Engine)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        if (!synthRef.current) return;
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Helper to extract readable segments from the main content
  const getReadableSegments = (): ReadSegment[] => {
    const root =
      document.querySelector('main') ||
      document.getElementById('accessible-content-root') ||
      document.body;

    if (!root) return [];

    // Expanded selectors: Headings, paragraphs, lists, quotes, table cells, form labels, buttons/choices
    const rawElements = Array.from(
      root.querySelectorAll<HTMLElement>(
        'h1, h2, h3, h4, h5, h6, p, li, blockquote, dt, dd, th, td, label, button, [role="button"], [role="option"], [role="radio"], [data-block-list-item], [data-block-callout]'
      )
    );

    const candidates: HTMLElement[] = [];
    for (const el of rawElements) {
      // Exclude accessibility drawer, fab button, TTS control panel, navigation bars, and footers
      if (
        el.closest('#accessibility-drawer') ||
        el.closest('#accessibility-fab') ||
        el.closest('#sr-control-panel') ||
        el.closest('nav') ||
        el.closest('footer')
      ) {
        continue;
      }

      // Skip elements that are hidden or collapsed
      if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) {
        continue;
      }

      const rawTxt = el.innerText?.trim();
      if (!rawTxt || rawTxt.length < 2) continue;

      // Filter out pure single/double digit stepper buttons (e.g. question index pills 1, 2, 3...)
      if (/^\d{1,2}$/.test(rawTxt) && el.tagName.toLowerCase() === 'button') {
        continue;
      }

      candidates.push(el);
    }

    // Keep top-level elements so we don't read nested text twice
    const topCandidates = candidates.filter(
      (el) => !candidates.some((other) => other !== el && other.contains(el))
    );

    return topCandidates.map((el) => {
      let cleanText = el.innerText.trim();
      // Format quiz choices like "A\nText" or "A \n Text" into "A. Text" for smooth, natural speech
      cleanText = cleanText.replace(/^([A-Ea-e])\s*\n+\s*/, '$1. ');
      // Numbered list blocks render the marker ("1\nText") in a separate span; speak it as "1. Text"
      if (el.hasAttribute('data-block-list-item')) {
        cleanText = cleanText.replace(/^(\d{1,3})\s*\n+\s*/, '$1. ');
      }
      // Callout blocks start with an emoji marker on its own line; skip it so speech starts with the text
      if (el.hasAttribute('data-block-callout')) {
        cleanText = cleanText.replace(/^[^\p{L}\p{N}]*\n+\s*/u, '');
      }
      return {
        el,
        text: cleanText,
      };
    });
  };

  // Helper to select the best offline / local voice
  const getBestOfflineVoice = (lang: 'id' | 'en') => {
    if (!synthRef.current || availableVoices.length === 0) return null;
    const prefix = lang === 'id' ? 'id' : 'en';

    // 1. Exact match with localService (offline OS voice)
    const localMatch = availableVoices.find(
      (v) => v.lang.toLowerCase().startsWith(prefix) && v.localService
    );
    if (localMatch) return localMatch;

    // 2. Any voice matching language
    const langMatch = availableVoices.find((v) =>
      v.lang.toLowerCase().startsWith(prefix)
    );
    if (langMatch) return langMatch;

    // Return null so the browser's native engine handles the language fallback gracefully
    return null;
  };

  // Apply visual highlight to the element currently being spoken
  const highlightSegment = (el: HTMLElement | null) => {
    document.querySelectorAll('.sr-highlight-speaking').forEach((node) => {
      node.classList.remove('sr-highlight-speaking');
    });
    if (el) {
      el.classList.add('sr-highlight-speaking');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Speak a specific segment by index
  const speakSegment = (index: number, segList: ReadSegment[] = segmentsRef.current) => {
    if (!synthRef.current) return;

    if (index < 0 || index >= segList.length) {
      synthRef.current.cancel();
      activeUtteranceRef.current = null;
      currentIndexRef.current = -1;
      setCurrentSegmentIndex(-1);
      setIsSpeaking(false);
      setIsPaused(false);
      isPausedRef.current = false;
      highlightSegment(null);
      return;
    }

    currentIndexRef.current = index;
    setCurrentSegmentIndex(index);
    const target = segList[index];
    highlightSegment(target.el);

    synthRef.current.cancel();

    // 50ms timeout avoids Chromium bug where cancel() aborts immediate speak()
    setTimeout(() => {
      if (!synthRef.current) return;
      if (synthRef.current.paused) {
        synthRef.current.resume();
      }

      const utterance = new SpeechSynthesisUtterance(target.text);
      utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
      utterance.rate = speechRate;

      const chosenVoice = getBestOfflineVoice(language);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        isPausedRef.current = false;
      };

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        if (!isPausedRef.current && currentIndexRef.current === index) {
          speakSegment(index + 1, segList);
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('SpeechSynthesis segment warning:', e.error);
          if (!isPausedRef.current && currentIndexRef.current === index) {
            speakSegment(index + 1, segList);
          }
        }
      };

      // Persistent ref prevents V8 garbage collector from terminating speech mid-playback
      activeUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
      isPausedRef.current = false;
    }, 50);
  };

  const handleStartSpeech = () => {
    if (!synthRef.current) {
      alert(
        language === 'id'
          ? 'Browser Anda belum mendukung Web Speech API bawaan.'
          : 'Your browser does not support the built-in Web Speech API.'
      );
      return;
    }

    // Always fetch fresh segments from the live DOM (e.g. current quiz question)
    const segs = getReadableSegments();
    setSegments(segs);
    segmentsRef.current = segs;

    if (segs.length === 0) {
      alert(
        language === 'id'
          ? 'Tidak ada konten teks yang dapat dibaca pada halaman ini.'
          : 'No readable text content found on this page.'
      );
      return;
    }

    setScreenReaderActive(true);
    const startIdx =
      currentIndexRef.current >= 0 && currentIndexRef.current < segs.length
        ? currentIndexRef.current
        : 0;

    speakSegment(startIdx, segs);
  };

  const handleNextSegment = () => {
    const segs = segmentsRef.current;
    if (segs.length === 0) return;
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < segs.length) {
      speakSegment(nextIdx, segs);
    } else {
      handleStopSpeech();
    }
  };

  const handlePrevSegment = () => {
    const segs = segmentsRef.current;
    if (segs.length === 0) return;
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    speakSegment(prevIdx, segs);
  };

  const handlePauseSpeech = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      isPausedRef.current = false;
    } else {
      synthRef.current.pause();
      setIsPaused(true);
      isPausedRef.current = true;
    }
  };

  const handleStopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    activeUtteranceRef.current = null;
    currentIndexRef.current = -1;
    setCurrentSegmentIndex(-1);
    setIsSpeaking(false);
    setIsPaused(false);
    isPausedRef.current = false;
    highlightSegment(null);
    setScreenReaderActive(false);
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (isSpeaking && currentIndexRef.current !== -1) {
      speakSegment(currentIndexRef.current);
    }
  };

  // Allow clicking on any readable text element on the page to jump reading directly to it
  useEffect(() => {
    if (!screenReaderActive) return;

    const handleContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (
        target.closest('#accessibility-drawer') ||
        target.closest('#accessibility-fab') ||
        target.closest('#sr-control-panel') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select')
      ) {
        return;
      }

      const segIdx = segmentsRef.current.findIndex(
        (s) => s.el === target || s.el.contains(target) || target.contains(s.el)
      );

      if (segIdx !== -1) {
        speakSegment(segIdx);
      }
    };

    window.addEventListener('click', handleContentClick, true);
    return () => window.removeEventListener('click', handleContentClick, true);
  }, [screenReaderActive]);

  // Sync segment scanning when screen reader mode opens/closes
  useEffect(() => {
    if (screenReaderActive) {
      const segs = getReadableSegments();
      setSegments(segs);
      segmentsRef.current = segs;
    } else {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      activeUtteranceRef.current = null;
      currentIndexRef.current = -1;
      setCurrentSegmentIndex(-1);
      setIsSpeaking(false);
      setIsPaused(false);
      isPausedRef.current = false;
      highlightSegment(null);
    }
  }, [screenReaderActive]);

  // Observe dynamic DOM changes in main content (e.g. changing quiz question or tab)
  useEffect(() => {
    if (!screenReaderActive) return;

    const mainEl =
      document.querySelector('main') || document.getElementById('accessible-content-root');
    if (!mainEl) return;

    let timer: any;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const segs = getReadableSegments();
        setSegments(segs);
        segmentsRef.current = segs;
      }, 120);
    });

    observer.observe(mainEl, { childList: true, subtree: true });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [screenReaderActive]);

  // Make screen reader control panel draggable
  const handlePanelPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicked on or inside a button, do not start dragging
    const target = e.target as HTMLElement | null;
    if (target && target.closest('button')) {
      return;
    }
    if (e.button !== 0) return;

    const el = panelRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const startPointer = { x: e.clientX, y: e.clientY };
    const startEl = { x: rect.left, y: rect.top };

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startPointer.x;
      const dy = moveEvt.clientY - startPointer.y;

      const minX = 8;
      const maxX = window.innerWidth - rect.width - 8;
      const minY = 8;
      const maxY = window.innerHeight - rect.height - 8;

      const nextX = Math.max(minX, Math.min(maxX, startEl.x + dx));
      const nextY = Math.max(minY, Math.min(maxY, startEl.y + dy));

      setPanelPosition({ x: nextX, y: nextY });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const jumpToHeading = (id: string) => {
    setHeadingOutlineOpen(false);
    const target = document.getElementById(id);
    if (target) {
      const segIdx = segmentsRef.current.findIndex(
        (s) => s.el === target || s.el.id === id || s.el.contains(target)
      );
      if (segIdx !== -1) {
        setScreenReaderActive(true);
        speakSegment(segIdx);
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('sr-highlight-speaking');
        setTimeout(() => target.classList.remove('sr-highlight-speaking'), 2500);
      }
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

      {/* 3. Screen Reader Floating Tool Strip - Draggable */}
      {screenReaderActive && (
        <div
          ref={panelRef}
          id="sr-control-panel"
          onPointerDown={handlePanelPointerDown}
          className={`fixed z-50 bg-chem-dark text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex flex-wrap items-center gap-2.5 animate-bounce-short isolate select-none touch-none cursor-grab active:cursor-grabbing ${
            panelPosition ? '' : 'bottom-24 right-6'
          }`}
          style={
            panelPosition
              ? {
                  left: `${panelPosition.x}px`,
                  top: `${panelPosition.y}px`,
                  right: 'auto',
                  bottom: 'auto',
                }
              : undefined
          }
          title={
            language === 'id'
              ? 'Panel Pembaca Layar (Tahan & geser untuk memindahkan)'
              : 'Screen Reader Panel (Drag to move)'
          }
        >
          {/* Drag Handle Grip Icon */}
          <div
            className="text-white/40 hover:text-white/80 p-0.5 cursor-grab active:cursor-grabbing shrink-0"
            title={language === 'id' ? 'Geser panel ini' : 'Drag this panel'}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Status Badge & Progress */}
          <div className="flex items-center gap-2">
            <Volume2
              className={`w-5 h-5 ${
                isSpeaking && !isPaused ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold leading-tight">
                {language === 'id' ? 'Pembaca Layar' : 'Screen Reader'}
              </span>
              {segments.length > 0 && currentSegmentIndex >= 0 && (
                <span className="text-[10px] text-chem-glow/80 font-mono">
                  {currentSegmentIndex + 1} / {segments.length}
                </span>
              )}
            </div>
          </div>

          {/* Navigation & Playback Controls */}
          <div className="flex items-center gap-1.5 ml-1">
            {/* Rewind / Previous */}
            <button
              type="button"
              onClick={handlePrevSegment}
              disabled={currentSegmentIndex <= 0}
              className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer text-xs"
              title="Bagian Sebelumnya (Rewind)"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause */}
            {!isSpeaking || isPaused ? (
              <button
                type="button"
                onClick={handleStartSpeech}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold shadow-xs"
                title={isPaused ? 'Lanjutkan Membaca' : 'Mulai Membaca'}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPaused ? 'Lanjut' : 'Play'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseSpeech}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold shadow-xs"
                title="Jeda Pembacaan"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Jeda</span>
              </button>
            )}

            {/* Forward / Next */}
            <button
              type="button"
              onClick={handleNextSegment}
              disabled={segments.length === 0 || currentSegmentIndex >= segments.length - 1}
              className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer text-xs"
              title="Bagian Selanjutnya (Forward / Skip)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Stop */}
            <button
              type="button"
              onClick={handleStopSpeech}
              className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer text-xs ml-1"
              title="Berhenti & Nonaktifkan"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 border-l border-white/20 pl-2">
            <span className="text-[10px] text-chem-glow">Kec:</span>
            {[0.8, 1.0, 1.2, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  speechRate === rate
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title={`Kecepatan ${rate}x`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Close Panel Button */}
          <button
            type="button"
            onClick={handleStopSpeech}
            className="text-white/60 hover:text-white p-1 ml-1 cursor-pointer"
            title="Tutup Pembaca Layar"
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
