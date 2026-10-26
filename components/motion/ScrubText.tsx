"use client";

import { Fragment, useRef, type ElementType, type ReactNode } from "react";
import { lazyMotion } from "./lazy";

// The scroll link (GSAP) loads after first paint; until then every word is at full strength.
const ScrubTextMotion = lazyMotion(() => import("./runtime/ScrubText"), { near: true });

/** Words keep their spaces as text nodes, so wrapping and copy-paste stay natural. */
function words(text: string) {
  return text.split(/(\s+)/).map((part, i) => (/^\s+$/.test(part) || !part ? part : <span key={i} data-scrub-word>{part}</span>));
}

/**
 * Text whose words brighten one after another as it crosses the viewport, tied to the scroll (scrubbed both
 * ways). Words start at `dim` opacity; the sweep runs from `start` to `end` (ScrollTrigger positions of the
 * element). Give `text`, or `lines` to set each line as a block (as the design breaks them); `before`/`after`
 * render around the words at full strength (quotation marks). Reduced motion: static, fully visible.
 */
export function ScrubText({
  text,
  lines,
  before,
  after,
  as: Tag = "p",
  dim = 0.16,
  stagger = 0.08,
  start = "top 80%",
  end = "bottom 50%",
  className,
  lineClassName,
}: {
  text?: string;
  lines?: string[];
  before?: ReactNode;
  after?: ReactNode;
  as?: ElementType;
  /** Opacity of a word before the sweep reaches it. */
  dim?: number;
  /** Offset between words, as a share of one word's fade (ScrollTrigger stagger in a scrubbed tween). */
  stagger?: number;
  start?: string;
  end?: string;
  className?: string;
  lineClassName?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  return (
    <Tag ref={ref} className={className}>
      {before}
      {lines
        ? lines.map((line, i) => (
            // A space between the line blocks (it doesn't render), so the text reads and copies as words.
            <Fragment key={i}>
              {i > 0 && " "}
              <span className={lineClassName ?? "block"}>
                {words(line)}
                {i === lines.length - 1 && after}
              </span>
            </Fragment>
          ))
        : (
            <>
              {words(text ?? "")}
              {after}
            </>
          )}
      <ScrubTextMotion target={ref} dim={dim} stagger={stagger} start={start} end={end} />
    </Tag>
  );
}
