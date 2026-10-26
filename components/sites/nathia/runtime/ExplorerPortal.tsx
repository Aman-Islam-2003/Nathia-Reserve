"use client";

import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { whenNear } from "@/components/motion/shared";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOBILE_QUERY, portalTiming } from "../tokens";

/**
 * The explorer portal's scroll timeline (loaded after first paint): one scrubbed timeline (scrub .8) over the
 * pin (2.2 viewports, 1.6 on mobile), every point measured on live [ExplorerPortal]:
 * - 0: heading lines rise from yPercent 110 (.18, stagger .05, power3.out) · .08 body fades up 16px (.12)
 * - .3: the window opens from its rounded frame to full screen (.55, power2.inOut); its poster settles from
 *   scale 1.25 (.6, power2.out)
 * - .42 copy leaves (up 40px, .15, power2.in) · .72 veil in (.2) · .78 Enter pops in from .9 (.15, back.out(1.6))
 * Reduced motion: no timeline (the markup's full poster, copy and button).
 */
export default function ExplorerPortalMotion({ sceneId }: { sceneId: string }) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      // Runtimes mount one commit after their markup (lazyMotion), so the scene is in the DOM by now.
      const s = document.getElementById(sceneId);
      if (!s) return;
      const q = (sel: string) => s.querySelector<HTMLElement>(sel);
      const mm = gsap.matchMedia();

      mm.add({ full: "(prefers-reduced-motion: no-preference)", mobile: MOBILE_QUERY }, (ctx) => {
        const { full, mobile } = ctx.conditions as { full: boolean; mobile: boolean };
        if (!full) return;
        // Set up when the scene is about a viewport away (whenNear), not at page load: the timeline only
        // reads layout and writes styles, and the pin's scroll length is reserved in the HTML (PinnedSection).
        let cleanup: (() => void) | undefined;
        const init = ctx.add("init", () => {
          const win = q("[data-xp-window]");
          const lines = s.querySelectorAll("[data-xp-line]");
          gsap.set(lines, { yPercent: 110 });

          gsap
            .timeline({
              defaults: { ease: "none" },
              // The scene root is the pin track: top top → bottom bottom is the pinned range.
              scrollTrigger: { trigger: s, start: "top top", end: "bottom bottom", scrub: portalTiming.scrub },
            })
            .to({}, { duration: 1 }, 0) // the timeline spans exactly 0 → 1
            .to(lines, { yPercent: 0, stagger: 0.05, duration: 0.18, ease: "power3.out" }, 0)
            .fromTo(q("[data-xp-body]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.08)
            .fromTo(
              win,
              { clipPath: mobile ? portalTiming.windowFrom.mobile : portalTiming.windowFrom.desktop },
              { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.55, ease: "power2.inOut" },
              0.3,
            )
            .fromTo(win?.querySelector("img") ?? null, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: "power2.out" }, 0.3)
            .to(q("[data-xp-copy]"), { autoAlpha: 0, y: -40, duration: 0.15, ease: "power2.in" }, 0.42)
            .fromTo(q("[data-xp-enter]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.15, ease: "back.out(1.6)" }, 0.78)
            .fromTo(q("[data-xp-veil]"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.72);
        });
        const stop = whenNear(s, () => init());
        return () => {
          stop();
          cleanup?.();
        };
      });
    },
    { dependencies: [sceneId, motion], revertOnUpdate: true },
  );

  return null;
}
