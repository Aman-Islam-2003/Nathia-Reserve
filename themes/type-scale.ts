import type { TypeStep } from "./types";

/**
 * The lab's shared fluid type scale (formerly a global @theme block in styles/globals.css). Luxury and bold
 * use it unchanged; a theme with its own measured scale (e.g. nathia) defines its own.
 */
export const labTypeScale: Record<TypeStep, string> = {
  xs: "clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)",
  sm: "clamp(0.875rem, 0.84rem + 0.17vw, 0.9375rem)",
  base: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)",
  lg: "clamp(1.125rem, 1.06rem + 0.3vw, 1.3125rem)",
  xl: "clamp(1.25rem, 1.14rem + 0.55vw, 1.625rem)",
  "2xl": "clamp(1.5rem, 1.3rem + 1vw, 2.25rem)",
  "3xl": "clamp(1.875rem, 1.5rem + 1.9vw, 3.25rem)",
  "4xl": "clamp(2.25rem, 1.7rem + 2.8vw, 4.5rem)",
  hero: "clamp(2.75rem, 1.6rem + 5.5vw, 7.5rem)",
};

/** A system monospace stack, for themes that load no mono font. */
export const systemMono = "ui-monospace, SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace";
