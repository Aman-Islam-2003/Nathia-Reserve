import type { Theme } from "./types";

// The Nathia Reserve clone (CLAUDE.md §12). Every value is measured from thenathiareserve.com
// (docs/nathia/inventory.md, step 2 audit). Live names in brackets: their CSS custom property or JS name.
const nathia = {
  name: "nathia",
  visual: {
    colors: {
      ink: "#efe9df", // text on dark [--bone]
      paper: "#0c0f0d", // page background [--ink, body background]
      accent: "#c3a78e", // [--tan]: register pill, menu numbers, accents
      accentSoft: "#dcc8b1", // [--tan-2]: footer labels and the italic footer line
      accentOnInk: "#8f7862", // [--tan-3]: label numbers and italic heading lines on bone [.tone-light .label, .xp-head em]
      muted: "#b9b4aa", // [--mist]: secondary text, preloader rows
      line: "#efe9df24", // dividers on dark [--line-d]
      // Text on light (bone) surfaces is forest, not black [HUD .is-light: rgb(37, 49, 41) = --forest].
      onInk: "#253129",
      surfaceAlt: "#131915", // [--forest-3]: estate, returns and register scenes (measured section backgrounds)
      surfaceRaised: "#1b211c", // address scene panel (measured background rgb(27, 33, 28))
      highlight: "#e2a467", // [--ember]: warm highlight
      lineOnLight: "#25312929", // dividers on light surfaces [--line-l]
    },
    surfaceTone: { paper: "dark", ink: "light", accent: "light" },
    fonts: {
      display: "var(--font-nathia-display)", // Cormorant Garamond [--font-display]
      body: "var(--font-nathia-sans)", // Instrument Sans [--font-sans]
      mono: "var(--font-nathia-mono)", // IBM Plex Mono [--font-mono]
    },
    // Their fluid scale mapped onto our steps (live custom property or class in brackets).
    typeScale: {
      xs: "0.7rem", // labels [--fs-label]
      sm: "0.86rem", // small text [--fs-small]
      base: "clamp(1rem, 1.06vw, 1.13rem)", // body [--fs-body]
      lg: "clamp(1.25rem, 1.7vw, 1.75rem)", // residence line, italic [.rs-line]
      xl: "clamp(1.3rem, 1.9vw, 1.95rem)", // inner-page paragraphs [.pg-p]
      "2xl": "clamp(1.5rem, 2.35vw, 2.4rem)", // lede [--fs-lede]
      "3xl": "clamp(2.1rem, 3.8vw, 4.1rem)", // h3 [--fs-h3]
      "4xl": "clamp(2.9rem, 6.9vw, 8rem)", // h2 [--fs-h2]
      hero: "clamp(3.3rem, 8.8vw, 10.2rem)", // hero [--fs-hero]
    },
    radius: "0px", // frames and plates are square; the pill buttons set their own full radius
    // Sections pad 20vh top / 18vh bottom on desktop [.ow, .rt, .el, .rc padding]; 12–14vh at ≤900px is set
    // per section, since a single token can't change with the breakpoint.
    spaceSection: "20vh",
    display: {
      letterSpacing: "-0.015em", // [.display]
      lineHeight: 0.92, // [.display]
      // Cormorant 600 is slightly wider than luxury's 400 (widest 0.58). Estimate until measured; nathia
      // headings use the fixed scale above, not fit-to-width text.
      advance: 0.6,
    },
  },
  motion: {
    // CustomEase "reserveOut" = "0.16, 1, 0.3, 1", their GSAP default ease [ensureGsap: gsap.defaults].
    // It never overshoots, so it serves both transforms and opacity/clip-path.
    ease: [0.16, 1, 0.3, 1],
    easeSoft: [0.16, 1, 0.3, 1],
    // CustomEase "reserve" = "0.65, 0, 0.35, 1": menu curtain, preloader logo stroke, plate clip-path
    // openings and closing motion (FAQ close) [menu, loader, .el-plate].
    easeInOut: [0.65, 0, 0.35, 1],
    // dur.base = 0.8 × 1.25 = 1.0 s, their GSAP default duration [gsap.defaults({ duration: 1 })].
    durationScale: 1.25,
    // stagger.items = 0.08 × 1.25 = 0.1 (title lines, heading lines [.pgh-title, .el-head]);
    // stagger.words = 0.0625 (they use 0.07–0.08 for words and items).
    staggerScale: 1.25,
    revealDistance: 26, // fades rise from y: 26 [.mf-fade]; page-hero fades use 20
    durations: {
      reveal: 1.3, // section heading reveals [Gallery, Ownership, Elevate, RegisterCta]
      fade: 1.1, // supporting fades [Estate, Ownership, Returns, RegisterCta]
      title: 1.4, // page-hero title lines rise from yPercent 112 [.pgh-title .ln-i]
      settle: 2.2, // images settling from a zoom (1.3 → 1) [.el-plate img]; the page hero uses 2.6
      curtain: 0.95, // menu clip-path curtain [menu open]
      default: 1, // GSAP default duration [gsap.defaults]
    },
  },
} as const satisfies Theme;

export default nathia;
