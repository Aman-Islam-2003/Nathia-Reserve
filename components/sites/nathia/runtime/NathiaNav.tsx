"use client";

import type { RefObject } from "react";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Hides the Nathia header while scrolling down and brings it back on the way up, as the live nav does
 * [.nav.is-hidden: translateY(-110%) once scrolled past 240px, ignoring moves under 6px; transform .8s ease-out].
 * ScrollTrigger instead of a scroll listener (CLAUDE.md §1). Reduced motion: the header never moves.
 * Renders nothing.
 */
export default function NathiaNavMotion({ header }: { header: RefObject<HTMLElement | null> }) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = header.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let hidden = false;
        let last = window.scrollY;
        let refreshing = false;
        const set = (hide: boolean) => {
          if (hide === hidden) return;
          hidden = hide;
          gsap.to(el, { yPercent: hide ? -110 : 0, duration: motion.durations.default * 0.8, ease: motion.ease, overwrite: true });
        };
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            // A refresh (e.g. a content-visibility section rendering for the first time) measures with the
            // scroll reset: not a scroll up. The position is resynced after it (below).
            if (refreshing) return;
            const y = self.scroll();
            if (Math.abs(y - last) <= 6) return;
            set(y > last && y > 240);
            last = y;
          },
        });
        const startRefresh = () => {
          refreshing = true;
        };
        const resync = () => {
          refreshing = false;
          last = window.scrollY;
        };
        ScrollTrigger.addEventListener("refreshInit", startRefresh);
        ScrollTrigger.addEventListener("refresh", resync);
        // Keyboard: focus moving into the header brings it back.
        const show = () => set(false);
        el.addEventListener("focusin", show);
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", startRefresh);
          ScrollTrigger.removeEventListener("refresh", resync);
          el.removeEventListener("focusin", show);
        };
      });
    },
    { dependencies: [motion], revertOnUpdate: true },
  );

  return null;
}
