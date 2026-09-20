/**
 * ChemCycle Design System - Color Tokens
 * Based on UI-UX-SYSTEM-DESIGN.md Section 2.1
 */

export const chemColors = {
  paper: '#fbfbfa',
  subtle: '#f3f4ee',
  border: '#e6e8df',
  dark: '#0e1f18',
  forest: '#153828',
  moss: '#245a42',
  sage: '#40916c',
  mint: '#52b788',
  glow: '#d8f3dc',
  warm: '#c25e00',
  ash: '#57635c',

  // Semantic Status Tokens
  error: '#e11d48',
  errorSubtle: '#fff1f2',
  cardBg: '#ffffff',
} as const;

export type ChemColorKey = keyof typeof chemColors;
