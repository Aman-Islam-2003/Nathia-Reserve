"use client";

import { useEffect, useRef, useState } from "react";
import { SplitReveal } from "@/components/motion/SplitReveal";

/**
 * "The screen is a window": a Three.js room viewed with off-axis projection.
 * Three.js is only downloaded when this section gets close to the viewport.
 */
export function LookInside() {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dispose: (() => void) | undefined;
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      setState("loading");
      try {
        const { mountWindowRoom } = await import("@/components/three/windowRoom");
        dispose = mountWindowRoom(el);
        setState("ready");
      } catch {
        setState("error");
      }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => { io.disconnect(); dispose?.(); };
  }, []);

  return (
    <section id="inside" className="inside section" data-chapter>
      <div className="inside__copy">
        <p className="eyebrow">06 · Look inside</p>
        <SplitReveal as="h2" className="h2">Your screen, <em>a window.</em></SplitReveal>
        <p className="body">Move your mouse, or drag on a phone. The room shifts the way a real room would behind glass.</p>
      </div>
      <div ref={host} className="inside__frame" data-cursor="Look around" aria-label="Interactive 3D view of a residence corridor">
        {state !== "ready" && (
          <p className="inside__status mono">{state === "error" ? "3D view unavailable on this device." : "Loading 3D view…"}</p>
        )}
      </div>
    </section>
  );
}
