"use client";

import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { REVEAL_TOGGLE, whenNear } from "@/components/motion/shared";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Ownership's own motion (loaded after first paint, set up when near), measured on live [Ownership]:
 * - the structure line draws (scaleX 0 → 1) from the block's "top 80%" to "bottom 50%" (scrub .6); each stop
 *   brightens from .25 and rises 14px over "top+40n 78%" → "top+40n+60 60%" (scrub .5)
 * - approval check marks draw in (stroke-dashoffset 1 → 0, .9 s, .15 s apart, ease "reserveOut") at "top 82%"
 * The rest of the scene uses primitives (RiseLines, Reveal, ClipReveal, Parallax). Reduced motion: no
 * branch; the markup's full line and drawn checks.
 */
export default function OwnershipMotion({ sceneId }: { sceneId: string }) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const s = document.getElementById(sceneId);
      if (!s) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        const structure = s.querySelector<HTMLElement>("[data-ow-structure]");
        const approvals = s.querySelector<HTMLElement>("[data-ow-approvals]");
        const stops: (() => void)[] = [];

        const initStructure = ctx.add("structure", () => {
          if (!structure) return;
          gsap.fromTo(
            structure.querySelector("[data-ow-line]"),
            { scaleX: 0 },
            { scaleX: 1, ease: "none", scrollTrigger: { trigger: structure, start: "top 80%", end: "bottom 50%", scrub: 0.6 } },
          );
          gsap.utils.toArray<HTMLElement>("[data-ow-stop]", structure).forEach((stop, i) => {
            gsap.fromTo(
              stop,
              { autoAlpha: 0.25, y: 14 },
              { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: structure, start: `top+=${40 * i} 78%`, end: `top+=${40 * i + 60} 60%`, scrub: 0.5 } },
            );
          });
        });
        const initApprovals = ctx.add("approvals", () => {
          if (!approvals) return;
          gsap.utils.toArray<SVGPathElement>("[data-ow-check]", approvals).forEach((path, i) => {
            gsap.fromTo(
              path,
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: 0.9, delay: 0.15 * i, ease: motion.ease, scrollTrigger: { trigger: approvals, start: "top 82%", toggleActions: REVEAL_TOGGLE } },
            );
          });
        });
        if (structure) stops.push(whenNear(structure, () => initStructure()));
        if (approvals) stops.push(whenNear(approvals, () => initApprovals()));
        return () => stops.forEach((stop) => stop());
      });
    },
    { dependencies: [sceneId, motion], revertOnUpdate: true },
  );

  return null;
}
