"use client";

import { useEffect, useState } from "react";

/** True when the visitor asked the OS for reduced motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Lighter settings on phones: fewer frames, shorter pins. */
export const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
