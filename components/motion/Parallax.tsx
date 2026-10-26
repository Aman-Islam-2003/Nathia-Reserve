"use client";

import { useRef, type ReactNode } from "react";
import { lazyMotion } from "./lazy";

// The scroll link (GSAP) loads after first paint; until then the element sits where layout puts it.
const ParallaxMotion = lazyMotion(() => import("./runtime/Parallax"), { near: true });

/**
 * Vertical parallax while the element crosses the viewport. `speed` is the fraction of half
 * the viewport height it drifts each way: positive moves up as you scroll, negative moves down.
 * Wrap in an overflow-hidden frame if the edges must stay covered. `drift` instead moves it by a share of
 * its own height (yPercent from → to), optionally scaling as it goes (an image settling in its frame).
 */
export function Parallax({
  speed = 0.2,
  drift,
  range,
  media,
  className,
  children,
}: {
  speed?: number;
  /** Percent of its own height, from → to, while it crosses the viewport; `scale` from → to alongside. */
  drift?: { yPercent: [number, number]; scale?: [number, number] };
  /**
   * The scroll range of a drift (ScrollTrigger start/end of its trigger; default "top bottom" → "bottom top",
   * the whole crossing) and the trigger: `closest` names an ancestor (e.g. "footer"), else the parent frame.
   */
  range?: { start: string; end: string; closest?: string };
  /** Only moves while this media query matches (e.g. "(min-width: 900px)" for desktop only). */
  media?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} data-parallax className={className}>
      {children}
      <ParallaxMotion target={ref} speed={speed} drift={drift} range={range} media={media} />
    </div>
  );
}
