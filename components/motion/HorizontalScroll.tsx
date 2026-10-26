"use client";

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { lazyMotion } from "./lazy";
import { PinnedSection } from "./PinnedSection";

// The scroll link (GSAP) loads after first paint and sets up near the section; the pin is CSS from the start.
const HorizontalScrollMotion = lazyMotion(() => import("./runtime/HorizontalScroll"), { near: true });

/** A tween run on every panel (or elements inside it) as that panel moves through the screen. */
export interface PanelEffect {
  /** Elements inside each panel (CSS selector). Omitted: the panel itself. */
  target?: string;
  from: Record<string, number | string>;
  to: Record<string, number | string>;
  /**
   * ScrollTrigger positions against the panel: horizontal while pinned ("left right" = the panel's left edge
   * at the screen's right edge), vertical when stacked ("top 90%").
   */
  start: string;
  end?: string;
  /** Scrubbed: true, or seconds of smoothing. Omitted: plays once, at `start`. */
  scrub?: boolean | number;
  /** Plays once: seconds (exact, for a measured value; default: the theme's base duration). */
  duration?: number;
  /** Seconds between targets. */
  stagger?: number;
  /** Default: linear when scrubbed, the theme's brand ease when played once. */
  ease?: string;
}

/**
 * A row of panels that moves sideways while the page scrolls down: the section pins (a CSS sticky stage in a
 * track reserved in the server HTML, see PinnedSection) and the track slides by its own overflow over the pin.
 *
 * - `overflow`: how far the track reaches past the screen, in viewport widths × 100 (track width − 100vw). Size
 *   the panels in vw so this is exact; the pin then scrolls `distance` × that (0.95: a little less, so the
 *   last panel arrives just before the pin ends).
 * - Panels are the track's children marked `data-hs-panel` (or `panel`). `effects` run per panel against the
 *   moving track (GSAP containerAnimation): image drift, clip openings, fades as each panel enters.
 * - `after`: more of the stage, outside the track (a caption strip). Any element there marked
 *   `data-hs-counter` moves the opposite way over the same scroll, from its own overflow to 0.
 * - `stack` (default): below 900px there is no pin and the panels stack (the layout's own CSS stacks them;
 *   the track turns into a column); `stackedEffects` then run per panel with ordinary vertical triggers.
 * - Keyboard: a focused element in a panel off-screen scrolls the page to bring that panel in. Fade panel
 *   content with `opacity`, not `autoAlpha`: a control hidden with visibility can't take focus, so Tab would
 *   skip every panel that hasn't arrived yet.
 * - Reduced motion: no pin and no movement; the panels stack, every one visible. Print: the same.
 * - Until the runtime loads, the track sits at its start, every panel as it will finish.
 */
export function HorizontalScroll({
  overflow,
  distance = 1,
  scrub = true,
  panel = "[data-hs-panel]",
  effects = [],
  stackedEffects = [],
  stack = true,
  className = "",
  trackClassName = "",
  after,
  children,
  ...rest
}: {
  overflow: number;
  distance?: number;
  /** The track's scrub: true, or seconds of smoothing. */
  scrub?: boolean | number;
  panel?: string;
  effects?: PanelEffect[];
  stackedEffects?: PanelEffect[];
  stack?: boolean;
  /** The stage (the visible box). */
  className?: string;
  trackClassName?: string;
  after?: ReactNode;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "className" | "children">) {
  const track = useRef<HTMLDivElement>(null);

  return (
    <PinnedSection
      length={(overflow * distance) / 100}
      unit="vw"
      mobile={stack ? "stack" : "pin"}
      // Reduced motion: the stacked panels set the stage's height (a pinned stage is one screen tall).
      className={`motion-reduce:h-auto motion-reduce:overflow-visible ${className}`.trim()}
      {...rest}
    >
      <div
        ref={track}
        data-hs-track=""
        className={`relative flex w-max will-change-transform motion-reduce:w-auto motion-reduce:flex-col ${stack ? "max-[899px]:w-auto max-[899px]:flex-col" : ""} ${trackClassName}`.trim()}
      >
        {children}
      </div>
      {after}
      <HorizontalScrollMotion
        track={track}
        panel={panel}
        scrub={scrub}
        effects={effects}
        stackedEffects={stackedEffects}
        stack={stack}
      />
    </PinnedSection>
  );
}
