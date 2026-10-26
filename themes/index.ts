// themes/ imports only from themes/ (never lib/ or components/), so it can't be part of an import cycle.
import bold from "./bold";
import luxury from "./luxury";
import nathia from "./nathia";
import type { Surface, Theme, ThemeName, Tone } from "./types";

export { themeNames } from "./types";
export type { Durations, Surface, Theme, ThemeName, Tone, TypeStep } from "./types";
export { typeSteps } from "./types";

/** Lookup by name. Read it inside functions, not at module load (CLAUDE.md §2 "Module layering"). */
export const themes: Record<ThemeName, Theme> = { luxury, bold, nathia };

/** GSAP ease names registered via CustomEase (ensureThemeEases in lib/gsap.ts) */
export const themeEase = (name: ThemeName) => `ease-${name}`;
export const themeEaseSoft = (name: ThemeName) => `ease-${name}-soft`;
export const themeEaseInOut = (name: ThemeName) => `ease-${name}-inout`;

/** data-tone for a section drawn on `surface` in `theme`. */
export const toneFor = (theme: ThemeName, surface: Surface): Tone =>
  themes[theme].visual.surfaceTone[surface];
