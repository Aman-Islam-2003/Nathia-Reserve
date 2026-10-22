"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  by?: "lines" | "words" | "chars";
  delay?: number;
  stagger?: number;
  /** start immediately instead of on scroll (e.g. above the fold) */
  immediate?: boolean;
};

/** Text rises line by line (or word/char) from behind a mask. Text stays readable without JS. */
export function SplitReveal({ as: Tag = "div", children, className, by = "lines", delay = 0, stagger, immediate }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const split = SplitText.create(ref.current, {
      type: by === "lines" ? "lines" : `lines,${by}`,
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        const targets = by === "lines" ? self.lines : by === "words" ? self.words : self.chars;
        return gsap.from(targets, {
          yPercent: 110,
          duration: by === "chars" ? 0.9 : 1.2,
          stagger: stagger ?? (by === "chars" ? 0.025 : by === "words" ? 0.05 : 0.09),
          delay,
          scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 85%", once: true },
        });
      },
    });
    return () => split.revert();
  }, { scope: ref });

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
