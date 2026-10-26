"use client";

import type { ReactNode } from "react";
import { lazyMotion } from "@/components/motion/lazy";

export { useLenis } from "./lenis-store";

// Lenis, GSAP's ticker hookup and ScrollTrigger refreshes load after first paint (runtime/SmoothScroll):
// native scrolling works until then, and the page's first render doesn't wait for them.
const SmoothScrollRuntime = lazyMotion(() => import("./runtime/SmoothScroll"));

/** Renders the page and, once loaded, the app's single Lenis instance. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SmoothScrollRuntime />
    </>
  );
}
