// Nathia theme fonts (CLAUDE.md §12), imported only by /nathia routes. Exactly the faces the live site loads
// (docs/nathia/inventory.md): Cormorant Garamond 500/600/700 normal and italic, Instrument Sans variable
// 400–700, IBM Plex Mono 400/500. preload: false and the generated fallbacks per CLAUDE.md §6.
import { Cormorant_Garamond, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";

const display = Cormorant_Garamond({
  variable: "--font-nathia-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  preload: false,
  adjustFontFallback: false,
  // Size-adjusted fallbacks that exist on every OS (styles/font-fallbacks.css, npm run fonts).
  fallback: ["Cormorant Garamond Fallback", "Cormorant Garamond Fallback Android", "serif"],
});
// Variable font: one file covers 400–700 [their @font-face: font-weight 400 700].
const body = Instrument_Sans({
  variable: "--font-nathia-sans",
  subsets: ["latin"],
  preload: false,
  adjustFontFallback: false,
  fallback: ["Instrument Sans Fallback", "Instrument Sans Fallback Android", "sans-serif"],
});
const mono = IBM_Plex_Mono({
  variable: "--font-nathia-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  preload: false,
  adjustFontFallback: false,
  fallback: ["IBM Plex Mono Fallback", "IBM Plex Mono Fallback Android", "monospace"],
});

/** Defines --font-nathia-display, --font-nathia-sans and --font-nathia-mono (used by themes/nathia.ts). */
export const nathiaFonts = `${display.variable} ${body.variable} ${mono.variable}`;
