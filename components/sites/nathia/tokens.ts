// Measured, Nathia-only style values (CLAUDE.md §12), in one place instead of scattered arbitrary values.
// Theme tokens (colours, fonts, type scale, motion) live in themes/nathia.ts; these are the extras that only
// this site's chrome and scenes use. Live CSS selector in brackets.

/** Below this width the live site switches to its mobile layout [@media (max-width: 900px)]. */
export const MOBILE_QUERY = "(max-width: 899px)";

/** Page gutter: clamp(20px, 4.2vw, 72px) [--gx]. Horizontal padding; `gxInset` for fixed elements' left/right. */
export const gx = "px-[clamp(20px,4.2vw,72px)]";
export const gxInset = "inset-x-[clamp(20px,4.2vw,72px)]";

/** Header bar height: 84px, 68px on mobile [--nav-h]. */
export const navHeight = "h-[84px] max-[899px]:h-[68px]";

/** Uppercase label: .7rem, 500, tracking .26em, line height 1.6 (inherited from live's body) [.label]. */
export const label = "text-xs leading-[1.6] font-medium uppercase tracking-[0.26em]";

/** Outlined pill button, header size: 44px tall, 20px padding, .7rem, tracking .18em; mobile 38px, 16px, .62rem [.nav .btn]. */
export const navPill =
  "inline-flex h-11 items-center gap-[0.9em] rounded-full border border-current px-5 text-xs font-medium uppercase tracking-[0.18em] max-[899px]:h-[38px] max-[899px]:px-4 max-[899px]:text-[0.62rem] max-[899px]:tracking-[0.14em]";

/** Outlined pill button, default size: 52px tall, 26px padding, .78rem, tracking .18em [.btn]. */
export const pill =
  "inline-flex h-[52px] items-center gap-[0.9em] rounded-full border border-current px-[26px] text-[0.78rem] font-medium uppercase tracking-[0.18em]";

/** Mono read-out: .68rem, tracking .14em, uppercase [.hud, .sound]. */
export const mono = "font-mono text-[0.68rem] uppercase tracking-[0.14em]";

/**
 * Ascent mist colours, linear 0–1 RGB for the shader [.ascent-mist]: `cool` the grey valley haze, `warm` the
 * golden-hour glow it turns into as you climb (also the colour of the sun's light). `sun`: where the low sun
 * sits, in 0–1 view coordinates (y up).
 */
export const mist = { cool: [0.35, 0.36, 0.33], warm: [0.96, 0.8, 0.6], sun: [0.16, 0.86] } as const;

/** Manifesto scroll motion, measured on live [Manifesto: .mf-plate, .mf-lede .w, .mf-fade]. */
export const manifestoTiming = {
  // Plate clip inset(16% 12%) → 0 between "top 95%" and "top 35%", scrub .6.
  plateFrom: "inset(16% 12% 16% 12%)",
  plateScrub: { start: "top 95%", end: "top 35%", smooth: 0.6 },
  // Its photo drifts yPercent -9 → 9 and settles from scale 1.18 to 1.04 while the plate crosses the viewport.
  plateDrift: { yPercent: [-9, 9], scale: [1.18, 1.04] },
  // Statement words from opacity .16, stagger .08, "top 80%" → "bottom 50%", scrub true.
  statementDim: 0.16,
  statementStagger: 0.08,
  statementStart: "top 80%",
  statementEnd: "bottom 50%",
  // Body: fade and rise 26px (theme revealDistance) over 1.2 s at "top 88%".
  bodyFade: 1.2,
  bodyAt: 0.88,
} as const satisfies {
  plateDrift: { yPercent: [number, number]; scale: [number, number] };
  [key: string]: unknown;
};

/** Keyboard focus ring for Nathia controls: 1px tan outline, 4px out [:focus-visible] (also set for every element in globals.css). */
export const focusRing = "focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent focus-visible:outline-solid";

/**
 * Explorer overlay [.xo]: opens as a clip from inset(18% 22% round 28px) to full screen over 1.05 s in the
 * "reserve" ease (theme easeInOut); closes back to that frame over .8 s.
 */
export const explorerTiming = { frame: "inset(18% 22% 18% 22% round 28px)", open: 1.05, close: 0.8 } as const;

/**
 * Explorer portal timeline (scrub .8 over the pin), measured on live [ExplorerPortal]. The window opens from
 * a rounded frame low in the view (mobile: high), in .3 → .85.
 */
export const portalTiming = {
  scrub: 0.8,
  windowFrom: { desktop: "inset(40% 28% 8% 28% round 18px)", mobile: "inset(12% 6% 36% 6% round 14px)" },
} as const;

/** Measure timeline, measured on live [Measure]: scrub .7; the photos blur in over the first 6% (9px, 5 mobile). */
export const measureTiming = { scrub: 0.7, blur: { desktop: 9, mobile: 5 } } as const;

/** Display headings: 600, tracking -.015em, line-height .92, lining figures [.display]. Size per scene. */
export const display = "font-display font-semibold leading-[0.92] tracking-[-0.015em] lining-nums";
/** The italic part of a display heading: 500, tracking -.01em [.display em]. Colour per surface. */
export const displayEm = "font-medium italic tracking-[-0.01em]";
/** Body copy: clamp(1rem, 1.06vw, 1.13rem), line-height 1.7, at most 34em wide [.body]. */
export const body = "max-w-[34em] text-[clamp(1rem,1.06vw,1.13rem)] leading-[1.7]";
/** Lede: display face, clamp(1.5rem, 2.35vw, 2.4rem), 500, line-height 1.2 [.lede]. */
export const lede = "font-display text-[clamp(1.5rem,2.35vw,2.4rem)] leading-[1.2] font-medium tracking-[-0.005em]";

/**
 * Section fades and heading lines, measured on live [Gallery, Ownership, Elevate]: heading lines rise
 * (stagger .1, 1.3 s) when the section's top reaches 72% / 70% / 68%; supporting fades rise 24px over
 * 1.1 s at "top 88%".
 */
export const sectionTiming = {
  headDuration: 1.3,
  headStagger: 0.1,
  headAt: { gallery: 0.72, ownership: 0.7, elevate: 0.68 },
  fadeY: 24,
  fadeDuration: 1.1,
  fadeAt: 0.88,
} as const;

/**
 * Gallery [.gl]: items open from inset(14% 10%, 6px radius) to their 4px frame between "top 98%" and
 * "top 55%" (scrub .6) while the photo settles 1.22 → 1.02; on desktop the four columns drift yPercent
 * ±7 / ∓9 / ±11 / ∓6 across the grid; frames cycle through four aspect ratios.
 */
export const galleryTiming = {
  itemFrom: "inset(14% 10% 14% 10% round 6px)",
  itemTo: "inset(0% 0% 0% 0% round 4px)",
  itemScrub: { start: "top 98%", end: "top 55%", smooth: 0.6 },
  photoScale: [1.22, 1.02],
  columnDrift: [7, -9, 11, -6],
  aspects: ["4 / 5", "4 / 3", "1 / 1", "3 / 4"],
  // Lightbox image: fades in from scale 1.04 over .9 s on each change.
  lightboxFade: 0.9,
} as const satisfies { photoScale: [number, number]; [key: string]: unknown };

/** Ownership [.ow]: list rows slide in from -16px (stagger .09, 1 s) at "top 85%"; price rows rise 18px (stagger .08, 1 s) at "top 82%"; the plate opens from inset(14% 10%) between "top 95%" and "top 40%" (scrub .6) while its photo drifts -8 → 8% and settles 1.16 → 1.04. */
export const ownershipTiming = {
  listX: -16,
  listStagger: 0.09,
  listAt: 0.85,
  priceY: 18,
  priceStagger: 0.08,
  priceAt: 0.82,
  rowDuration: 1,
  plateFrom: "inset(14% 10% 14% 10%)",
  plateScrub: { start: "top 95%", end: "top 40%", smooth: 0.6 },
  plateDrift: { yPercent: [-8, 8], scale: [1.16, 1.04] },
} as const satisfies { plateDrift: { yPercent: [number, number]; scale: [number, number] }; [key: string]: unknown };

/** Elevate [.el]: the plate opens as a curtain from the bottom (inset(100% 0 0 0), 1.6 s, "reserve") at "top 80%" while its photo settles from 1.3 over 2.2 s and drifts -6 → 6%; quote words from .12 (stagger .1) between "top 80%" and "bottom 55%". */
export const elevateTiming = {
  plateFrom: "inset(100% 0% 0% 0%)",
  plateDuration: 1.6,
  plateScale: 1.3,
  plateSettle: 2.2,
  plateAt: 0.8,
  plateDrift: { yPercent: [-6, 6] },
  quoteDim: 0.12,
  quoteStagger: 0.1,
  quoteStart: "top 80%",
  quoteEnd: "bottom 55%",
} as const satisfies { plateDrift: { yPercent: [number, number] }; [key: string]: unknown };

/**
 * Address timeline (scrub .9 over the pin, 4 viewports, 3.4 on mobile), measured on live [Address, .ad-*].
 * Positions are timeline progress (0–1); durations are in the same units.
 * - The road is drawn from `routeStart`: drawn(p) = 1 − (1 − clamp((p − .07) / .73))^1.7 [routeDrawn].
 * - A distance row lights when the drawn road reaches its place (`routeAt`, less .005, and p ≥ .07);
 *   Abbottabad's (a side road) at p ≥ .86 [ROUTE_AT].
 * - The rAF render loop runs only while the pin is active; the map's data loads 4 viewports ahead.
 */
/** How far ahead the Address runtime and its map load [Address: IntersectionObserver rootMargin 400%]. A separate export: client code that needs only this doesn't pull in the rest. */
export const addressLoadMargin = "400% 0px";

export const addressTiming = {
  scrub: 0.9,
  routeStart: 0.07,
  routeSpan: 0.73,
  routePower: 1.7,
  routeAt: { airport: 0, rawalpindi: 0.226, islamabad: 0.287, murree: 0.693, ayubia: 0.96, reserve: 1 },
  abbottabadAt: 0.86,
  // Heading lines rise from yPercent 110 (.035, stagger .008, power3.out) at 0; the body fades up 20px (.03) at .02.
  head: { at: 0, duration: 0.035, stagger: 0.008, yPercent: 110 },
  body: { at: 0.02, duration: 0.03, y: 20 },
  // At .07 the intro leaves (up 40px, .035, power2.in) as the distances panel comes in from x 30 (.04, power2.out).
  introOut: { at: 0.07, duration: 0.035, y: -40 },
  panelIn: { at: 0.07, duration: 0.04, x: 30 },
  elevationIn: { at: 0.105, duration: 0.03 },
  // Panel and elevation fade out together at .855 (.04); the closing heading rises at .9 (.06, stagger .02), the note at .93.
  panelOut: { at: 0.855, duration: 0.04 },
  closing: { at: 0.9, duration: 0.06, stagger: 0.02, yPercent: 110 },
  note: { at: 0.93, duration: 0.04 },
  // The shade over the map lifts .85 → .25 (.12) at .04 and returns to .7 (.08) at .88.
  shade: { from: 0.85, open: 0.25, openAt: 0.04, openDuration: 0.12, close: 0.7, closeAt: 0.88, closeDuration: 0.08 },
} as const;

/**
 * Address map renderer, measured on live [RouteMap]. Distances in metres; elevations exaggerated ×1.32.
 * Colours are sRGB hex, converted to linear by three.js Color as live (the shaders output them unconverted).
 */
export const addressMap = {
  exaggeration: 1.32,
  fov: { high: 34, mid: 42 },
  dpr: { high: 1.75, mid: 1.5 },
  colors: {
    fog: "#a7a89c",
    sun: "#f3c48a",
    contour: "#d2b896",
    zenith: "#2a3a44",
    horizon: "#d6c0a0",
    beam: "#ffd9a8",
    ring: "#ffd2a0",
    // The main road (airport → Reserve) and the Abbottabad side road: body and hot head colours.
    road: ["#d9c2a5", "#ffdcaa"],
    sideRoad: ["#cbb69b", "#ffe2b8"],
  },
  /** Direction to the low sun (normalised in the renderer). */
  sunDir: [-0.897, 0.139, 0.418],
  fogDensity: 1 / 210000,
  /** Road widths (fraction of the camera distance), how fast the head cools, and the road's lift above the ground. */
  road: { width: 0.0021, sideWidth: 0.0017, hot: 26, sideHot: 18, lift: 26, glowWidth: 3.6, glowAlpha: 0.22 },
  /** Camera rails: the route resampled every 200 m and Gaussian-smoothed (σ 4 km for heading, 1.2 km for aim). */
  rail: { step: 200, headingSigma: 4000, aimSigma: 1200, holdWithin: 7000 },
  /** Damping of the camera rig toward its shot (time constant, s) and of the pointer tilt (per frame). */
  rigTime: 0.28,
  pointerFollow: 0.05,
  pointerTilt: { az: 2, el: 1.2 },
  minClearance: 260,
  pinLift: 60,
} as const;

/**
 * Film grain over the whole page [.grain]: fractal noise (base frequency .9, 3 octaves) as white at 90% alpha
 * in a 220px tile, shown at opacity .07; it jumps between five offsets every .9 s (globals.css nathia-grain).
 */
export const grainNoise = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

/**
 * The line live reads the current scene from, for the nav and HUD tone and the chapter counter: 44px from the
 * top [Shell: ScrollTrigger "top 44px" / "bottom 44px" on every [data-tone]].
 */
export const sceneLine = { px: 44 } as const;

/**
 * Filled pill hover [.btn:before / .btn:hover]: a bone fill rises from below (translateY 101% → 0, .6s ease-out)
 * while the text turns ink and the border bone (.5s); an arrow inside nudges 4px right [.btn:hover .arrow].
 * Add to any pill (outlined or solid); the pill needs `relative isolate overflow-hidden` (included).
 */
export const pillHover =
  "relative isolate overflow-hidden transition-[color,border-color] duration-500 ease-[var(--theme-ease)] before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-ink before:translate-y-[101%] before:transition-transform before:duration-600 before:ease-[var(--theme-ease)] before:content-[''] hover:border-ink hover:text-paper hover:before:translate-y-0 [&_svg]:transition-transform [&_svg]:duration-600 [&_svg]:ease-[var(--theme-ease)] hover:[&_svg]:translate-x-1";

/**
 * Text link with an underline that withdraws to the right on hover [.link: after scaleX(1 → 0), origin right,
 * .7s ease-out]: uppercase .78rem, tracking .18em, 6px below.
 */
export const textLink =
  "relative inline-flex items-center gap-[0.7em] pb-1.5 text-[0.78rem] font-medium uppercase tracking-[0.18em] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:bg-current after:transition-transform after:duration-700 after:ease-[var(--theme-ease)] after:content-[''] hover:after:scale-x-0";

/** Magnetic pills [Magnetic]: follow the pointer by .32 of its offset from the centre, elastic.out(1, .45) over .8s. */
export const magnetic = { strength: 0.32, duration: 0.8, ease: "elastic.out(1, 0.45)" } as const;

/**
 * Cursor [.cursor]: a 6px tan-2 dot following the pointer (.18s, power3.out); over [data-cursor="<label>"] an
 * 84px bone ring (94% opacity, 4px backdrop blur) grows with the label (.6s, theme ease) and the dot shrinks
 * (.3s); over links and buttons both hide. Fades .3s when the pointer leaves the page. Fine pointers only.
 */
export const cursorTiming = { follow: 0.18, ringIn: 0.6, ringOut: 0.45, dot: 0.3, fade: 0.3 } as const;

/**
 * Route curtain [.curtain]: forest panel closing upward from the bottom (inset(100% 0 0 0) → 0, .85s "reserve"),
 * the logo fading up from 30% below (.6s, .35s before the close ends); after the new page has rendered (260ms),
 * the logo fades (.4s) and the panel lifts off the top (→ inset(0 0 100% 0), .95s "reserve", .1s overlap).
 */
export const curtainTiming = { cover: 0.85, markIn: 0.6, markOverlap: 0.35, settle: 0.26, markOut: 0.4, reveal: 0.95, revealOverlap: 0.1 } as const;

/** Smooth scroll on /nathia [startScroll]: Lenis lerp .085, wheel ×.95 (Lenis defaults .1 / 1). */
export const scrollFeel = { lerp: 0.085, wheelMultiplier: 0.95 } as const;

/** Footer [Footer]: photo settles from yPercent -16, scale 1.18; the wordmark rises from yPercent 40; scrubbed while the footer enters (top bottom → bottom bottom). */
export const footerDrift = {
  photo: { yPercent: [-16, 0], scale: [1.18, 1] },
  mark: { yPercent: [40, 0] },
  range: { start: "top bottom", end: "bottom bottom" },
} as const satisfies { photo: { yPercent: [number, number]; scale: [number, number] }; mark: { yPercent: [number, number] }; range: { start: string; end: string } };

/**
 * Ambient sound [Sound]: synthesised wind, no audio file. Four seconds of stereo brown noise (each sample
 * (last + .02 × white) / 1.02, × 3.2) looping through a band-pass at 420 Hz (Q .6) swept ±260 Hz by a .07 Hz
 * oscillator, its level swelling .65 ± .35 at .045 Hz; plus a faint hiss above 2.4 kHz at .05. Fades to .22
 * over 1.8 s when switched on, and back to 0 when off. Starts only from the toggle (a user gesture).
 */
export const ambient = {
  seconds: 4,
  brown: { step: 0.02, leak: 1.02, gain: 3.2 },
  band: { hz: 420, q: 0.6, sweepHz: 0.07, sweepDepth: 260 },
  swell: { hz: 0.045, depth: 0.35, base: 0.65 },
  hiss: { hz: 2400, level: 0.05 },
  level: 0.22,
  fade: 1.8,
} as const;

/**
 * Day timeline (scrub .6 over the pin, 3.2 viewports, 2.8 on mobile), measured on live [Day]. Positions are
 * timeline progress (0–1).
 * - Each moment holds for 8% (`holds`); the shader wipes to the next over 24% (`wipes`), eased smoothstep.
 * - The clock counts the minutes between the moments' times over each wipe; within each hold it drifts
 *   ±7 minutes (the first hold only forward). The sun turns to the moon after 19:24 (1164 minutes).
 * - The bar's segments fill over `fills`; the moment shown (line, lit segment) switches at `switchAt`.
 */
export const dayTiming = {
  scrub: 0.6,
  holds: [[0, 0.08], [0.32, 0.4], [0.64, 0.72], [0.94, 1]],
  wipes: [[0.08, 0.32], [0.4, 0.64], [0.72, 0.94]],
  fills: [[0, 0.32], [0.32, 0.64], [0.64, 0.94], [0.94, 1]],
  switchAt: [0.2, 0.52, 0.83],
  drift: 7,
  moonAfter: 1164,
  // The label fades up 20px over .04 at the start.
  head: { duration: 0.04, y: 20 },
  // Lines: the new one fades in (.5s) as it rises from yPercent 110 (1s, stagger .07, theme ease); the old fades (.35s).
  text: { fadeIn: 0.5, fadeOut: 0.35, rise: 1, stagger: 0.07, yPercent: 110 },
  // Weak devices and reduced motion: the photos crossfade instead (.9s).
  stillFade: 0.9,
  // A segment click scrolls to its moment's hold (middle) over 1.4s.
  clickScroll: 1.4,
  canvasFade: 0.8,
  dpr: { desktop: 1.6, mobile: 1.5 },
} as const;

/**
 * Day wipe shader [Day: .dy-canvas], measured: the next photo is revealed where a key (by mode: bottom up,
 * left to right, darkest first; each mixed with the incoming photo's luminance and soft noise) falls under the
 * moving threshold (progress × 1.36 − .18, ±.1 soft), with a warm glow along the front. Photos cover the canvas,
 * biased 8% of the overflow downward.
 */
export const dayWipe = {
  noise: { scale: [5, 3], speed: 0.02 },
  keys: [
    { axis: 0.6, lum: 0.15, noise: 0.25 },
    { axis: 0.55, lum: 0.2, noise: 0.25 },
    { axis: 0, lum: 0.78, noise: 0.22 },
  ],
  threshold: { scale: 1.36, offset: 0.18, soft: 0.1 },
  glow: { color: [1, 0.86, 0.66], strength: 0.07 },
  focusShift: 0.08,
} as const;

/**
 * Filled pill hover on light (bone) surfaces [.tone-light .btn-solid]: forest pill, a tan fill rises from below
 * (.6s) while the text turns ink and the border tan (.5s); the arrow nudges 4px right. Pair with `pill` and
 * `bg-on-ink border-on-ink text-ink`.
 */
export const pillHoverOnLight =
  "relative isolate overflow-hidden transition-[color,border-color] duration-500 ease-[var(--theme-ease)] before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-accent before:translate-y-[101%] before:transition-transform before:duration-600 before:ease-[var(--theme-ease)] before:content-[''] hover:border-accent hover:text-paper hover:before:translate-y-0 [&_svg]:transition-transform [&_svg]:duration-600 [&_svg]:ease-[var(--theme-ease)] hover:[&_svg]:translate-x-1";

/**
 * Residences [section.rs], measured on live [Residences]:
 * - track: intro 52vw + five types × 92vw + outro 44vw = 556vw, so it reaches 456vw past the screen; the pin
 *   scrolls .95 of that (`end: +=.95 × (scrollWidth − innerWidth)`), track scrub .8; the interiors strip
 *   [.rs-film-track] moves the other way over the same scroll.
 * - per panel, against the moving track: the photo drifts xPercent -10 → 10 at scale 1.18, the plate 30 → -30,
 *   the outline number 40 → -40 ("left right" → "right left", scrub true); the photo frame opens from
 *   inset(10% 6%) ("left right" → "left 35%"); the text pieces [.rs-fade] fade in from 40px (stagger .06, 1 s,
 *   reserveOut) when the panel's left edge reaches 70%. Opacity, not live's autoAlpha: hidden
 *   (visibility) controls couldn't take keyboard focus, and the panels must all be reachable with Tab (§12).
 * - below 900px (no pin, stacked): the frame opens from inset(12% 8%) ("top 90%" → "top 40%", scrub .6) while
 *   its photo settles 1.2 → 1 ("top 90%" → "bottom top"); two rows of interiors loop 70 s each way.
 * - intro heading lines rise (stagger .08, 1.2 s) when the section's top reaches 70%.
 */
export const residencesTiming = {
  overflow: 456,
  distance: 0.95,
  scrub: 0.8,
  effects: [
    { target: "[data-rs-media] img", from: { xPercent: -10, scale: 1.18 }, to: { xPercent: 10, scale: 1.18 }, start: "left right", end: "right left", scrub: true },
    { target: "[data-rs-plate]", from: { xPercent: 30 }, to: { xPercent: -30 }, start: "left right", end: "right left", scrub: true },
    { target: "[data-rs-num]", from: { xPercent: 40 }, to: { xPercent: -40 }, start: "left right", end: "right left", scrub: true },
    { target: "[data-rs-media]", from: { clipPath: "inset(10% 6% 10% 6%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" }, start: "left right", end: "left 35%", scrub: true },
    { target: "[data-rs-fade]", from: { opacity: 0, x: 40 }, to: { opacity: 1, x: 0 }, start: "left 70%", duration: 1, stagger: 0.06 },
  ],
  stackedEffects: [
    { target: "[data-rs-media]", from: { clipPath: "inset(12% 8% 12% 8%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" }, start: "top 90%", end: "top 40%", scrub: 0.6 },
    { target: "[data-rs-media] img", from: { scale: 1.2 }, to: { scale: 1 }, start: "top 90%", end: "bottom top", scrub: true },
  ],
  head: { at: 0.7, stagger: 0.08, duration: 1.2 },
  rowLoop: 70,
} as const;

/**
 * Estate [section.es], measured on live [Estate]:
 * - intro heading lines rise (stagger .1, 1.3 s) when the intro's top reaches 75%; supporting fades as
 *   `sectionTiming`; the rooms rise from 14% of their height, .07 s apart, 1.2 s, at the row's "top 78%".
 * - the film pins for .72 viewports per chapter (.66 below 900px), scrub .6. At progress p (× chapters): each
 *   shot's pan scales 1 → 1.07 across its own chapter; segment fills follow; on the skywalk chapter the gauge
 *   counts to its feet between .05 and .85 of the chapter (smoothstep).
 * - a chapter change: the new shot fades in (1.3 s, power2.inOut) while its photo settles 1.07 → 1 (2.2 s);
 *   the others hide 1.35 s later. The card's title rises (1.15 s, .07 apart, after .25 s) and its pieces fade
 *   up 16px (1 s, .07 apart, after .4 s); the previous card fades out (.35 s).
 * - videos load when the film is 1.6 viewports away, play while it is between 70% and 30% of the screen, the
 *   next one preloads; a "hold" video slows to .3× over its last 1.6 s and stops on its last frame.
 * - a segment click scrolls to that chapter (+.1 into it) over 1.4 s.
 * - Tower B heading lines rise (stagger .12, 1.3 s) at the block's "top 78%".
 */
export const estateTiming = {
  pinPerChapter: { desktop: 0.72, mobile: 0.66 },
  scrub: 0.6,
  head: { at: 0.75, stagger: 0.1, duration: 1.3 },
  rooms: { at: 0.78, stagger: 0.07, duration: 1.2, yPercent: 14 },
  pan: 0.07,
  gauge: [0.05, 0.85],
  shot: { fade: 1.3, ease: "power2.inOut", settleFrom: 1.07, settle: 2.2, hideAfter: 1.35 },
  card: { rise: 1.15, stagger: 0.07, delay: 0.25, fxY: 16, fx: 1, fxDelay: 0.15, out: 0.35 },
  video: { load: "top 160%", play: { start: "top 70%", end: "bottom 30%" }, slowWindow: 1.6, slowMin: 0.3 },
  click: { scroll: 1.4, into: 0.1 },
  towerB: { at: 0.78, stagger: 0.12, duration: 1.3 },
} as const;

/** The snow scene's cold accent: italic heading, kicker and count label [.sn-head em, .sn-kicker: #cfe0ee]. */
export const iceText = "text-[#cfe0ee]";

/**
 * Snow [section.sn], measured on live [Snow]: pinned +2.4 viewports (1.8 below 900px), scrub .8. Over the pin
 * the photo settles from scale 1.16 to 1; the heading lines rise (stagger .05, .2 of the pin, power3.out) from
 * .02, the body fades up 20px at .18 and the count 30px at .22 (each .12 long); the count rolls to its value
 * between .25 and .75 (easeOut, power 2.2). The video loads and plays while pinned and slows to .3× over its
 * last 1.6 s. Snow: WebGL points, 2200 (900 below 900px), none on weak devices, at most 1.5 device pixels.
 */
export const snowTiming = {
  scrub: 0.8,
  mediaScale: [1.16, 1],
  head: { at: 0.02, stagger: 0.05, duration: 0.2, ease: "power3.out" },
  body: { at: 0.18, y: 20, duration: 0.12 },
  count: { at: 0.22, y: 30, duration: 0.12, from: 0.25, to: 0.75, power: 2.2 },
  slowWindow: 1.6,
  slowMin: 0.3,
} as const;

/**
 * The falling snow [Snow: WebGL points]: per flake a random start, depth d and phase; depth mix 62% far (d 0–.35),
 * 31% mid (.35–.7), 7% near (.72–1). Fall speed .035 → .16 by depth; sway sin(t × (.4 + .5d) + phase) ×
 * (.012 + .03d); wind × (.25 + .9d); size 1.4 → 15 px by d²; edge softness .18 → .5; alpha .85 → .32. Wind eases
 * toward 5% of the pointer's offset from centre (2% per frame); scroll velocity pushes it (× .00004).
 * Flakes spread over 2.2 × 2.3 clip-space units (past the edges).
 */
export const snowFall = {
  count: { desktop: 2200, mobile: 900 },
  dprCap: 1.5,
  depthMix: [0.62, 0.93],
  // Depth per band: far 0 → .35, mid .35 → .7, near .72 → 1.
  depth: { far: 0.35, mid: 0.35, near: 0.72 },
  // Clip-space reach: a little wider and taller than the screen, so flakes enter and leave off its edges.
  spread: [2.2, 2.3],
  speed: [0.035, 0.16],
  sway: { rate: [0.4, 0.5], amount: [0.012, 0.03] },
  wind: [0.25, 0.9],
  size: [1.4, 15],
  soft: [0.18, 0.5],
  alpha: [0.85, 0.32],
  pointer: { reach: 0.05, ease: 0.02 },
  push: 0.00004,
} as const;
