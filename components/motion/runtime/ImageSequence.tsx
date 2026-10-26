"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { frameUrl, type FrameSet } from "../ImageSequence";
import { registerCritical } from "../preload";

const REDUCED = "(prefers-reduced-motion: reduce)";
const PARALLEL = 5;

/** Load order: every 8th, then every 4th, every 2nd, the rest (and always the last frame in the first pass). */
function loadOrder(count: number) {
  const seen = new Set<number>();
  const passes: number[][] = [];
  for (const step of [8, 4, 2, 1]) {
    const pass: number[] = [];
    for (let i = 0; i < count; i += step) {
      if (seen.has(i)) continue;
      seen.add(i);
      pass.push(i);
    }
    if (step === 8 && !seen.has(count - 1)) {
      seen.add(count - 1);
      pass.push(count - 1);
    }
    passes.push(pass);
  }
  return passes; // [every 8th (+ last), every 4th, every 2nd, rest]
}

/** True on a fast connection that isn't metered (no Data Saver, not cellular). */
function fastUnmetered() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string; type?: string; downlink?: number } }).connection;
  if (!c) return false;
  return !c.saveData && c.effectiveType === "4g" && c.type !== "cellular" && (c.downlink ?? 0) >= 5;
}

/** ImageSequence's loader, canvas drawing and scrub (loaded after first paint). Renders nothing. */
export default function ImageSequenceMotion({
  target,
  frames,
  mobileFrames,
  mobileQuery,
  range,
  focusY,
  mobileFocusY,
  dprCap,
  mobileDprCap,
  reducedFrame,
  critical,
  scrub,
}: {
  target: RefObject<HTMLCanvasElement | null>;
  frames: FrameSet;
  mobileFrames: FrameSet;
  mobileQuery: string;
  range: [number, number];
  focusY: number;
  mobileFocusY: number;
  dprCap: number;
  mobileDprCap: number;
  reducedFrame: "first" | "last";
  critical: boolean;
  scrub: boolean | number;
}) {
  useGSAP(
    () => {
      const canvas = target.current;
      const ctx = canvas?.getContext("2d", { alpha: false });
      if (!canvas || !ctx) return;
      const mm = gsap.matchMedia();

      // matchMedia runs the callback only when at least one condition matches, so the full/reduce pair keeps
      // one condition always true (desktop with motion matched nothing with just mobile + reduce).
      mm.add({ full: "(prefers-reduced-motion: no-preference)", reduce: REDUCED, mobile: mobileQuery }, (mctx) => {
        const { mobile, reduce } = mctx.conditions as { full: boolean; mobile: boolean; reduce: boolean };
        const set = mobile ? mobileFrames : frames;
        const focus = mobile ? mobileFocusY : focusY;
        const cap = mobile ? mobileDprCap : dprCap;
        const images: (HTMLImageElement | null)[] = Array(set.count).fill(null);
        let position = 0; // fractional frame index
        let destroyed = false;
        let box: { x: number; y: number; w: number; h: number } | null = null;

        const nearest = (i: number) => {
          if (images[i]) return images[i];
          for (let d = 1; d < set.count; d++) {
            if (images[i - d]) return images[i - d];
            if (images[i + d]) return images[i + d];
          }
          return null;
        };

        // Cover-fit the frame into the canvas, anchored horizontally centred and vertically at `focus`.
        const draw = () => {
          const base = Math.floor(position);
          const img = nearest(base);
          if (!img) return;
          if (!box) {
            const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;
            box = { x: (canvas.width - w) / 2, y: (canvas.height - h) * focus, w, h };
          }
          ctx.globalAlpha = 1;
          ctx.drawImage(img, box.x, box.y, box.w, box.h);
          // Crossfade into the next frame by the fractional part, if it has loaded.
          const fraction = position - base;
          const next = base + 1 < set.count ? images[base + 1] : null;
          if (next && next !== img && fraction > 0.02) {
            ctx.globalAlpha = fraction;
            ctx.drawImage(next, box.x, box.y, box.w, box.h);
            ctx.globalAlpha = 1;
          }
        };

        // Retina-sharp backing store, capped (a full-screen canvas at 3x is costly to fill every frame).
        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, cap);
          const w = Math.round(canvas.clientWidth * dpr);
          const h = Math.round(canvas.clientHeight * dpr);
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            box = null;
          }
          draw();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const load = (i: number) =>
          new Promise<void>((resolve) => {
            if (images[i] || destroyed) return resolve();
            const img = new Image();
            img.decoding = "async";
            img.onload = () => {
              const done = () => {
                if (destroyed) return resolve();
                images[i] = img;
                // Redraw if this frame is (near) the one on screen.
                if (Math.abs(i - position) < 2 || !nearest(Math.floor(position))) draw();
                resolve();
              };
              if (img.decode) img.decode().then(done, done);
              else done();
            };
            img.onerror = () => resolve();
            img.src = frameUrl(set, i);
          });
        const loadAll = async (list: number[]) => {
          let next = 0;
          const worker = async () => {
            while (!destroyed && next < list.length) await load(list[next++]);
          };
          await Promise.all(Array.from({ length: PARALLEL }, worker));
        };

        if (reduce) {
          position = reducedFrame === "last" ? set.count - 1 : 0;
          const only = load(Math.round(position)).then(resize);
          if (critical) registerCritical(only);
          return () => {
            destroyed = true;
            ro.disconnect();
          };
        }

        // 1) First frame (critical), 2) every 8th, 3) the rest on the first interaction or a fast connection.
        const [eighths, ...rest] = loadOrder(set.count);
        const first = load(0);
        if (critical) registerCritical(first);
        let restStarted = false;
        const startRest = () => {
          if (restStarted) return;
          restStarted = true;
          detach();
          void (async () => {
            for (const pass of rest) await loadAll(pass);
          })();
        };
        const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
        const detach = () => events.forEach((e) => window.removeEventListener(e, startRest));
        events.forEach((e) => window.addEventListener(e, startRest, { passive: true, once: true }));
        void first.then(() => loadAll(eighths)).then(() => {
          if (fastUnmetered()) startRest();
        });

        // Scrub: the nearest pin's scroll range, mapped through `range`.
        // (The nearest PinnedSection track: its pinned range is top top → bottom bottom.)
        const pin = canvas.closest<HTMLElement>("[data-pin-track]");
        const [from, to] = range;
        // A tween on a proxy so `scrub` can lag behind the scroll (scene timelines use scrub 0.9).
        const proxy = { p: 0 };
        const tween = gsap.to(proxy, {
          p: 1,
          ease: "none",
          scrollTrigger: {
            trigger: pin ?? canvas,
            start: pin ? "top top" : "top bottom",
            end: pin ? "bottom bottom" : "bottom top",
            scrub,
            // Any scroll also starts the remaining frames (keyboard scrollbars, scroll restoration).
            onUpdate: (self) => {
              if (self.progress > 0) startRest();
            },
          },
          onUpdate: () => {
            const p = gsap.utils.clamp(0, 1, (proxy.p - from) / (to - from || 1));
            const next = p * (set.count - 1);
            if (Math.abs(next - position) < 0.01) return;
            position = next;
            draw();
          },
        });
        const st = { kill: () => tween.kill() };
        return () => {
          destroyed = true;
          detach();
          ro.disconnect();
          st.kill();
        };
      });
    },
    // Frame sets compared by value: a new object with the same frames must not reload the sequence.
    { dependencies: [JSON.stringify(frames), JSON.stringify(mobileFrames), mobileQuery, range[0], range[1], focusY, mobileFocusY, dprCap, mobileDprCap, reducedFrame, critical, scrub], revertOnUpdate: true },
  );

  return null;
}
