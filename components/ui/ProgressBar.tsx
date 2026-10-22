"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.to(ref.current, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
    });
  });
  return <div ref={ref} className="progress" aria-hidden="true" />;
}
