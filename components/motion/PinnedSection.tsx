"use client";

import { useRef, type CSSProperties, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { lazyMotion } from "./lazy";

// Only the optional --pin-progress variable needs JS (GSAP, loaded after first paint and set up when near); the
// pin itself is CSS, so it works from first paint.
const PinnedSectionMotion = lazyMotion(() => import("./runtime/PinnedSection"), { near: true });

/** Mobile breakpoint for `mobileLength`: the CSS below uses max-[899px] (the Nathia clone and most designs switch at 900px). */
export const PIN_MOBILE_QUERY = "(max-width: 899px)";

/**
 * A full-viewport stage that stays pinned while the page scrolls on for `length` viewport heights, then
 * scrolls away. Total scroll the section takes: one viewport plus the pin, e.g. `length={2.2}` → 3.2 × 100svh.
 *
 * - The pin is CSS, reserved in the server HTML: the root (the track, carrying `id` and the other props) is
 *   (1 + length) viewports tall, and the stage inside it is `position: sticky`. Nothing is inserted or
 *   measured after load, so the page never changes height and scene runtimes can set up lazily.
 * - `className` styles the stage (the visible box). Scene timelines trigger on the root: start "top top",
 *   end "bottom bottom" is exactly the pinned range.
 * - `progress`: scroll progress through the pin is written to the stage as `--pin-progress` (0 → 1, runtime).
 *   Opt-in: an inherited custom property changing every scroll frame restyles everything on the stage (the
 *   Nathia Residences stage, 713 elements: 60–90 ms frames at 4x CPU), so only stages that read it pay for it.
 * - Reduced motion and print: no pin; the stage shows its content at natural height.
 * - The stage is 100vw wide, laid out under a classic scrollbar as a GSAP pin is. The track clips it sideways
 *   (overflow-x: clip, never hidden: hidden makes a scroll container, which breaks sticky), so the page has no
 *   sideways overflow even for scripts and focus scrolling; html clips too, as a safety net.
 * - Render it as a direct child of a block-level parent with no overflow clipping (sticky needs it).
 * - `unit="vw"`: the length is in viewport widths, for a horizontal track whose panels are sized in vw
 *   (HorizontalScroll): its scroll distance follows the width, not the height.
 * - `mobile="stack"`: below 900px there is no pin at all; the stage takes its content's height (a layout that
 *   stacks there, as with reduced motion).
 */
export function PinnedSection({
  as: Tag = "section",
  length,
  mobileLength = length,
  unit = "vh",
  mobile = "pin",
  progress = false,
  className = "",
  children,
  style,
  ...rest
}: {
  as?: "section" | "div";
  /** Pin length in viewport heights on desktop (e.g. 6.4 → pinned for 6.4 × 100svh of scroll). */
  length: number;
  /** Pin length below 900px wide. Shorter on mobile (CLAUDE.md §4.2). */
  mobileLength?: number;
  /** What `length` counts: viewport heights (default) or widths. */
  unit?: "vh" | "vw";
  /** Below 900px: pinned for `mobileLength` (default), or no pin, the stage at its content's height. */
  mobile?: "pin" | "stack";
  /** Write `--pin-progress` (0 → 1) on the stage for CSS to read. */
  progress?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "className" | "children">) {
  const stage = useRef<HTMLDivElement>(null);
  const lengths = { "--pin-len": length, "--pin-len-m": mobileLength } as CSSProperties;

  return (
    <Tag
      data-pin-track=""
      data-pin-length={length}
      data-pin-length-mobile={mobile === "stack" ? undefined : mobileLength}
      data-pin-stack={mobile === "stack" ? "" : undefined}
      style={{ ...lengths, ...style }}
      // h-auto! with reduced motion: it must also beat the mobile track height (a max-[899px] rule, emitted later).
      className={`relative overflow-x-clip ${unit === "vw" ? "h-[calc(100svh+var(--pin-len)*100vw)]" : "h-[calc((1+var(--pin-len))*100svh)]"} ${mobile === "stack" ? "max-[899px]:h-auto!" : "max-[899px]:h-[calc((1+var(--pin-len-m))*100svh)]"} motion-reduce:h-auto!`}
      {...rest}
    >
      {/* 100vw: laid out under a classic (Windows) scrollbar too, as a GSAP pin (position: fixed) is; the
          track clips the part under the scrollbar. */}
      <div ref={stage} data-pinned="" className={`sticky top-0 h-svh w-screen overflow-hidden motion-reduce:relative motion-reduce:w-auto ${mobile === "stack" ? "max-[899px]:static max-[899px]:h-auto max-[899px]:w-auto max-[899px]:overflow-visible" : ""} ${className}`.trim()}>
        {children}
      </div>
      {progress && <PinnedSectionMotion target={stage} />}
    </Tag>
  );
}
