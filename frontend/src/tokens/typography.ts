/**
 * EcoInclusive Design System - Typography Tokens
 */

export const typography = {
  fontFamily: {
    sans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    serif: '"Newsreader", Georgia, serif',
  },
  hierarchy: {
    display: 'font-serif text-3xl sm:text-4xl text-chem-dark leading-tight',
    sectionHeading: 'font-serif text-2xl sm:text-3xl text-chem-dark',
    cardTitle: 'font-serif text-base sm:text-lg font-semibold text-chem-dark',
    body: 'font-sans text-xs sm:text-sm text-chem-dark/85 leading-relaxed',
    meta: 'font-sans text-[10px] sm:text-[11px] font-medium text-chem-ash uppercase tracking-wider',
    button: 'font-sans text-xs font-semibold tracking-normal',
  },
} as const;
