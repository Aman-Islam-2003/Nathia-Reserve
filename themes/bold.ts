import { labTypeScale, systemMono } from "./type-scale";
import type { Theme } from "./types";

// Warm cream + terracotta, chunky geometric sans, tight space, fast punchy motion.
const bold = {
  name: "bold",
  visual: {
    colors: {
      ink: "#2B1A12",
      paper: "#F5ECDD",
      accent: "#A8461F",
      accentSoft: "#A8461F", // = accent
      accentOnInk: "#A8461F", // = accent
      muted: "#6E5545",
      line: "#E2D3BE",
      onInk: "#F5ECDD", // = paper: ink sections already used text-paper
      surfaceAlt: "#EFE3CF",
      surfaceRaised: "#EFE3CF",
      highlight: "#A8461F",
      lineOnLight: "#2B1A1229",
    },
    surfaceTone: { paper: "light", ink: "dark", accent: "dark" },
    fonts: {
      display: "var(--font-unbounded)",
      body: "var(--font-dm-sans)",
      mono: systemMono,
    },
    typeScale: labTypeScale,
    radius: "1.25rem",
    spaceSection: "clamp(4rem, 2rem + 5vw, 7rem)",
    display: {
      letterSpacing: "-0.03em",
      lineHeight: 0.95,
      advance: 0.77, // Unbounded: sample mean 0.68, widest 0.765
    },
  },
  motion: {
    // Fast start with slight overshoot — transforms only.
    ease: [0.34, 1.56, 0.64, 1],
    // Same fast start, no overshoot — for opacity and clip-path.
    easeSoft: [0.22, 1, 0.36, 1],
    // Curtains and closing already used the soft ease; same curve, so nothing changes.
    easeInOut: [0.22, 1, 0.36, 1],
    durationScale: 0.5625, // dur.base 0.45s
    // The values primitives already get from durationScale: fast 0.225, base 0.45, slow 0.7875.
    durations: { reveal: 0.45, fade: 0.225, title: 0.45, settle: 0.7875, curtain: 0.7875, default: 0.45 },
    staggerScale: 0.7,
    revealDistance: 32,
  },
} as const satisfies Theme;

export default bold;
