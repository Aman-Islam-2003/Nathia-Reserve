"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { lazyMotion } from "./lazy";
import { revealFallback, type DurKey } from "./shared";

// The animation (GSAP) loads after first paint.
const RevealMotion = lazyMotion(() => import("./runtime/Reveal"), { near: true });

/**
 * Fades its content in while it moves into place, once, on enter. For supporting elements (body copy,
 * captions, links, list rows); headings use TextReveal or RiseLines. Rises by the theme's revealDistance
 * unless `y`/`x` say otherwise. With `stagger`, its children reveal one after another instead (a list's rows).
 */
export function Reveal({
  as: Tag = "div",
  x,
  y,
  yPercent,
  stagger,
  duration = "base",
  at = 0.85,
  trigger,
  delay,
  className,
  children,
}: {
  as?: ElementType;
  /** Horizontal travel in px (e.g. -16: slides in from the left). Default 0. */
  x?: number;
  /** Rise distance in px. Default: the theme's revealDistance (0 when only `x` is given). */
  y?: number;
  /** Rise as a share of each unit's own height (e.g. 14: from 14% below), instead of `y`. */
  yPercent?: number;
  /** Seconds between children: reveals the children in turn instead of the element as a whole. */
  stagger?: number;
  /** A duration token, or seconds for a measured value (say where it was measured). */
  duration?: DurKey | number;
  /** Plays when the top of the element crosses this fraction of the viewport height. */
  at?: number;
  /**
   * A selector for the ancestor whose top crossing `at` starts it (default: the element itself). With `delay`,
   * several elements reveal in turn from one trigger (live's staggered fades across a section).
   */
  trigger?: string;
  /** Seconds after the trigger. */
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  // Shows the content as is if it comes on screen before the runtime has set it up.
  useEffect(() => revealFallback(ref.current!), []);

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
      <RevealMotion target={ref} x={x} y={y} yPercent={yPercent} stagger={stagger} duration={duration} at={at} trigger={trigger} delay={delay} />
    </Tag>
  );
}
