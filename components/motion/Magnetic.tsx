"use client";

import { useRef, type ReactNode } from "react";
import { lazyMotion } from "./lazy";

// The pull (GSAP) loads after first paint, when near; until then the content simply sits still.
const MagneticMotion = lazyMotion(() => import("./runtime/Magnetic"), { near: true });

/**
 * Pulls its content toward the pointer while it hovers: by `strength` of the pointer's offset from the centre,
 * springing back when it leaves. For pills and buttons. Mouse-type pointers only (no hover on touch), and none
 * with reduced motion. Inline-block, so it wraps its child tightly.
 */
export function Magnetic({
  strength = 0.3,
  duration = 0.8,
  ease = "elastic.out(1, 0.45)",
  className = "",
  children,
}: {
  /** Share of the pointer's offset from the centre the content follows (0–1). */
  strength?: number;
  /** Seconds to follow (and to spring back). */
  duration?: number;
  /** GSAP ease of the follow; a spring by default. */
  ease?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span ref={ref} data-magnetic className={`inline-block ${className}`.trim()}>
      {children}
      <MagneticMotion target={ref} strength={strength} duration={duration} ease={ease} />
    </span>
  );
}
