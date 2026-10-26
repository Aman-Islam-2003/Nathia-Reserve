import { labTypeScale, systemMono } from "./type-scale";
import type { Theme } from "./types";

// Deep forest/charcoal, warm gold, elegant serif, generous space, slow refined motion.
const luxury = {
  name: "luxury",
  visual: {
    colors: {
      ink: "#EDE6D6",
      paper: "#15201B",
      accent: "#C9A45C",
      accentSoft: "#C9A45C", // = accent
      accentOnInk: "#C9A45C", // = accent
      muted: "#A3AC9F",
      line: "#2E3B34",
      onInk: "#15201B", // = paper: ink sections already used text-paper
      surfaceAlt: "#1B2822",
      surfaceRaised: "#1B2822",
      highlight: "#C9A45C",
      lineOnLight: "#15201B33",
    },
    surfaceTone: { paper: "dark", ink: "light", accent: "light" },
    fonts: {
      display: "var(--font-cormorant)",
      body: "var(--font-jost)",
      mono: systemMono,
    },
    typeScale: labTypeScale,
    radius: "0px",
    spaceSection: "clamp(8rem, 4rem + 10vw, 14rem)",
    display: {
      letterSpacing: "0.01em",
      lineHeight: 1.05,
      advance: 0.58, // Cormorant Garamond: sample mean 0.48, widest 0.58
    },
  },
  motion: {
    // Gentle start, motion spread across the whole duration (90% at ~60% of the time).
    // Avoid expo-out curves here: they finish visually in the first third and feel quick.
    ease: [0.3, 0.1, 0.15, 1],
    easeSoft: [0.3, 0.1, 0.15, 1],
    // Curtains already used the soft ease; same curve, so nothing changes.
    easeInOut: [0.3, 0.1, 0.15, 1],
    durationScale: 1.75, // dur.base 1.4s
    // The values primitives already get from durationScale: fast 0.7, base 1.4, slow 2.45.
    durations: { reveal: 1.4, fade: 0.7, title: 1.4, settle: 2.45, curtain: 2.45, default: 1.4 },
    staggerScale: 1.4,
    revealDistance: 80,
  },
} as const satisfies Theme;

export default luxury;
