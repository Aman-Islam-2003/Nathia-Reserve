"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { whenNear } from "../shared";

/**
 * PinnedSection's progress (loaded after first paint). The pin itself is CSS (sticky stage in a reserved
 * track); this only writes `--pin-progress` (0 → 1) on the stage, set up when the section is about a viewport
 * away. Renders nothing.
 */
export default function PinnedSectionMotion({ target }: { target: RefObject<HTMLDivElement | null> }) {
  useGSAP(
    () => {
      const el = target.current;
      const track = el?.parentElement;
      if (!el || !track) return;
      const mm = gsap.matchMedia();

      // Reduced motion: no pin, so no progress.
      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        const write = (p: number) => el.style.setProperty("--pin-progress", p.toFixed(4));
        const init = ctx.add("init", () =>
          ScrollTrigger.create({
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => write(self.progress),
            onRefresh: (self) => write(self.progress),
          }),
        );
        const stop = whenNear(track, () => init());
        return () => {
          stop();
          el.style.removeProperty("--pin-progress");
        };
      });
    },
    { scope: target },
  );

  return null;
}
