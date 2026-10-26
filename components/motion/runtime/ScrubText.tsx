"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { whenNear } from "../shared";

/** ScrubText's scroll link (loaded after first paint). Renders nothing; scrubs the words of `target`. */
export default function ScrubTextMotion({
  target,
  dim,
  stagger,
  start,
  end,
}: {
  target: RefObject<HTMLElement | null>;
  dim: number;
  stagger: number;
  start: string;
  end: string;
}) {
  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      // Reduced motion: no branch, the words stay at full strength.
      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        // Lazy: create the trigger only when the text is about a viewport away.
        const init = ctx.add("init", () =>
          gsap.fromTo(
            el.querySelectorAll("[data-scrub-word]"),
            { opacity: dim },
            // Linear: brightness maps 1:1 to scroll.
            { opacity: 1, stagger, ease: "none", scrollTrigger: { trigger: el, start, end, scrub: true } },
          ),
        );
        return whenNear(el, () => init());
      });
    },
    { scope: target, dependencies: [dim, stagger, start, end], revertOnUpdate: true },
  );

  return null;
}
