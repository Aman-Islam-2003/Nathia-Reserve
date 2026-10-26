"use client";

import { useRef, type ReactNode } from "react";
import { lazyMotion } from "./lazy";

// The curtain (GSAP) loads after first paint; until then (and with reduced motion) links navigate normally.
const PageTransitionMotion = lazyMotion(() => import("./runtime/PageTransition"));

export interface CurtainTiming {
  /** Curtain closing over the page, then the mark fading up (starting `markOverlap` before the close ends). */
  cover: number;
  markIn: number;
  markOverlap: number;
  /** Wait after the new page renders, before revealing it. */
  settle: number;
  /** Mark fading, then the curtain lifting away (starting `revealOverlap` before the mark is gone). */
  markOut: number;
  reveal: number;
  revealOverlap: number;
}

/**
 * Curtain between routes: a click on an internal link to another page closes a full-screen panel from the
 * bottom (with an optional mark), navigates, then lifts the panel off the top once the new page has rendered
 * (scrolled to the top, or to the link's #anchor). Same-page links, new-tab and modified clicks, external links
 * and browser back/forward are left alone. Reduced motion: no curtain. Mount once, in a layout that persists
 * across the routes it covers.
 */
export function PageTransition({ timing, className, children }: { timing: CurtainTiming; className: string; children?: ReactNode }) {
  const curtain = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={curtain}
      aria-hidden
      data-print="hide"
      // Closed below the viewport until a transition runs.
      className={`pointer-events-none fixed inset-0 grid place-items-center ${className}`}
      style={{ clipPath: "inset(100% 0% 0% 0%)" }}
    >
      {children && (
        <span data-curtain-mark className="invisible opacity-0">
          {children}
        </span>
      )}
      <PageTransitionMotion curtain={curtain} timing={timing} />
    </div>
  );
}
