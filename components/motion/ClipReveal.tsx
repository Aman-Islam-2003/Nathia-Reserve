"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { revealFallback, type DurKey } from "./shared";
import { lazyMotion } from "./lazy";

// The animation (GSAP) loads after first paint.
const ClipRevealMotion = lazyMotion(() => import("./runtime/ClipReveal"), { near: true });

/** Scroll-linked variant: the clip opens between two ScrollTrigger positions instead of playing once. */
export interface ClipScrub {
  start: string;
  end: string;
  /** ScrollTrigger scrub: true, or seconds of catch-up (≤ 1, CLAUDE.md §4.2). */
  smooth: true | number;
}

/**
 * Opens its content from a smaller clip frame on enter, optionally settling an inner zoom. With `scrub`, the
 * clip follows the scroll instead (both ways); it is never hidden then, so before its runtime loads (and with
 * reduced motion) the frame simply shows in full.
 */
export function ClipReveal({
  from = "inset(16% 12% 16% 12%)",
  to = "inset(0% 0% 0% 0%)",
  scale = 1.15,
  duration = "slow",
  scaleDuration,
  ease = "soft",
  fade = true,
  at = 0.85,
  scrub,
  className = "",
  children,
}: {
  /** Starting clip-path inset */
  from?: string;
  /** Final clip-path (e.g. with a corner radius: "inset(0% 0% 0% 0% round 4px)"). */
  to?: string;
  /** Inner content starts at this scale and settles to 1. `false` to disable. Ignored with `scrub`. */
  scale?: number | false;
  /** A duration token, or seconds for a measured value. */
  duration?: DurKey | number;
  /** Duration of the inner settle, when it differs from the clip's. */
  scaleDuration?: DurKey | number;
  /** The clip's ease: the soft ease, or the theme's in-out ease for a curtain. */
  ease?: "soft" | "inOut";
  /** Fade in with the clip (default). `false` when the clip alone reveals it (a curtain from fully closed). */
  fade?: boolean;
  /** Plays when the top of the element crosses this fraction of the viewport height. */
  at?: number;
  scrub?: ClipScrub;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  // Shows the content as is if it comes on screen before the runtime has set it up.
  const scrubbed = Boolean(scrub);
  useEffect(() => {
    if (!scrubbed) return revealFallback(ref.current!);
  }, [scrubbed]);

  return (
    <div ref={ref} data-reveal={scrubbed ? undefined : true} className={`overflow-hidden ${className}`.trim()}>
      {/* Positioned so a next/image `fill` child has a valid containing parent. */}
      <div ref={inner} className="relative size-full">
        {children}
      </div>
      <ClipRevealMotion
        target={ref}
        inner={inner}
        from={from}
        to={to}
        scale={scale}
        duration={duration}
        scaleDuration={scaleDuration}
        ease={ease}
        fade={fade}
        at={at}
        scrub={scrub}
      />
    </div>
  );
}
