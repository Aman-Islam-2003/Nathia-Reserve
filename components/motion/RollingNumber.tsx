"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  /** when set, the parent drives progress (0–1) instead of a one-shot scroll trigger */
  progressRef?: React.RefObject<{ set: (p: number) => void } | null>;
};

const DIGITS = "0123456789";
const format = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Odometer counter. Each digit is a column of 0–9 translated into place.
 * Screen readers and search engines get the real number as visually hidden text;
 * the animated columns are aria-hidden so they never read "0123456789".
 */
export function RollingNumber({ value, decimals = 0, suffix = "", className, progressRef }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const finalText = format(value, decimals);

  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const cols = Array.from(root.querySelectorAll<HTMLElement>("[data-col]"));

    const render = (p: number) => {
      const current = format(value * p, decimals).padStart(finalText.length, "0");
      // map each final glyph slot to the current glyph (commas/dots stay fixed)
      let ci = 0;
      for (let i = 0; i < finalText.length; i++) {
        if (!/\d/.test(finalText[i])) continue;
        const d = Number(current[i]) || 0;
        const col = cols[ci++];
        if (col) col.style.transform = `translateY(${-d * 10}%)`;
      }
    };

    if (progressRef) {
      (progressRef as React.MutableRefObject<{ set: (p: number) => void } | null>).current = { set: render };
      render(0);
      return;
    }

    if (prefersReducedMotion()) { render(1); return; }
    render(0);
    const state = { p: 0 };
    ScrollTrigger.create({
      trigger: root,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.to(state, { p: 1, duration: 2.2, ease: "reserve", onUpdate: () => render(state.p) }),
    });
  }, { scope: ref, dependencies: [value] });

  return (
    <span ref={ref} className={`odo ${className ?? ""}`}>
      <span className="sr-only">{`${finalText}${suffix}`}</span>
      <span aria-hidden="true" className="odo__track">
        {finalText.split("").map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="odo__slot">
              <span data-col className="odo__col">
                {DIGITS.split("").map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i} className="odo__sep">{ch}</span>
          ),
        )}
        {suffix && <span className="odo__suffix">{suffix}</span>}
      </span>
    </span>
  );
}
