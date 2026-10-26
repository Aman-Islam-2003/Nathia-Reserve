"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Magnetic's pull (loaded after first paint). Renders nothing; moves `target`. */
export default function MagneticMotion({
  target,
  strength,
  duration,
  ease,
}: {
  target: RefObject<HTMLSpanElement | null>;
  strength: number;
  duration: number;
  ease: string;
}) {
  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      // Hover-capable pointers and full motion only; otherwise the content never moves.
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const toX = gsap.quickTo(el, "x", { duration, ease });
        const toY = gsap.quickTo(el, "y", { duration, ease });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          toX((e.clientX - (r.left + r.width / 2)) * strength);
          toY((e.clientY - (r.top + r.height / 2)) * strength);
        };
        const leave = () => {
          toX(0);
          toY(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
          gsap.set(el, { x: 0, y: 0 });
        };
      });
    },
    { scope: target, dependencies: [strength, duration, ease], revertOnUpdate: true },
  );

  return null;
}
