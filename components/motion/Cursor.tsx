"use client";

import { useRef } from "react";
import { lazyMotion } from "./lazy";

// Following the pointer (GSAP) loads after first paint; until then only the native cursor shows.
const CursorMotion = lazyMotion(() => import("./runtime/Cursor"));

export interface CursorTiming {
  /** Seconds the cursor takes to catch the pointer. */
  follow: number;
  /** Ring growing in with its label, and shrinking away. */
  ringIn: number;
  ringOut: number;
  /** Dot shrinking or returning. */
  dot: number;
  /** Fade when the pointer leaves or re-enters the page. */
  fade: number;
}

/**
 * A custom cursor on top of the native one: a dot that follows the pointer, and a ring with a label over
 * elements marked `data-cursor="<label>"` ("View", "Explore"). Over links and buttons (or `data-cursor="hide"`)
 * both hide; `data-cursor=""` keeps the plain dot. Fine pointers that can hover only: not rendered for touch.
 * Reduced motion: it follows without easing. Mount once per page (fixed, above the content).
 */
export function Cursor({
  timing,
  className = "",
  dotClassName,
  ringClassName,
}: {
  timing: CursorTiming;
  /** The fixed layer (z-index). */
  className?: string;
  /** Size, colour and centring of the dot (it is placed at the pointer by its top-left corner). */
  dotClassName: string;
  /** Size, colour, centring and label type of the ring. */
  ringClassName: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  return (
    <div
      ref={root}
      aria-hidden
      data-cursor-root
      data-print="hide"
      // Hidden until the runtime places it at the pointer; never shown on touch-only devices.
      className={`pointer-events-none fixed top-0 left-0 invisible [@media(hover:none)]:hidden ${className}`.trim()}
    >
      <div ref={dot} className={`absolute ${dotClassName}`} />
      {/* Starts at scale 0 inline (not a Tailwind scale class, which would stack with GSAP's transform). */}
      <div ref={ring} className={`absolute grid place-items-center ${ringClassName}`} style={{ transform: "scale(0)" }}>
        <span ref={label} />
      </div>
      <CursorMotion root={root} dot={dot} ring={ring} label={label} timing={timing} />
    </div>
  );
}
