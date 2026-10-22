"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Custom cursor (mouse only): a small dot that trails the pointer slightly,
 * and a ring with a label that grows over anything with data-cursor="Label".
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches || prefersReducedMotion()) return;
    const el = root.current!;
    document.documentElement.classList.add("has-cursor");
    gsap.set(ring.current, { scale: 0 });

    // quickTo = one reusable tween per axis: much smoother than setting x/y on every event
    const x = gsap.quickTo(el, "x", { duration: 0.18, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.18, ease: "power3.out" });

    let current = "";
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      const text = target?.dataset.cursor ?? "";
      if (text === current) return;
      current = text;
      if (text) {
        if (label.current) label.current.textContent = text;
        gsap.to(ring.current, { scale: 1, duration: 0.6, ease: "expo.out" });
        gsap.to(dot.current, { scale: 0, duration: 0.3 });
      } else {
        gsap.to(ring.current, { scale: 0, duration: 0.45, ease: "expo.out" });
        gsap.to(dot.current, { scale: 1, duration: 0.3 });
      }
    };
    const hide = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    const show = () => gsap.to(el, { autoAlpha: 1, duration: 0.3 });

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    document.documentElement.addEventListener("pointerenter", show);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.documentElement.removeEventListener("pointerenter", show);
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <div ref={dot} className="cursor__dot" />
      <div ref={ring} className="cursor__ring"><span ref={label} /></div>
    </div>
  );
}
