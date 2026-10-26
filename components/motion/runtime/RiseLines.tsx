"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { REVEAL_TOGGLE, whenNear, type DurKey } from "../shared";
import { useRuntimeMotion } from "./shared";

/** RiseLines' animation (loaded after first paint). Renders nothing; animates the lines of `target`. */
export default function RiseLinesMotion({
  target,
  trigger,
  at,
  stagger,
  duration,
}: {
  target: RefObject<HTMLElement | null>;
  trigger: string;
  at: number;
  stagger: number;
  duration: DurKey | number;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      // Reduced motion: no branch, the lines stay in place.
      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        // Lazy: set up about a viewport ahead, so the lines are lowered before they can be seen.
        const init = ctx.add("init", () => {
          const lines = el.querySelectorAll("[data-rise-line]");
          const from = trigger === "self" ? el : (el.closest(trigger) ?? el);
          gsap.fromTo(
            lines,
            { yPercent: 110 },
            {
              yPercent: 0,
              stagger,
              duration: typeof duration === "number" ? duration : motion.dur[duration],
              ease: motion.ease,
              // Already past the line when set up (a jump down the page): plays at once.
              scrollTrigger: { trigger: from, start: `top ${Math.round(at * 100)}%`, toggleActions: REVEAL_TOGGLE },
            },
          );
        });
        return whenNear(el, () => init());
      });
    },
    { scope: target, dependencies: [motion, trigger, at, stagger, duration], revertOnUpdate: true },
  );

  return null;
}
