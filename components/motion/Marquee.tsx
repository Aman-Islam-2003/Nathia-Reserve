"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Infinite strip. Items render once for real; the second copy is aria-hidden
 * so assistive tech and crawlers see each item a single time.
 */
export function Marquee({ children, speed = 40, reverse = false, label }: { children: ReactNode; speed?: number; reverse?: boolean; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [paused, setPaused] = useState(false);

  useGSAP(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const track = ref.current.querySelector(".marquee__track") as HTMLElement;
    const half = track.scrollWidth / 2;
    tween.current = gsap.fromTo(track, { x: reverse ? -half : 0 }, { x: reverse ? 0 : -half, duration: half / speed, ease: "none", repeat: -1 });
  }, { scope: ref });

  const toggle = () => {
    if (!tween.current) return;
    paused ? tween.current.play() : tween.current.pause();
    setPaused(!paused);
  };

  return (
    <div ref={ref} className="marquee">
      <div className="marquee__track">
        <div className="marquee__group">{children}</div>
        <div className="marquee__group" aria-hidden="true">{children}</div>
      </div>
      <button type="button" className="marquee__toggle" onClick={toggle} aria-pressed={paused}>
        {paused ? `Play ${label}` : `Pause ${label}`}
      </button>
    </div>
  );
}
