"use client";

import { useRef } from "react";
import { lazyMotion } from "./lazy";
import { PIN_MOBILE_QUERY } from "./PinnedSection";

// Loading, drawing and scrubbing (GSAP + canvas) load after first paint.
const ImageSequenceMotion = lazyMotion(() => import("./runtime/ImageSequence"));

export interface FrameSet {
  /** URL template; `{n}` is replaced by the 1-based frame number, zero-padded to `pad` digits. */
  src: string;
  count: number;
  /** Digits in the frame number, e.g. 3 → 001. Default 3. */
  pad?: number;
}

/**
 * A scroll-scrubbed image sequence drawn to a canvas (CLAUDE.md §7: canvas, not <img> swaps).
 *
 * - Scrubbed by the nearest PinnedSection's pin: `range` is the part of the pin (0 → 1) over which the
 *   sequence plays, e.g. [0.47, 0.9]. Without a pin it plays while the canvas crosses the viewport.
 * - Frame sets: `frames` on desktop, `mobileFrames` on screens matching `mobileQuery` (half the frames or
 *   smaller frames, CLAUDE.md §4.5).
 * - Loading (bytes before scroll stay small): the first frame first (a critical asset for <Preloader> when
 *   `critical`), every 8th frame after first paint, the rest on the first scroll, wheel, touch or key press,
 *   or straight away on a fast unmetered connection. Data Saver: every 8th frame until the user scrolls.
 *   Within a pass, 8th → 4th → 2nd → rest, five at a time; a missing frame draws its nearest loaded neighbour.
 * - Drawing: cover-fit with a focus point (`focusY`, 0 top → 1 bottom), sharp on retina up to `dprCap`, with a
 *   crossfade between neighbouring frames so scrubbing between them stays smooth.
 * - Reduced motion: only `reducedFrame` (default: the last) is loaded and drawn, no scrubbing.
 * - The canvas is decorative (aria-hidden); give the scene a text alternative if the frames carry meaning.
 */
export function ImageSequence({
  frames,
  mobileFrames = frames,
  mobileQuery = PIN_MOBILE_QUERY,
  range = [0, 1],
  focusY = 0.5,
  mobileFocusY = focusY,
  dprCap = 2,
  mobileDprCap = dprCap,
  reducedFrame = "last",
  critical = false,
  scrub = true,
  className = "",
}: {
  frames: FrameSet;
  mobileFrames?: FrameSet;
  mobileQuery?: string;
  range?: [number, number];
  focusY?: number;
  mobileFocusY?: number;
  dprCap?: number;
  mobileDprCap?: number;
  reducedFrame?: "first" | "last";
  /** Register the first frame with the preloader. */
  critical?: boolean;
  /** `true` follows the scroll exactly; a number (seconds) lags behind it, like a scene timeline's scrub. */
  scrub?: boolean | number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  return (
    <>
      <canvas ref={ref} aria-hidden data-image-sequence className={`block size-full ${className}`.trim()} />
      <ImageSequenceMotion
        target={ref}
        frames={frames}
        mobileFrames={mobileFrames}
        mobileQuery={mobileQuery}
        range={range}
        focusY={focusY}
        mobileFocusY={mobileFocusY}
        dprCap={dprCap}
        mobileDprCap={mobileDprCap}
        reducedFrame={reducedFrame}
        critical={critical}
        scrub={scrub}
      />
    </>
  );
}

/** Frame URL for a 0-based index. */
export const frameUrl = (set: FrameSet, index: number) => set.src.replace("{n}", String(index + 1).padStart(set.pad ?? 3, "0"));
