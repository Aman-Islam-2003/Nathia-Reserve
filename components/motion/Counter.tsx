"use client";

import { useEffect, useMemo, useRef } from "react";
import { revealFallback, type DurKey } from "./shared";
import { lazyMotion } from "./lazy";

// The count-up (GSAP) loads after first paint; the final value is server-rendered.
const CounterMotion = lazyMotion(() => import("./runtime/Counter"), { near: true });

type Format = "number" | "compact" | Intl.NumberFormatOptions;

const decimalsOf = (n: number) => n.toString().split(".")[1]?.length ?? 0;

function formatOptions(format: Format, to: number): Intl.NumberFormatOptions {
  if (format === "compact") return { notation: "compact" };
  // Fixed decimals so the in-between values don't flicker extra digits.
  if (format === "number") {
    const d = decimalsOf(to);
    return { minimumFractionDigits: d, maximumFractionDigits: d };
  }
  return format;
}

/**
 * Counts up to `to` on enter. The final value is server-rendered (SEO, no-JS, reduced motion);
 * the width is reserved for the widest value so nothing shifts while counting.
 */
export function Counter({
  to,
  from = 0,
  prefix = "",
  suffix = "",
  format = "number",
  // Fixed so server and client format identically (no hydration mismatch).
  locale = "en-US",
  duration = "slow",
  liningNums = true,
  animate = true,
  className = "",
}: {
  to: number;
  from?: number;
  prefix?: string;
  suffix?: string;
  format?: Format;
  locale?: string;
  duration?: DurKey;
  /** Lining figures (cap-height, on the baseline). Set false to keep the font's default, e.g. old-style. */
  liningNums?: boolean;
  /** false = render the final value only: no counting, no reveal (e.g. prices). */
  animate?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const value = useRef<HTMLSpanElement>(null);
  // Shows the final value as is if it comes on screen before the runtime has set it up.
  useEffect(() => {
    if (animate) return revealFallback(ref.current!);
  }, [animate]);

  const formatKey = JSON.stringify(format);
  const text = useMemo(() => {
    const nf = new Intl.NumberFormat(locale, formatOptions(JSON.parse(formatKey), to));
    return (n: number) => `${prefix}${nf.format(n)}${suffix}`;
  }, [locale, formatKey, to, prefix, suffix]);

  return (
    <span ref={ref} data-reveal={animate || undefined} className={`inline-grid tabular-nums ${liningNums ? "lining-nums" : ""} ${className}`.trim()}>
      <span className="sr-only">{text(to)}</span>
      {/* Width reservers: the cell sizes to the wider of the start and end values. */}
      <span aria-hidden className="invisible [grid-area:1/1]">{text(from)}</span>
      <span aria-hidden data-counter-final className="invisible [grid-area:1/1]">{text(to)}</span>
      <span ref={value} aria-hidden data-counter-live className="[grid-area:1/1]">
        {text(to)}
      </span>
      {animate && <CounterMotion target={ref} value={value} text={text} from={from} to={to} duration={duration} />}
    </span>
  );
}
