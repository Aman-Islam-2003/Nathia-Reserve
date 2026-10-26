"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { whenNear } from "../shared";
import type { MarqueeHolds } from "../Marquee";
import { useRuntimeMotion } from "./shared";

/** Marquee's loop (loaded after first paint). Renders nothing; moves `track` inside `root`. */
export default function MarqueeMotion({
  root,
  track,
  holds,
  sync,
  speed,
  loop,
  direction,
  repeats,
  pauseOffscreen,
}: {
  root: RefObject<HTMLDivElement | null>;
  track: RefObject<HTMLDivElement | null>;
  holds: RefObject<MarqueeHolds>;
  /** Set to the function that applies `holds`; the shell calls it when the user toggles Pause. */
  sync: RefObject<() => void>;
  speed: number;
  loop: number | undefined;
  direction: "left" | "right";
  repeats: number;
  pauseOffscreen: boolean;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = track.current;
      const container = root.current;
      if (!el || !container) return;
      const pxPerSecond = speed / motion.durationScale;
      const loopDuration = () => loop ?? el.scrollWidth / 2 / pxPerSecond;
      const mm = gsap.matchMedia();

      // Reduced motion: no branch, the track sits still and the overflow is clipped.
      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        let teardown = () => {};
        // Lazy: build the loop only when the marquee is about a viewport away.
        const init = ctx.add("init", () => {
          const [from, to] = direction === "left" ? [0, -50] : [-50, 0];
          const tween = gsap.fromTo(
            el,
            { xPercent: from },
            // Linear: a constant-speed loop; any ease would stutter at the seam.
            { xPercent: to, duration: loopDuration(), ease: "none", repeat: -1, paused: true },
          );

          // Plays only while nothing holds it: user pause, hover, focus inside, or off-screen.
          const update = () => {
            const h = holds.current;
            if (h.user || h.hover || h.focus || h.offscreen) tween.pause();
            else tween.play();
          };
          sync.current = update;

          ScrollTrigger.create({
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => {
              holds.current.offscreen = pauseOffscreen && !self.isActive;
              update();
            },
            // Content width can change with fluid type; keep the speed constant.
            onRefresh: () => tween.duration(loopDuration()),
          });

          const hold = (key: "hover" | "focus", on: boolean) => () => {
            holds.current[key] = on;
            update();
          };
          const enter = hold("hover", true), leave = hold("hover", false);
          const focusIn = hold("focus", true);
          const focusOut = (e: FocusEvent) => {
            if (!container.contains(e.relatedTarget as Node | null)) hold("focus", false)();
          };
          container.addEventListener("pointerenter", enter);
          container.addEventListener("pointerleave", leave);
          container.addEventListener("focusin", focusIn);
          container.addEventListener("focusout", focusOut);
          update();
          teardown = () => {
            sync.current = () => {};
            container.removeEventListener("pointerenter", enter);
            container.removeEventListener("pointerleave", leave);
            container.removeEventListener("focusin", focusIn);
            container.removeEventListener("focusout", focusOut);
          };
        });
        const stop = whenNear(container, () => init());
        return () => {
          stop();
          teardown();
        };
      });
    },
    { scope: root, dependencies: [motion, speed, loop, direction, repeats, pauseOffscreen], revertOnUpdate: true },
  );

  return null;
}
