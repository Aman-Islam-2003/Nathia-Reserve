"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { dur, stagger } from "@/lib/motion-tokens";
import { themeEase, themeEaseSoft, themes, type Theme, type ThemeName, themeEaseInOut, typeSteps, type Durations } from "@/themes";

export interface Motion {
  /** For transforms (x, y, scale, rotate). May overshoot. */
  ease: string;
  /** For opacity and clip-path. Never overshoots. */
  easeSoft: string;
  /** Symmetric in-out, for curtains and closing motion (clip-path wipes). */
  easeInOut: string;
  /** Named durations in seconds (reveal, fade, title, settle, curtain, default). */
  durations: Durations;
  dur: { fast: number; base: number; slow: number };
  stagger: { chars: number; words: number; items: number };
  /** Pixels of y-travel when an element reveals */
  revealDistance: number;
  /** The theme's raw duration multiplier, for rates (e.g. Marquee speed ÷ durationScale) */
  durationScale: number;
}

const scale = <T extends Record<string, number>>(values: T, by: number) =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v * by])) as {
    [K in keyof T]: number;
  };

function toMotion({ name, motion }: Theme): Motion {
  return {
    ease: themeEase(name),
    easeSoft: themeEaseSoft(name),
    easeInOut: themeEaseInOut(name),
    durations: motion.durations,
    dur: scale(dur, motion.durationScale),
    stagger: scale(stagger, motion.staggerScale),
    revealDistance: motion.revealDistance,
    durationScale: motion.durationScale,
  };
}

const bezier = ([a, b, c, d]: readonly number[]) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;

function toCssVars({ visual, motion }: Theme) {
  return {
    // The brand eases for CSS transitions and keyframes (GSAP uses the registered CustomEases).
    "--theme-ease": bezier(motion.ease),
    "--theme-ease-in-out": bezier(motion.easeInOut),
    "--theme-ink": visual.colors.ink,
    "--theme-paper": visual.colors.paper,
    "--theme-accent": visual.colors.accent,
    "--theme-muted": visual.colors.muted,
    "--theme-line": visual.colors.line,
    "--theme-font-display": visual.fonts.display,
    "--theme-font-body": visual.fonts.body,
    "--theme-font-mono": visual.fonts.mono,
    "--theme-accent-soft": visual.colors.accentSoft,
    "--theme-accent-on-ink": visual.colors.accentOnInk,
    "--theme-on-ink": visual.colors.onInk,
    "--theme-surface-alt": visual.colors.surfaceAlt,
    "--theme-surface-raised": visual.colors.surfaceRaised,
    "--theme-highlight": visual.colors.highlight,
    "--theme-line-on-light": visual.colors.lineOnLight,
    ...Object.fromEntries(typeSteps.map((step) => [`--theme-text-${step}`, visual.typeScale[step]])),
    "--theme-radius": visual.radius,
    "--theme-space-section": visual.spaceSection,
    "--theme-tracking-display": visual.display.letterSpacing,
    "--theme-leading-display": String(visual.display.lineHeight),
    "--theme-display-advance": String(visual.display.advance),
  } as CSSProperties;
}

/** Builds each theme's value on first use and caches it, so nothing reads `themes` at module load. */
function cachedByTheme<T>(build: (theme: Theme) => T) {
  const cache = new Map<ThemeName, T>();
  return (name: ThemeName): T => {
    let value = cache.get(name);
    if (value === undefined) {
      value = build(themes[name]);
      cache.set(name, value);
    }
    return value;
  };
}

// Cached so useMotion() returns a stable object per theme.
const motionFor = cachedByTheme(toMotion);
const cssVarsFor = cachedByTheme(toCssVars);

const MotionContext = createContext<Motion | null>(null);

/**
 * Scopes a theme to its subtree: visual tokens as CSS variables on the wrapper,
 * motion tokens through useMotion(). Output depends only on props, so server and client match.
 */
export function ThemeProvider({
  theme,
  className = "",
  children,
}: {
  theme: ThemeName;
  className?: string;
  children: ReactNode;
}) {
  return (
    <MotionContext.Provider value={motionFor(theme)}>
      <div
        data-theme={theme}
        style={cssVarsFor(theme)}
        className={`bg-paper text-ink font-body ${className}`.trim()}
      >
        {children}
      </div>
    </MotionContext.Provider>
  );
}

/**
 * Motion tokens of the nearest ThemeProvider, already scaled by the theme. No GSAP here: motion code
 * runs in lazily loaded runtime modules, which use useRuntimeMotion() (it also registers the eases).
 */
export function useMotion(): Motion {
  const motion = useContext(MotionContext);
  if (!motion) throw new Error("useMotion() must be used inside a <ThemeProvider>.");
  return motion;
}
