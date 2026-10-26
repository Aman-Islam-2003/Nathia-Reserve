/** Cubic-bezier control points, e.g. [0.16, 1, 0.3, 1] */
export type CubicBezier = readonly [x1: number, y1: number, x2: number, y2: number];

/** A reference to a next/font CSS variable (themes/fonts/<theme>.ts) */
export type FontVar = `var(--font-${string})`;

/** A next/font variable, or a plain font stack for a role the theme doesn't load a font for. */
export type FontStack = FontVar | string;

/** Steps of the fluid type scale, used as Tailwind `text-<step>`. */
export const typeSteps = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "hero"] as const;
export type TypeStep = (typeof typeSteps)[number];

/** Named animation durations in seconds. Primitives' `fast | base | slow` still come from durationScale. */
export interface Durations {
  /** Heading and section reveals */
  reveal: number;
  /** Fades of supporting elements */
  fade: number;
  /** Hero / page-title line rises */
  title: number;
  /** Images settling from a zoom */
  settle: number;
  /** Overlay curtains (menus, dialogs) */
  curtain: number;
  /** Anything unspecified */
  default: number;
}

/**
 * Every theme name. A literal with no imports, so it's safe to read at module load from
 * anywhere; `themes` in ./index.ts is typed against it, so the two can't drift apart.
 */
export const themeNames = ["luxury", "bold", "nathia"] as const;

export type ThemeName = (typeof themeNames)[number];

export type Tone = "dark" | "light";

/** Theme colours a section can use as its background. */
export type Surface = "paper" | "ink" | "accent";

export interface Theme {
  name: ThemeName;
  visual: {
    colors: {
      /** Primary text */
      ink: string;
      /** Background */
      paper: string;
      accent: string;
      /** A lighter accent for labels and emphasis on dark photos */
      accentSoft: string;
      /** The accent on ink (light) surfaces: labels and emphasis where accent is too faint */
      accentOnInk: string;
      /** Secondary text */
      muted: string;
      /** Borders and dividers */
      line: string;
      /** Text on the ink surface (sections with surface "ink"). Usually the paper colour. */
      onInk: string;
      /** A second background, for panels and alternating sections */
      surfaceAlt: string;
      /** A raised panel background, between paper and surfaceAlt */
      surfaceRaised: string;
      /** Warm highlight: small marks, counters, emphasis */
      highlight: string;
      /** Borders and dividers on light surfaces (ink, accent) */
      lineOnLight: string;
    };
    /** Whether each surface colour is dark or light; sections set data-tone from this. */
    surfaceTone: Record<Surface, Tone>;
    fonts: {
      display: FontVar;
      body: FontVar;
      /** Numbers, labels, HUD read-outs. A plain stack when the theme loads no mono font. */
      mono: FontStack;
    };
    /** Fluid type scale, one CSS length (usually clamp()) per step. Tailwind `text-<step>` reads it. */
    typeScale: Record<TypeStep, string>;
    /** CSS length, e.g. "0px" | "1.25rem" */
    radius: string;
    /** Vertical rhythm between sections, CSS length or clamp() */
    spaceSection: string;
    display: {
      /** e.g. "-0.01em" */
      letterSpacing: string;
      /** Unitless, e.g. 1.05 */
      lineHeight: number;
      /**
       * Display font width in em per weighted character (letter-spacing included), measured as the
       * WIDEST of a sample of heading words so fit-to-width text never overflows. See lib/fit-text.ts.
       */
      advance: number;
    };
  };
  motion: {
    /** Brand ease for transforms (x, y, scale, rotate). May overshoot. */
    ease: CubicBezier;
    /** Non-overshooting ease for opacity and clip-path. */
    easeSoft: CubicBezier;
    /** Symmetric in-out ease for curtains and closing motion (clip-path wipes, overlays closing). */
    easeInOut: CubicBezier;
    /** Named durations in seconds (see Durations). */
    durations: Durations;
    /** Multiplies dur.fast / dur.base / dur.slow from lib/motion-tokens.ts */
    durationScale: number;
    /** Multiplies stagger.chars / stagger.words / stagger.items */
    staggerScale: number;
    /** Pixels of y-travel when an element reveals */
    revealDistance: number;
  };
}
