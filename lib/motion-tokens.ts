// Base motion tokens. Components get theme-scaled values from useMotion(), not from here directly.

/** Neutral helper eases. The brand eases come from the active theme via useMotion(). */
export const ease = {
  out: "power3.out",
  inOut: "power3.inOut",
} as const;

/** Base durations in seconds, multiplied by the theme's durationScale */
export const dur = {
  fast: 0.4,
  base: 0.8,
  slow: 1.4,
} as const;

/** Base stagger offsets in seconds, multiplied by the theme's staggerScale */
export const stagger = {
  chars: 0.02,
  words: 0.05,
  items: 0.08,
} as const;
