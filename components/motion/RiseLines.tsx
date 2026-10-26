"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { lazyMotion } from "./lazy";
import type { DurKey } from "./shared";

// The animation (GSAP) loads after first paint; until then (and with reduced motion) the lines simply show.
const RiseLinesMotion = lazyMotion(() => import("./runtime/RiseLines"), { near: true });

/**
 * A heading set as explicit lines (as the design breaks them, not wherever the text wraps), each rising into
 * view from below its own mask, one after another, once. Unlike TextReveal (which splits wherever the text
 * wraps), each `lines` entry is one line; an entry can hold inline emphasis. `trigger: "section"` starts it
 * when the enclosing section, rather than the heading itself, reaches the `at` line; any other string is a
 * selector for the nearest ancestor to start from (e.g. the heading's block). Elements in `lines` need
 * a `key` (the array crosses from server to client components, where React checks list keys).
 */
export function RiseLines({
  as: Tag = "h2",
  lines,
  trigger = "self",
  at = 0.85,
  stagger = 0.1,
  duration = "base",
  className,
  lineClassName = "",
}: {
  as?: ElementType;
  lines: ReactNode[];
  trigger?: string;
  /** Plays when the trigger's top crosses this fraction of the viewport height. */
  at?: number;
  /** Seconds between lines. */
  stagger?: number;
  /** A duration token, or seconds for a measured value. */
  duration?: DurKey | number;
  className?: string;
  lineClassName?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        // The mask: room below for descenders, pulled back so line spacing is unchanged.
        // A space before each later line (whitespace beside a block doesn't render): the text reads as words.
        <span key={i} className="-mb-[0.1em] block overflow-clip pb-[0.1em]">
          {i > 0 && " "}
          <span data-rise-line className={`block ${lineClassName}`.trim()}>
            {line}
          </span>
        </span>
      ))}
      <RiseLinesMotion target={ref} trigger={trigger} at={at} stagger={stagger} duration={duration} />
    </Tag>
  );
}
