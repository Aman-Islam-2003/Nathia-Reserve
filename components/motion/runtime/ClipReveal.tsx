"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { ClipScrub } from "../ClipReveal";
import { claimReveal, onReplay, whenNear, type DurKey } from "../shared";
import { isInView, measureAtStart, revealTrigger, useRuntimeMotion } from "./shared";

/** ClipReveal's animation (loaded after first paint). Renders nothing; animates `target` and `inner`. */
export default function ClipRevealMotion({
  target,
  inner,
  from,
  to,
  scale,
  duration,
  scaleDuration,
  ease,
  fade,
  at,
  scrub,
}: {
  target: RefObject<HTMLDivElement | null>;
  inner: RefObject<HTMLDivElement | null>;
  from: string;
  to: string;
  scale: number | false;
  duration: DurKey | number;
  scaleDuration: DurKey | number | undefined;
  ease: "soft" | "inOut";
  fade: boolean;
  at: number;
  scrub: ClipScrub | undefined;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const seconds = (d: DurKey | number) => (typeof d === "number" ? d : motion.dur[d]);

      if (scrub) {
        // Scroll-linked: the clip follows the scroll between start and end. Reduced motion: no branch, full frame.
        mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
          const init = ctx.add("init", () => {
            const tween = gsap.fromTo(
              el,
              { clipPath: from },
              // Linear: the opening maps 1:1 to scroll.
              { clipPath: to, ease: "none", scrollTrigger: { trigger: el, start: scrub.start, end: scrub.end, scrub: scrub.smooth } },
            );
            // Inside a drifting parent (gallery columns): measured with it at its start, as a full refresh does.
            measureAtStart([tween.scrollTrigger!]);
            return tween;
          });
          return whenNear(el, () => init());
        });
        return;
      }

      // Already shown by revealFallback (on screen before this loaded): leave it static.
      if (claimReveal(el)) return;

      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        let tl: gsap.core.Timeline | undefined;
        // Lazy: build the reveal only when the element is about a viewport away (see whenNear).
        const init = ctx.add("init", () => {
          const d = seconds(duration);
          tl = gsap.timeline({ scrollTrigger: revealTrigger(el, at) });
          // clip-path and opacity never overshoot (the soft ease, or the in-out ease for a curtain); the inner
          // scale (a transform) uses the brand ease.
          const clipEase = ease === "inOut" ? motion.easeInOut : motion.easeSoft;
          tl.fromTo(el, { clipPath: from }, { clipPath: to, duration: d, ease: clipEase }, 0);
          if (fade) tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: d, ease: motion.easeSoft }, 0);
          else gsap.set(el, { autoAlpha: 1 });
          if (scale !== false) {
            tl.from(inner.current, { scale, duration: seconds(scaleDuration ?? duration), ease: motion.ease }, 0);
          }
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
        const anim = gsap.from(el, {
          autoAlpha: 0,
          duration: motion.dur.fast,
          ease: motion.easeSoft,
          scrollTrigger: revealTrigger(el, at),
        });
        return onReplay(() => anim);
      });
    },
    {
      scope: target,
      dependencies: [motion, from, to, scale, duration, scaleDuration, ease, fade, at, scrub?.start, scrub?.end, scrub?.smooth],
      revertOnUpdate: true,
    },
  );

  return null;
}
