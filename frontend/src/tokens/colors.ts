/**
 * EcoInclusive Design System - Color Tokens
 */

export const ecoColors = {
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

export const chemColors = ecoColors;

export type EcoColorKey = keyof typeof ecoColors;
export type ChemColorKey = EcoColorKey;
