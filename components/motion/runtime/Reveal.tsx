"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { claimReveal, onReplay, whenNear, type DurKey } from "../shared";
import { isInView, revealTrigger, useRuntimeMotion } from "./shared";

/** Reveal's animation (loaded after first paint). Renders nothing; animates `target` (or its children). */
export default function RevealMotion({
  target,
  x,
  y,
  yPercent,
  stagger,
  duration,
  at,
  trigger,
  delay,
}: {
  target: RefObject<HTMLElement | null>;
  x: number | undefined;
  y: number | undefined;
  yPercent: number | undefined;
  stagger: number | undefined;
  duration: DurKey | number;
  at: number;
  trigger: string | undefined;
  delay: number | undefined;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = target.current;
      // Already shown by revealFallback (on screen before this loaded): leave it static.
      if (!el || claimReveal(el)) return;
      const mm = gsap.matchMedia();
      // The element itself, or its children in turn, skipping the lazy-mount anchor <template>.
      const units = () => (stagger === undefined ? [el] : [...el.children].filter((c) => c.tagName !== "TEMPLATE"));

      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        let tl: gsap.core.Timeline | undefined;
        const init = ctx.add("init", () => {
          const d = typeof duration === "number" ? duration : motion.dur[duration];
          const from = yPercent === undefined ? { x: x ?? 0, y: y ?? (x === undefined ? motion.revealDistance : 0) } : { x: x ?? 0, y: 0, yPercent };
          const startsFrom = (trigger && el.closest(trigger)) || el;
          tl = gsap.timeline({ scrollTrigger: revealTrigger(startsFrom, at), delay });
          // With a stagger the element is just the frame: show it, reveal its children.
          if (stagger !== undefined) gsap.set(el, { autoAlpha: 1 });
          // Two tweens, one trigger: opacity on the soft ease, the movement (a transform) on the brand ease.
          tl.fromTo(units(), { autoAlpha: 0 }, { autoAlpha: 1, duration: d, stagger, ease: motion.easeSoft }, 0).fromTo(
            units(),
            from,
            { x: 0, y: 0, ...(yPercent === undefined ? {} : { yPercent: 0 }), duration: d, stagger, ease: motion.ease },
            0,
          );
        });
        const stop = whenNear(el, () => init());
        const offReplay = onReplay(() => tl);
        return () => {
          stop();
          offReplay();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (isInView(el)) return;
        const anim = gsap.from(el, { autoAlpha: 0, duration: motion.dur.fast, ease: motion.easeSoft, scrollTrigger: revealTrigger(el, at) });
        return onReplay(() => anim);
      });
    },
    { scope: target, dependencies: [motion, x, y, yPercent, stagger, duration, at, trigger, delay], revertOnUpdate: true },
  );

  return null;
}
