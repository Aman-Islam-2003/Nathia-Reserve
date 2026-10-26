"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { allCritical, onPreloadProgress } from "../preload";
import { useRuntimeMotion } from "./shared";

const REDUCED = "(prefers-reduced-motion: reduce)";
const sleep = (s: number) => new Promise<void>((r) => setTimeout(r, s * 1000));

/**
 * Preloader motion (loaded after first paint). Measured on the Nathia preloader:
 * - draw: stroke 1 → 0, theme curtain ease, 1.35 s, stagger 0.015 from the first path; fill in 0.7 s
 *   (0.35 s before the draw ends); stroke out 0.5 s, 0.2 s later
 * - meta: fades in over 1 s after 0.4 s, stagger 0.12
 * - progress: eased to each new value over 0.6 s (power2.out)
 * - done when the critical assets and fonts are ready and minDuration has passed, or at maxDuration
 * - exit: read-out to 100 (0.35 s) and meta out (0.4 s); the logo flies into `target` (1.25 s, curtain
 *   ease) while the backdrop fades (1.05 s, 0.15 s later); the page unlocks 0.55 s before the end; the
 *   logo fades last (0.35 s). Reduced motion or no target: the overlay fades (0.6 s).
 * Renders nothing.
 */
export default function PreloaderMotion({
  root,
  target,
  minDuration,
  maxDuration,
  onDone,
}: {
  root: RefObject<HTMLDivElement | null>;
  target?: string;
  minDuration: number;
  maxDuration: number;
  onDone: () => void;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const reduced = window.matchMedia(REDUCED).matches;
      const paths = el.querySelectorAll("[data-preloader-mark] path");
      const mark = el.querySelector<HTMLElement>("[data-preloader-mark]");
      const bar = el.querySelector<HTMLElement>("[data-preloader-bar]");
      const read = el.querySelector<HTMLElement>("[data-preloader-read]");
      const meta = el.querySelectorAll("[data-preloader-meta] > *");
      const state = { v: 0 };
      const render = () => {
        if (bar) bar.style.transform = `scaleX(${state.v})`;
        if (read) read.textContent = String(Math.round(state.v * 100)).padStart(3, "0");
      };

      const draw = gsap.timeline();
      if (reduced) gsap.set(paths, { strokeDashoffset: 0, fillOpacity: 1, strokeOpacity: 0 });
      else
        draw
          .fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.35, ease: motion.easeInOut, stagger: { each: 0.015, from: "start" } })
          .to(paths, { fillOpacity: 1, duration: 0.7, ease: "power2.out" }, "-=0.35")
          .to(paths, { strokeOpacity: 0, duration: 0.5 }, "<0.2");
      gsap.fromTo(meta, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, delay: 0.4, stagger: 0.12 });

      const off = onPreloadProgress((p) => gsap.to(state, { v: p, duration: 0.6, ease: "power2.out", onUpdate: render, overwrite: true }));

      let cancelled = false;
      const ready = Promise.all([sleep(0).then(() => Promise.all([allCritical(), document.fonts?.ready])), // The minimum counts from navigation start (the overlay has been showing since first paint), not from
      // when this runtime arrived.
      sleep(Math.max(0, (reduced ? 0.3 : minDuration) - performance.now() / 1000))]);
      Promise.race([ready, sleep(Math.max(0, maxDuration - performance.now() / 1000))]).then(() => {
        if (cancelled) return;
        off();
        draw.progress(1);
        const exit = gsap.timeline({ onComplete: onDone });
        exit.to(state, { v: 1, duration: 0.35, onUpdate: render });
        exit.to(meta, { autoAlpha: 0, duration: 0.4 }, "<");
        const to = target ? document.querySelector(target)?.getBoundingClientRect() : null;
        const from = mark?.getBoundingClientRect();
        if (mark && from && to && to.width > 0 && !reduced) {
          exit.to(mark, {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale: to.width / from.width,
            duration: 1.25,
            ease: motion.easeInOut,
          }, "-=0.05");
          exit.to(el, { backgroundColor: "rgba(0,0,0,0)", duration: 1.05, ease: "power2.inOut" }, "<0.15");
        } else {
          exit.to(el, { autoAlpha: 0, duration: 0.6 });
        }
        // Unlock the page (and reveal what waits on [data-loading]) 0.55 s before the end.
        exit.add(() => delete document.documentElement.dataset.loading, "-=0.55");
        if (mark) exit.to(mark, { autoAlpha: 0, duration: 0.35 }, "-=0.15");
      });
      return () => {
        cancelled = true;
        off();
      };
    },
    { scope: root, dependencies: [motion, target, minDuration, maxDuration], revertOnUpdate: true },
  );

  return null;
}
