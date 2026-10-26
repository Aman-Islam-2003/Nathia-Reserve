"use client";

import { registerCritical } from "@/components/motion/preload";
import { setOdometer } from "@/components/motion/odometer-roll";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { whenIdle } from "@/components/motion/shared";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { mist as mistTokens, MOBILE_QUERY } from "../tokens";
import { createMist, type Mist, type MistValues } from "./mist";

const ELEVATION_FT = 7900; // project.elevationFt
const SCALE_FT = 8000; // top of the gauge

/** 0 → 1 as t goes from a to b (clamped). */
const span = (t: number, a: number, b: number) => gsap.utils.clamp(0, 1, (t - a) / (b - a));
/** Ease-out with a power, for the elevation count (fast at first, settling at 7,900). */
const easeOut = (t: number, power: number) => 1 - Math.pow(1 - t, power);

/**
 * The mist through the climb (measured on live): density 0.42 → 0.95 over .12 → .44, clearing over .5 → .76;
 * the layers fall away as we climb (7 over the pin); golden glow over .3 → .52; sun shafts in over .56 → .8,
 * out over .9 → .97.
 */
const mistAt = (p: number): MistValues => ({
  density: gsap.utils.interpolate(0.42, 0.95, span(p, 0.12, 0.44)) * (1 - span(p, 0.5, 0.76)),
  climb: 7 * p,
  glow: span(p, 0.3, 0.52),
  light: span(p, 0.56, 0.8) * (1 - span(p, 0.9, 0.97)),
});

/**
 * The Ascent's scroll timeline (loaded after first paint). One scrubbed timeline (scrub 0.9) over the pin
 * (6.4 viewports, 5 on mobile), every point measured on the live scene:
 * - 0 → .48 forest still drifts (yPercent -60 → 0, scale 1.08 → 1), hidden at .47; pines fall past by depth
 * - .015 cue out · .02 gauge in · .52 gauge out · 0 → .46 elevation 0 → 7,900 ft (ease-out power 1.8)
 * - each word at its `at`: drops in (.075), leaves .09 later (.08)
 * - read-out grows 1 → 1.07 to .46; label in at .43; read-out leaves at .53
 * - sequence fades in at .455 and scrubs over .47 → .9 (ImageSequence); sequence + still settle 1.14 → 1
 *   from .45; golden-hour still in at .895
 * - title characters rise at .705 (stagger .0035); eyebrow, sub, CTA at .79; copy leaves at .89
 * - .905 the view clips into a framed card (desktop inset 12.5% 35%, mobile 33% 17% 24% 17%, 3px round),
 *   inner scales to .9; .92 background turns bone; .91 shade out; .95 caption; .935 tone turns light and
 *   the chapter becomes the manifesto's (only while the pin is active, as live), and the manifesto flank
 *   rises (heading .94, lede .955)
 * - pointer parallax on the picture (mouse only): ±0.8% / ±0.6%, 2.2 s
 * - WebGL mist over the picture (mid/high tier, runtime/mist.ts), driven by mistAt(progress)
 * Words: blur 10px + tracking .95em → sharp at .5em on arrival, blur 8px on exit; read-out exit blur 14px
 * (approved exception to §4.2, CLAUDE.md §12, these elements only).
 * Reduced motion: no timeline; the golden-hour still, title and copy are shown (CSS + this branch).
 */
export default function AscentMotion({ sceneId, words }: { sceneId: string; words: number[] }) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      // Runtimes mount one commit after their markup (lazyMotion), so the scene is in the DOM by now.
      const s = document.getElementById(sceneId);
      if (!s) return;
      const q = <T extends Element = HTMLElement>(sel: string) => s.querySelector<T>(sel);
      const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, s);

      // The forest still is the LCP image and a critical asset for the preloader.
      const forestImg = q<HTMLImageElement>("[data-critical-image]");
      if (forestImg) registerCritical(forestImg.complete ? Promise.resolve() : forestImg.decode().catch(() => {}));

      const mm = gsap.matchMedia();
      mm.add({ full: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)", mobile: MOBILE_QUERY }, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { full: boolean; reduce: boolean; mobile: boolean };
        const copyAfter = qa("[data-ascent-after]");
        if (reduce) {
          // Live reduced view: golden-hour still, title and copy; everything else hidden (also in CSS).
          gsap.set(copyAfter, { autoAlpha: 1, y: 0 });
          return;
        }

        const stage = q("[data-pinned]");
        const view = q("[data-ascent-view]");
        const forest = q("[data-ascent-forest]");
        const par = q("[data-ascent-par]");
        const inner = q("[data-ascent-inner]");
        const seq = q("[data-ascent-seq]");
        const crisp = q("[data-ascent-crisp]");
        const shade = q("[data-ascent-shade]");
        const gauge = q("[data-ascent-gauge]");
        const mark = q("[data-ascent-gauge-mark]");
        const gaugeNum = q("[data-ascent-gauge-num]");
        const read = q("[data-ascent-read]");
        const readLabel = q("[data-ascent-read-label]");
        const odometer = read?.querySelector("[data-odometer]") ?? null;
        const copy = q("[data-ascent-copy]");
        const cue = q("[data-ascent-cue]");
        const caption = q("[data-ascent-caption]");
        const wordEls = qa("[data-ascent-word]");
        const pines = qa("[data-ascent-pine]");

        // Title characters wait below their line masks, rotated 6°, until .705.
        const split = SplitText.create(qa("[data-ascent-line]"), { type: "chars", charsClass: "inline-block will-change-transform" });
        gsap.set(split.chars, { yPercent: 118, rotate: 6, transformOrigin: "0% 100%" });
        gsap.set(copyAfter, { autoAlpha: 0, y: 22 });
        setOdometer(odometer, 0);

        const chapterHere = s.dataset.chapter;
        const chapterNext = document.querySelector<HTMLElement>('[data-scene="manifesto"]')?.dataset.chapter;
        let tone = "dark";
        const onProgress = (p: number) => {
          const elevation = ELEVATION_FT * easeOut(span(p, 0, 0.46), 1.8);
          setOdometer(odometer, elevation);
          if (mark) mark.style.transform = `translate3d(0, ${(-elevation / SCALE_FT) * 100}%, 0)`;
          if (gaugeNum) gaugeNum.textContent = Math.round(elevation).toLocaleString("en-US");
          // Hand-over: tone (header, HUD) and chapter switch to the manifesto at .935, while the pin is active
          // (as live: a jump straight past the end leaves it to useSceneAt when the manifesto arrives).
          const next = p > 0.935 ? "light" : "dark";
          if (next !== tone && tl.scrollTrigger?.isActive) {
            tone = next;
            s.dataset.tone = next;
            if (chapterNext && chapterHere) s.dataset.chapter = next === "light" ? chapterNext : chapterHere;
          }
        };

        // Heading lines at .94, lede lines at .955, as live, even where their stagger runs past 1: live's timeline
        // then lasts longer than 1 (1.024 with four lede lines) and every point lands at progress t / duration.
        // Clamping them to end at 1 put the whole climb ~2% behind live (title characters, measured).
        const flankAt = 0.94;
        const ledeAt = 0.955;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          // The scene root is the pin track (PinnedSection): top top → bottom bottom is the pinned range.
          scrollTrigger: { trigger: s, start: "top top", end: "bottom bottom", scrub: 0.9 },
        });
        tl.to({}, { duration: 1 }, 0); // the timeline spans at least 0 → 1 (see flankAt)

        tl.fromTo(forest, { yPercent: -60, scale: 1.08 }, { yPercent: 0, scale: 1, duration: 0.48 }, 0).to(forest, { autoAlpha: 0, duration: 0.05 }, 0.47);
        pines.forEach((pine) => {
          const depth = Number(pine.dataset.depth);
          tl.fromTo(pine, { yPercent: -35 - 40 * depth }, { yPercent: 170 + 260 * depth, duration: 0.5 }, 0);
        });
        tl.to(cue, { autoAlpha: 0, duration: 0.04 }, 0.015);
        tl.fromTo(gauge, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.02).to(gauge, { autoAlpha: 0, duration: 0.06 }, 0.52);
        wordEls.forEach((word, i) => {
          const at = words[i] ?? 0;
          // Blur and letter-spacing as live (approved exception to §4.2, CLAUDE.md §12: words and read-out only).
          tl.fromTo(
            word,
            { yPercent: -240, autoAlpha: 0, letterSpacing: "0.95em", filter: "blur(10px)" },
            { yPercent: 0, autoAlpha: 1, letterSpacing: "0.5em", filter: "blur(0px)", duration: 0.075, ease: "power2.out" },
            at,
          ).to(word, { yPercent: 300, autoAlpha: 0, filter: "blur(8px)", duration: 0.08, ease: "power2.in" }, at + 0.09);
        });
        tl.to(read, { scale: 1.07, duration: 0.46 }, 0)
          .fromTo(readLabel, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.03 }, 0.43)
          .to(read, { autoAlpha: 0, yPercent: -36, filter: "blur(14px)", duration: 0.08, ease: "power2.in" }, 0.53);
        tl.fromTo(seq, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.455)
          .fromTo([seq, crisp], { scale: 1.14 }, { scale: 1, duration: 0.5, ease: "power1.out" }, 0.45)
          .to(crisp, { autoAlpha: 1, duration: 0.05 }, 0.895);
        tl.to(split.chars, { yPercent: 0, rotate: 0, duration: 0.1, stagger: 0.0035, ease: "power3.out" }, 0.705)
          .to(copyAfter, { autoAlpha: 1, y: 0, duration: 0.07, stagger: 0.015, ease: "power2.out" }, 0.79)
          .to(copy, { autoAlpha: 0, y: -40, duration: 0.05, ease: "power2.in" }, 0.89);
        tl.fromTo(
          view,
          { clipPath: "inset(0% 0% 0% 0% round 0px)" },
          { clipPath: mobile ? "inset(33% 17% 24% 17% round 3px)" : "inset(12.5% 35% 12.5% 35% round 3px)", duration: 0.09, ease: "power2.inOut" },
          0.905,
        )
          .fromTo(inner, { scale: 1 }, { scale: 0.9, duration: 0.09, ease: "power2.inOut" }, 0.905)
          // Background: paper → bone (the theme's ink colour), measured #0c0f0d → #efe9df.
          .fromTo(stage, { backgroundColor: getComputedStyle(s).getPropertyValue("--theme-paper") }, { backgroundColor: getComputedStyle(s).getPropertyValue("--theme-ink"), duration: 0.07 }, 0.92)
          .fromTo(shade, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.06 }, 0.91)
          .fromTo(caption, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.95)
          .to(qa("[data-ascent-flank-fade]"), { autoAlpha: 1, duration: 0.03 }, 0.935)
          // From explicit values: GSAP would read the markup's inline translateY(112%) as pixels (y), not yPercent.
          .fromTo(qa("[data-ascent-flank-line]"), { y: 0, yPercent: 112 }, { yPercent: 0, duration: 0.05, stagger: 0.012, ease: "power3.out" }, flankAt)
          .fromTo(qa("[data-ascent-lede-line]"), { y: 0, yPercent: 112 }, { yPercent: 0, duration: 0.045, stagger: 0.008, ease: "power3.out" }, ledeAt);
        onProgress(0);

        // The mist (WebGL, mid/high tier). Set up when the browser is idle, so compiling the shader stays off
        // the load path; until then the canvas is transparent. It renders only while the scene is on screen.
        const mistCanvas = q<HTMLCanvasElement>("[data-ascent-mist]");
        let mistLayer: Mist | null = null;
        let mistObserver: IntersectionObserver | undefined;
        let disposed = false;
        const cancelMist = mistCanvas
          ? whenIdle(async () => {
              const layer = await createMist(mistCanvas, mobile ? 0.3 : 0.45, mistTokens);
              if (disposed) return layer?.destroy();
              if (!layer) {
                mistCanvas.style.display = "none";
                return;
              }
              mistLayer = layer;
              layer.set(mistAt(tl.progress()));
              mistObserver = new IntersectionObserver(([entry]) => (entry.isIntersecting ? layer.play() : layer.pause()));
              mistObserver.observe(s);
            })
          : undefined;
        const onResize = () => mistLayer?.resize();
        window.addEventListener("resize", onResize);
        tl.eventCallback("onUpdate", () => {
          const p = tl.progress();
          onProgress(p);
          mistLayer?.set(mistAt(p));
        });

        const cleanup: (() => void)[] = [
          () => {
            disposed = true;
            cancelMist?.();
            mistObserver?.disconnect();
            mistLayer?.destroy();
            window.removeEventListener("resize", onResize);
            split.revert();
            s.dataset.tone = "dark";
            if (chapterHere) s.dataset.chapter = chapterHere;
          },
        ];

        // Pointer parallax on the picture, mouse and full motion only.
        if (par && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const toX = gsap.quickTo(par, "xPercent", { duration: 2.2, ease: "power3.out" });
          const toY = gsap.quickTo(par, "yPercent", { duration: 2.2, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            toX(-((e.clientX / window.innerWidth - 0.5) * 1.6));
            toY(-((e.clientY / window.innerHeight - 0.5) * 1.2));
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          cleanup.push(() => window.removeEventListener("pointermove", onMove));
        }
        return () => cleanup.forEach((fn) => fn());
      });
    },
    { dependencies: [sceneId, motion, words.join(",")], revertOnUpdate: true },
  );

  return null;
}
