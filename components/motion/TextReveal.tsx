"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { revealFallback, type DurKey } from "./shared";
import { lazyMotion } from "./lazy";

type Tag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
export type Split = "lines" | "words" | "chars";

// The animation (GSAP + SplitText) loads after first paint; the text itself is server-rendered.
const TextRevealMotion = lazyMotion(() => import("./runtime/TextReveal"), { near: true });

/** Line/word/char reveal on enter. Children must be plain text (SplitText rewrites the DOM). */
export function TextReveal({
  as: Tag = "p",
  split = "lines",
  duration = "base",
  stagger,
  className,
  children,
}: {
  as?: Tag;
  split?: Split;
  duration?: DurKey;
  /** Seconds between units. Defaults to the theme's stagger for the split type. */
  stagger?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  // Shows the text as is if it comes on screen before the runtime has set it up.
  useEffect(() => revealFallback(ref.current!), []);

  return (
    <>
      {/* @ts-expect-error -- ref typed as HTMLElement covers every Tag; TS can't narrow the union */}
      <Tag ref={ref} data-reveal className={className}>
        {children}
      </Tag>
      <TextRevealMotion target={ref} split={split} duration={duration} stagger={stagger} />
    </>
  );
}
