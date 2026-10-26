"use client";

import type { RefObject } from "react";
import { getLenis } from "@/components/providers/lenis-store";
import { gsap, useGSAP, type ScrollTrigger } from "@/lib/gsap";
import type { PanelEffect } from "../HorizontalScroll";
import { whenNear } from "../shared";
import { useRuntimeMotion } from "./shared";

/** HorizontalScroll's scroll link (loaded after first paint). Renders nothing; moves `track` and its panels. */
export default function HorizontalScrollMotion({
  track,
  panel,
  scrub,
  effects,
  stackedEffects,
  stack,
}: {
  track: RefObject<HTMLDivElement | null>;
  panel: string;
  scrub: boolean | number;
  effects: PanelEffect[];
  stackedEffects: PanelEffect[];
  stack: boolean;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const tr = track.current;
      const section = tr?.closest<HTMLElement>("[data-pin-track]");
      if (!tr || !section) return;
      const panels = () => gsap.utils.toArray<HTMLElement>(panel, tr);
      const run = (fx: PanelEffect, p: HTMLElement, vars: ScrollTrigger.Vars) => {
        const targets = fx.target ? p.querySelectorAll(fx.target) : [p];
        if (!targets.length) return;
        const scrubbed = fx.scrub !== undefined;
        gsap.fromTo(targets, fx.from, {
          ...fx.to,
          ease: fx.ease ?? (scrubbed ? "none" : motion.ease),
          ...(scrubbed ? {} : { duration: fx.duration ?? motion.dur.base, stagger: fx.stagger }),
          scrollTrigger: { trigger: p, start: fx.start, end: fx.end, ...(scrubbed ? { scrub: fx.scrub } : {}), ...vars },
        });
      };
      const mm = gsap.matchMedia();

      // Pinned: the track slides by its overflow over the pin (the section's top-top → bottom-bottom range).
      mm.add(`(prefers-reduced-motion: no-preference)${stack ? " and (min-width: 900px)" : ""}`, (ctx) => {
        let teardown = () => {};
        let timer = 0;
        const init = ctx.add("init", () => {
          const overflowOf = (el: HTMLElement) => el.scrollWidth - window.innerWidth;
          const range = { trigger: section, start: "top top", end: "bottom bottom", scrub, invalidateOnRefresh: true };
          // Linear: the track's position maps 1:1 to scroll.
          const container = gsap.to(tr, { x: () => -overflowOf(tr), ease: "none", scrollTrigger: range });
          gsap.utils.toArray<HTMLElement>("[data-hs-counter]", section).forEach((counter) =>
            gsap.fromTo(counter, { x: () => -overflowOf(counter) }, { x: 0, ease: "none", scrollTrigger: range }),
          );
          // One panel's effects per task: each trigger measures the page, and all of them in one task (with the
          // section's first style) was a 270–420 ms task at 4x CPU. The track exists by then, so nothing moves late.
          const queue = panels();
          const next = ctx.add("panel", () => {
            const p = queue.shift();
            if (!p) return;
            effects.forEach((fx) => run(fx, p, { containerAnimation: container }));
            timer = window.setTimeout(next, 0);
          });
          timer = window.setTimeout(next, 0);

          // Keyboard: the browser shows a focused element by scrolling the clipped stage sideways, which the
          // track's own movement would then fight. Undo that, and scroll the page to where the panel is in view.
          const onFocus = (e: FocusEvent) => {
            for (let el = tr.parentElement; el && el !== section; el = el.parentElement) el.scrollLeft = 0;
            const p = (e.target as Element).closest<HTMLElement>(panel);
            const st = container.scrollTrigger;
            if (!p || !tr.contains(p) || !st) return;
            const box = p.getBoundingClientRect();
            if (box.left >= 0 && box.right <= window.innerWidth) return;
            const y = st.start + (st.end - st.start) * Math.min(1, Math.max(0, p.offsetLeft / overflowOf(tr)));
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(y);
            else window.scrollTo({ top: y });
          };
          section.addEventListener("focusin", onFocus);
          teardown = () => section.removeEventListener("focusin", onFocus);
        });
        const stop = whenNear(section, () => init());
        return () => {
          stop();
          window.clearTimeout(timer);
          teardown();
        };
      });

      // Stacked (below 900px): no pin; each panel's effects follow it up the screen.
      if (stack && stackedEffects.length) {
        mm.add("(prefers-reduced-motion: no-preference) and (max-width: 899px)", (ctx) => {
          const init = ctx.add("init", () => panels().forEach((p) => stackedEffects.forEach((fx) => run(fx, p, {}))));
          return whenNear(section, () => init());
        });
      }
      // Reduced motion: no branch; the panels stack, static.
    },
    { dependencies: [motion, panel, scrub, stack, JSON.stringify(effects), JSON.stringify(stackedEffects)], revertOnUpdate: true },
  );

  return null;
}
