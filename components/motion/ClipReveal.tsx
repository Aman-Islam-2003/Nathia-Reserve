"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Props = { src: string; alt: string; className?: string; sizes?: string; priority?: boolean; from?: "bottom" | "center" };

/** Image opens from a slit while the picture inside settles from 1.15× to 1×. */
export function ClipReveal({ src, alt, className, sizes = "100vw", priority, from = "bottom" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const inner = ref.current.querySelector("img");
    const start = from === "bottom" ? "inset(100% 0% 0% 0%)" : "inset(45% 45% 45% 45%)";
    const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } });
    tl.fromTo(ref.current, { clipPath: start }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "reserve" });
    if (inner) tl.fromTo(inner, { scale: 1.15 }, { scale: 1, duration: 1.8 }, 0);
  }, { scope: ref });

  return (
    <div ref={ref} className={`clip ${className ?? ""}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </div>
  );
}
