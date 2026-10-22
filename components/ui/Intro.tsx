"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { site } from "@/content/site";

/** Opening curtain: brand appears, then the panel lifts to reveal the hero. */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) { ref.current.remove(); return; }
    const tl = gsap.timeline({ onComplete: () => ref.current?.remove() });
    tl.from(".intro__word", { yPercent: 110, duration: 1, stagger: 0.08 })
      .to(".intro__word", { yPercent: -110, duration: 0.8, stagger: 0.05, ease: "reserve" }, "+=0.35")
      .to(ref.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "reserve" }, "-=0.4");
  }, { scope: ref });

  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <div className="intro__mask">
        {site.brand.split(" ").map((w) => <span key={w} className="intro__word">{w}</span>)}
      </div>
    </div>
  );
}
