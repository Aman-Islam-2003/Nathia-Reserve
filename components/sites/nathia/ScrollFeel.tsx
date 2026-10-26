"use client";

import { useEffect } from "react";
import { getLenis } from "@/components/providers/lenis-store";
import { useLenis } from "@/components/providers/SmoothScroll";
import { scrollFeel } from "./tokens";

type Tunable = { options: { lerp?: number; wheelMultiplier?: number }; virtualScroll?: { options: { wheelMultiplier?: number } } };

/**
 * Live's smooth-scroll feel on /nathia routes (tokens.scrollFeel: lerp .085, wheel ×.95), applied to the app's
 * single Lenis instance while these routes are mounted and restored when leaving them. Lenis reads `lerp` on
 * every scroll; the wheel multiplier lives in its wheel handler's own options. Also, as live, the browser's scroll
 * restoration is off: every visit starts at the top under the preloader (or at its #anchor). Renders nothing.
 */
export function ScrollFeel() {
  useEffect(() => {
    if (!("scrollRestoration" in history)) return;
    const before = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = before;
    };
  }, []);

  // The hook only tells us when the instance exists; it is tuned through getLenis() (not a hook value).
  const ready = useLenis() !== null;

  useEffect(() => {
    const lenis = ready ? (getLenis() as unknown as Tunable | null) : null;
    if (!lenis) return;
    const before = { lerp: lenis.options.lerp, wheel: lenis.virtualScroll?.options.wheelMultiplier };
    lenis.options.lerp = scrollFeel.lerp;
    lenis.options.wheelMultiplier = scrollFeel.wheelMultiplier;
    if (lenis.virtualScroll) lenis.virtualScroll.options.wheelMultiplier = scrollFeel.wheelMultiplier;
    return () => {
      lenis.options.lerp = before.lerp;
      lenis.options.wheelMultiplier = before.wheel;
      if (lenis.virtualScroll) lenis.virtualScroll.options.wheelMultiplier = before.wheel;
    };
  }, [ready]);

  return null;
}
