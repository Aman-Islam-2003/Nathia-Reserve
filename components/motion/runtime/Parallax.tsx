"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { whenNear } from "../shared";
import { measureAtStart, triggersWithin } from "./shared";

/** Parallax's scroll link (loaded after first paint). Renders nothing; moves `target`. */
export default function ParallaxMotion({
  target,
  speed,
  drift,
  range,
  media,
}: {
  target: RefObject<HTMLDivElement | null>;
  speed: number;
  drift: { yPercent: [number, number]; scale?: [number, number] } | undefined;
  range: { start: string; end: string; closest?: string } | undefined;
  media: string | undefined;
}) {
  const [fromY, toY] = drift?.yPercent ?? [0, 0];
  const [fromScale, toScale] = drift?.scale ?? [1, 1];
  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
      const distance = () => speed * window.innerHeight * 0.5;
      const mm = gsap.matchMedia();

      // Reduced motion: no branch, the element stays where layout puts it.
      mm.add(`(prefers-reduced-motion: no-preference)${media ? ` and ${media}` : ""}`, (ctx) => {
        // Lazy: create the scrubbed trigger only when the element is about a viewport away.
        const init = ctx.add("init", () => {
          const tween = gsap.fromTo(
            el,
            drift ? { yPercent: fromY, scale: fromScale } : { y: () => distance() },
            {
              ...(drift ? { yPercent: toY, scale: toScale } : { y: () => -distance() }),
              // Linear: position maps 1:1 to scroll, so a brand ease would feel like drag.
              ease: "none",
              scrollTrigger: {
                // A drifting element is measured by its frame (the parent), which it moves inside.
                trigger: drift ? ((range?.closest && el.closest(range.closest)) || el.parentElement || el) : el,
                start: range?.start ?? "top bottom",
                end: range?.end ?? "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
          // Measured as a full refresh measures them (nested drifts: the gallery's photos in its drifting
          // columns), whichever of this runtime and its ancestors' or descendants' runtimes mounts first.
          measureAtStart([tween.scrollTrigger!]);
          measureAtStart(triggersWithin(el));
          return tween;
        });
        return whenNear(el, () => init());
      });
    },
    { scope: target, dependencies: [speed, fromY, toY, fromScale, toScale, range?.start, range?.end, range?.closest, media], revertOnUpdate: true },
  );

  return null;
}
