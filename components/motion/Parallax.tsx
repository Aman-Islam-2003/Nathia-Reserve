"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/** Oversized image drifts slower than the page inside a clipped frame. */
export function Parallax({ src, alt, className, amount = 12, sizes = "100vw" }: { src: string; alt: string; className?: string; amount?: number; sizes?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.fromTo(ref.current.querySelector(".parallax__inner"), { yPercent: -amount }, {
      yPercent: amount, ease: "none",
      scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
    });
  }, { scope: ref });
  return (
    <div ref={ref} className={`parallax ${className ?? ""}`}>
      <div className="parallax__inner"><Image src={src} alt={alt} fill sizes={sizes} /></div>
    </div>
  );
}
