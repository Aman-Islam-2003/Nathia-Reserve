"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { CursorTiming } from "../Cursor";
import { useRuntimeMotion } from "./shared";

/** Interactive elements the cursor hides over, unless they set their own data-cursor. */
const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, summary";

/** The cursor's motion (loaded after first paint). Renders nothing. */
export default function CursorMotion({
  root,
  dot,
  ring,
  label,
  timing,
}: {
  root: RefObject<HTMLDivElement | null>;
  dot: RefObject<HTMLDivElement | null>;
  ring: RefObject<HTMLDivElement | null>;
  label: RefObject<HTMLSpanElement | null>;
  timing: CursorTiming;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !dot.current || !ring.current) return;
      const mm = gsap.matchMedia();
      mm.add({ hover: "(hover: hover) and (pointer: fine)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { hover, reduce } = ctx.conditions as { hover: boolean; reduce: boolean };
        if (!hover) return;
        const t = (s: number) => (reduce ? 0 : s);
        const toX = gsap.quickTo(el, "x", { duration: t(timing.follow), ease: "power3.out" });
        const toY = gsap.quickTo(el, "y", { duration: t(timing.follow), ease: "power3.out" });
        let state: string | null = null;
        let shown = false;

        const move = (e: PointerEvent) => {
          if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
          if (!shown) {
            // First move: jump to the pointer, then follow.
            shown = true;
            gsap.set(el, { x: e.clientX, y: e.clientY, autoAlpha: 1 });
          }
          toX(e.clientX);
          toY(e.clientY);
          const target = e.target instanceof Element ? e.target : null;
          const marked = target?.closest<HTMLElement>("[data-cursor]");
          const next = marked ? (marked.dataset.cursor ?? "") : target?.closest(INTERACTIVE) ? "hide" : "";
          if (next === state) return;
          state = next;
          if (next && next !== "hide") {
            if (label.current) label.current.textContent = next;
            gsap.to(ring.current, { scale: 1, duration: t(timing.ringIn), ease: motion.ease });
            gsap.to(dot.current, { scale: 0, duration: t(timing.dot) });
          } else {
            gsap.to(ring.current, { scale: 0, duration: t(timing.ringOut), ease: motion.ease });
            gsap.to(dot.current, { scale: next === "hide" ? 0 : 1, duration: t(timing.dot) });
          }
        };
        const leave = () => gsap.to(el, { autoAlpha: 0, duration: t(timing.fade) });
        const enter = () => shown && gsap.to(el, { autoAlpha: 1, duration: t(timing.fade) });
        window.addEventListener("pointermove", move, { passive: true });
        document.documentElement.addEventListener("pointerleave", leave);
        document.documentElement.addEventListener("pointerenter", enter);
        return () => {
          window.removeEventListener("pointermove", move);
          document.documentElement.removeEventListener("pointerleave", leave);
          document.documentElement.removeEventListener("pointerenter", enter);
        };
      });
    },
    { scope: root, dependencies: [motion, timing.follow, timing.ringIn, timing.ringOut, timing.dot, timing.fade], revertOnUpdate: true },
  );

  return null;
}
