"use client";

import type { RefObject } from "react";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { gsap, useGSAP } from "@/lib/gsap";
import type { NathiaMenuFx } from "../NathiaHeader";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Nathia menu motion (loaded after first paint), measured on the live menu:
 * - curtain: clip-path inset(0 0 100% 0) → inset(0), 0.95 s, ease "reserve" (theme easeInOut, durations.curtain)
 * - numbers and titles rise from yPercent 110, 1 s, stagger 0.05, ease "reserveOut", starting 0.45 s before
 *   the curtain ends
 * - sub-labels, explorer pill and footer columns fade up from y 14, 0.8 s, stagger 0.06
 * - closing: the opening plays backwards at 1.6× (links drop, fades go, the curtain lifts to the top)
 * Reduced motion: a plain fade. Renders nothing; hands the handlers to the header through onReady.
 */
export default function NathiaMenuMotion({ root, onReady }: { root: RefObject<HTMLDivElement | null>; onReady: (fx: NathiaMenuFx) => void }) {
  const motion = useRuntimeMotion();

  useGSAP(
    (_, contextSafe) => {
      const safe = contextSafe!;
      const dialog = () => root.current?.querySelector("dialog") ?? null;
      const reduced = () => window.matchMedia(REDUCED).matches;
      // The last opening, reversed to close.
      let opening: gsap.core.Timeline | null = null;
      const fx: NathiaMenuFx = {
        enter: safe(() => {
          const d = dialog();
          if (!d) return;
          if (reduced()) {
            gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: motion.durations.fade, ease: motion.easeSoft });
            return;
          }
          const tl = gsap.timeline();
          opening = tl;
          tl.fromTo(d, { clipPath: "inset(0% 0% 100% 0%)", opacity: 1 }, { clipPath: "inset(0% 0% 0% 0%)", duration: motion.durations.curtain, ease: motion.easeInOut });
          tl.fromTo(
            d.querySelectorAll("[data-menu-rise]"),
            { yPercent: 110 },
            { yPercent: 0, duration: motion.durations.default, stagger: 0.05, ease: motion.ease },
            `-=${0.45}`,
          );
          tl.fromTo(
            d.querySelectorAll("[data-menu-fade]"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: motion.easeSoft },
            "-=0.8",
          );
        }),
        exit: safe(() => {
          const d = dialog();
          if (!d) return;
          if (reduced() || !opening) return gsap.to(d, { opacity: 0, duration: motion.durations.fade, ease: motion.easeSoft });
          const tl = opening;
          opening = null;
          return new Promise<void>((resolve) => {
            tl.eventCallback("onReverseComplete", () => resolve());
            tl.timeScale(1.6).reverse();
          });
        }),
      };
      onReady(fx);
      return () => onReady({});
    },
    { scope: root, dependencies: [motion], revertOnUpdate: true },
  );

  return null;
}
