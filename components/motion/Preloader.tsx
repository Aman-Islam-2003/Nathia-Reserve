"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getLenis } from "@/components/providers/lenis-store";
import { lazyMotion } from "./lazy";

// The draw, progress and exit (GSAP) load after first paint; the overlay itself is in the server HTML,
// so the page never flashes before it covers it.
const PreloaderMotion = lazyMotion(() => import("./runtime/Preloader"));

/**
 * Full-screen preloader: a logo (SVG paths) drawn by its stroke, then filled; a progress bar and read-out
 * following the critical assets registered with `registerCritical` (components/motion/preload.ts); then the
 * logo flies into `target` (e.g. the header logo) while the backdrop fades, and the page unlocks.
 *
 * - The page is locked while it shows: `<html data-loading>` (CSS: no scroll; elements marked
 *   `data-hide-while-loading` stay hidden), smooth scroll stopped, scrolled to the top.
 * - Stays at least `minDuration` and at most `maxDuration` seconds, whatever is still loading.
 * - Reduced motion: the logo is shown drawn, and the overlay fades out after a short minimum.
 * - No JS: never shown (`html.js` is required). If the runtime never runs, CSS removes it after
 *   maxDuration + 2 s.
 * - `mark` must be an <svg> whose <path>s have `pathLength={1}` (so the stroke draws from 0 to 1).
 */
export function Preloader({
  mark,
  markAspect,
  label,
  ariaLabel,
  target,
  minDuration = 1.8,
  maxDuration = 9,
  metaClassName = "",
}: {
  mark: ReactNode;
  /** Width / height of the mark, e.g. 6454 / 3418. */
  markAspect: number;
  /** Left side of the read-out row, e.g. a location line. */
  label: string;
  ariaLabel: string;
  /** CSS selector of the element the logo flies into on exit. Without it, the overlay fades. */
  target?: string;
  minDuration?: number;
  maxDuration?: number;
  /** Horizontal inset of the progress block (the page gutter). */
  metaClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  // Lock the page while loading (no GSAP needed, so it runs at hydration, before the runtime arrives).
  useEffect(() => {
    if (done) return;
    const html = document.documentElement;
    html.dataset.loading = "";
    window.scrollTo(0, 0);
    getLenis()?.stop();
    return () => {
      delete html.dataset.loading;
      getLenis()?.start();
    };
  }, [done]);

  if (done) return null;
  return (
    <div
      ref={ref}
      data-preloader
      data-print="hide"
      role="status"
      aria-label={ariaLabel}
      className="fixed inset-0 z-[100] grid place-items-center bg-paper text-accent"
      style={{ "--preloader-max": `${maxDuration + 2}s` } as React.CSSProperties}
    >
      <div
        data-preloader-mark
        style={{ aspectRatio: markAspect }}
        // Stroke drawn from 0 to 1 (pathLength 1), then filled. Reduced motion: drawn from the start.
        className="w-[min(46vw,420px)] [&_path]:fill-current [&_path]:stroke-current [&_path]:[fill-opacity:0] [&_path]:[stroke-dasharray:1] [&_path]:[stroke-dashoffset:1] [&_path]:[stroke-width:0.9px] [&_path]:[vector-effect:non-scaling-stroke] [&_svg]:size-full [&_svg]:overflow-visible motion-reduce:[&_path]:[fill-opacity:1] motion-reduce:[&_path]:[stroke-dashoffset:0] motion-reduce:[&_path]:[stroke-opacity:0]"
      >
        {mark}
      </div>
      <div data-preloader-meta className={`absolute bottom-[6vh] grid gap-3.5 ${metaClassName}`}>
        <span className="relative block h-px overflow-hidden bg-line">
          <i data-preloader-bar className="absolute inset-0 origin-left scale-x-0 bg-accent" />
        </span>
        <span className="flex justify-between font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">
          <span>{label}</span>
          <span data-preloader-read className="tabular-nums">000</span>
        </span>
      </div>
      <PreloaderMotion root={ref} target={target} minDuration={minDuration} maxDuration={maxDuration} onDone={() => setDone(true)} />
    </div>
  );
}
