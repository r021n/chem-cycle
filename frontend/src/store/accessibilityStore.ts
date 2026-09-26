import { create } from 'zustand';

export type ContrastMode =
  | 'normal'
  | 'monochrome'
  | 'low-saturation'
  | 'high-saturation'
  | 'dark-contrast'
  | 'medium-contrast'
  | 'high-contrast'
  | 'yellow-black';

type TextWeight = 'normal' | 'medium' | 'bold';
type TextLineHeight = 'normal' | 'relaxed' | 'loose';
type TextLetterSpacing = 'normal' | 'wide' | 'wider';

interface AccessibilityState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;

  // 1. Language
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;

  // 2. Contrast & Color Schemes
  contrastMode: ContrastMode;
  setContrastMode: (mode: ContrastMode) => void;

  // 3. Typography
  fontSizeDelta: number; // -2, -1, 0, 1, 2, 3
  setFontSizeDelta: (delta: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  fontWeight: TextWeight;
  setFontWeight: (weight: TextWeight) => void;
  lineHeight: TextLineHeight;
  setLineHeight: (lh: TextLineHeight) => void;
  letterSpacing: TextLetterSpacing;
  setLetterSpacing: (ls: TextLetterSpacing) => void;
  dyslexiaFont: boolean;
  toggleDyslexiaFont: () => void;

  // 4. Content Visual Markers
  highlightLinks: boolean;
  toggleHighlightLinks: () => void;
  highlightHeadings: boolean;
  toggleHighlightHeadings: () => void;

  // 5. Media & Distraction
  stopAnimations: boolean;
  toggleStopAnimations: () => void;
  hideImages: boolean;
  toggleHideImages: () => void;
  showAltText: boolean;
  toggleShowAltText: () => void;

  // 6. Assistive Tools
  superFocus: boolean;
  toggleSuperFocus: () => void;
  readingGuide: boolean;
  toggleReadingGuide: () => void;
  bigCursor: boolean;
  toggleBigCursor: () => void;
  headingOutlineOpen: boolean;
  setHeadingOutlineOpen: (open: boolean) => void;
  screenReaderActive: boolean;
  setScreenReaderActive: (active: boolean) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;

  // Reset
  resetAll: () => void;
}

const STORAGE_KEY = 'chem_accessibility_preferences';

function loadStoredPreferences(): Partial<AccessibilityState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to load accessibility preferences:', e);
  }
  return {};
}

function persistPreferences(state: Partial<AccessibilityState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save accessibility preferences:', e);
  }
}

export const useAccessibilityStore = create<AccessibilityState>((set, get) => {
  const initial = loadStoredPreferences();

  return {
    isOpen: false,
    setIsOpen: (open) => set({ isOpen: open }),
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

    language: initial.language || 'id',
    setLanguage: (lang) => {
      set({ language: lang });
      persistPreferences({ ...get(), language: lang });
    },

    contrastMode: initial.contrastMode || 'normal',
    setContrastMode: (mode) => {
      set({ contrastMode: mode });
      persistPreferences({ ...get(), contrastMode: mode });
    },

    fontSizeDelta: initial.fontSizeDelta ?? 0,
    setFontSizeDelta: (delta) => {
      const clamped = Math.max(-2, Math.min(3, delta));
      set({ fontSizeDelta: clamped });
      persistPreferences({ ...get(), fontSizeDelta: clamped });
    },
    increaseFontSize: () => {
      const cur = get().fontSizeDelta;
      if (cur < 3) {
        get().setFontSizeDelta(cur + 1);
      }
    },
    decreaseFontSize: () => {
      const cur = get().fontSizeDelta;
      if (cur > -2) {
        get().setFontSizeDelta(cur - 1);
      }
    },

    fontWeight: initial.fontWeight || 'normal',
    setFontWeight: (weight) => {
      set({ fontWeight: weight });
      persistPreferences({ ...get(), fontWeight: weight });
    },

    lineHeight: initial.lineHeight || 'normal',
    setLineHeight: (lh) => {
      set({ lineHeight: lh });
      persistPreferences({ ...get(), lineHeight: lh });
    },

    letterSpacing: initial.letterSpacing || 'normal',
    setLetterSpacing: (ls) => {
      set({ letterSpacing: ls });
      persistPreferences({ ...get(), letterSpacing: ls });
    },

    dyslexiaFont: initial.dyslexiaFont ?? false,
    toggleDyslexiaFont: () => {
      const next = !get().dyslexiaFont;
      set({ dyslexiaFont: next });
      persistPreferences({ ...get(), dyslexiaFont: next });
    },

    highlightLinks: initial.highlightLinks ?? false,
    toggleHighlightLinks: () => {
      const next = !get().highlightLinks;
      set({ highlightLinks: next });
      persistPreferences({ ...get(), highlightLinks: next });
    },

    highlightHeadings: initial.highlightHeadings ?? false,
    toggleHighlightHeadings: () => {
      const next = !get().highlightHeadings;
      set({ highlightHeadings: next });
      persistPreferences({ ...get(), highlightHeadings: next });
    },

    stopAnimations: initial.stopAnimations ?? false,
    toggleStopAnimations: () => {
      const next = !get().stopAnimations;
      set({ stopAnimations: next });
      persistPreferences({ ...get(), stopAnimations: next });
    },

    hideImages: initial.hideImages ?? false,
    toggleHideImages: () => {
      const next = !get().hideImages;
      set({ hideImages: next });
      persistPreferences({ ...get(), hideImages: next });
    },

    showAltText: initial.showAltText ?? false,
    toggleShowAltText: () => {
      const next = !get().showAltText;
      set({ showAltText: next });
      persistPreferences({ ...get(), showAltText: next });
    },

    superFocus: false,
    toggleSuperFocus: () => set((state) => ({ superFocus: !state.superFocus })),

    readingGuide: false,
    toggleReadingGuide: () => set((state) => ({ readingGuide: !state.readingGuide })),

    bigCursor: initial.bigCursor ?? false,
    toggleBigCursor: () => {
      const next = !get().bigCursor;
      set({ bigCursor: next });
      persistPreferences({ ...get(), bigCursor: next });
    },

    headingOutlineOpen: false,
    setHeadingOutlineOpen: (open) => set({ headingOutlineOpen: open }),

    screenReaderActive: false,
    setScreenReaderActive: (active) => set({ screenReaderActive: active }),

    speechRate: 1.0,
    setSpeechRate: (rate) => set({ speechRate: rate }),

    resetAll: () => {
      const defaults = {
        contrastMode: 'normal' as ContrastMode,
        fontSizeDelta: 0,
        fontWeight: 'normal' as TextWeight,
        lineHeight: 'normal' as TextLineHeight,
        letterSpacing: 'normal' as TextLetterSpacing,
        dyslexiaFont: false,
        highlightLinks: false,
        highlightHeadings: false,
        stopAnimations: false,
        hideImages: false,
        showAltText: false,
        superFocus: false,
        readingGuide: false,
        bigCursor: false,
        headingOutlineOpen: false,
        screenReaderActive: false,
        speechRate: 1.0,
      };
      set(defaults);
      persistPreferences(defaults);
    },
  };
});
