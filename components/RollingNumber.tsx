"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  /** when given, the parent drives progress (0–1) instead of a one-shot scroll trigger */
  progressRef?: React.RefObject<{ set: (p: number) => void } | null>;
};

const format = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Odometer counter. Each digit is a 0–9 column (plus a trailing 0 for wrap-around).
 * Digits roll continuously like a car odometer: the last digit spins, the next one
 * only turns as the last passes 9. Screen readers get the real number as hidden text.
 */
export function RollingNumber({ value, decimals = 0, suffix = "", className, progressRef }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const finalText = format(value, decimals);
  const digitCount = finalText.replace(/\D/g, "").length;

  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const cols = Array.from(root.querySelectorAll<HTMLElement>("[data-col]"));
    const scale = 10 ** decimals;

    const render = (p: number) => {
      const v = value * scale * p; // work in whole units (e.g. 2.5 → 25)
      cols.forEach((col, i) => {
        const place = 10 ** (digitCount - 1 - i);
        const whole = Math.floor(v / place);
        const below = v - whole * place; // progress inside this digit's step
        // turn only during the last unit of the lower digits (odometer behaviour)
        const turn = place === 1 ? below : Math.max(0, below - (place - 1));
        const pos = (whole % 10) + turn;
        col.style.transform = `translate3d(0, ${-pos * (100 / 11)}%, 0)`;
      });
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
      onEnter: () => gsap.to(state, { p: 1, duration: 2.4, ease: "power3.out", onUpdate: () => render(state.p) }),
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
                {"01234567890".split("").map((d, k) => <span key={k}>{d}</span>)}
              </span>
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
        {suffix && <span className="odo__suffix">{suffix}</span>}
      </span>
    </span>
  );
}
