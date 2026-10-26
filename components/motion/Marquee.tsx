"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { lazyMotion } from "./lazy";
import { onTap } from "./shared";

/** Reasons the loop is paused; it plays only when none is set. */
export type MarqueeHolds = { user: boolean; hover: boolean; focus: boolean; offscreen: boolean };

// The loop (GSAP) loads after first paint; until then the track sits still.
const TAP_TOGGLE = "marquee:toggle";
const MarqueeMotion = lazyMotion(() => import("./runtime/Marquee"), { near: true });

/**
 * Infinite horizontal loop that pauses off-screen, on hover and on keyboard focus, with a visible
 * Pause/Play button (WCAG 2.2.2: moving content that lasts more than 5 s needs a way to stop it). The content is repeated until one copy is at
 * least as wide as the container, then that copy is doubled so the loop never shows a gap.
 * Only the first repeat is exposed to assistive tech and focus.
 * Put trailing spacing inside each item (e.g. pr-12) so the seams match the gaps between items.
 * `control="tap"` (approved per site only, CLAUDE.md §12): no button; a tap or click on the marquee toggles
 * the pause instead (a tap, never a drag or scroll), for every tap-controlled marquee inside the same `data-marquee-group` element (rows that
 * move together stop together). Hover, focus and off-screen still hold it, and reduced motion keeps it still.
 */
export function Marquee({
  speed = 40,
  loop,
  direction = "left",
  control = "button",
  pauseOffscreen = true,
  label = "scrolling content",
  controlClassName = "bg-paper text-ink border-line",
  className = "",
  children,
}: {
  /** Pixels per second at durationScale 1; divided by the theme's durationScale. */
  speed?: number;
  /** Seconds per copy instead of `speed`: exact (a measured loop), whatever the width. */
  loop?: number;
  direction?: "left" | "right";
  /** How the visitor pauses it: a Pause/Play button (default), or a tap on the marquee itself. */
  control?: "button" | "tap";
  /** false for fixed-position marquees (e.g. a status ticker), which never leave the viewport. */
  pauseOffscreen?: boolean;
  /** What moves, for the control's accessible name: "Pause {label}" / "Play {label}". */
  label?: string;
  /** Colours for the Pause/Play button, to suit the surface it sits on. */
  controlClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const unit = useRef<HTMLDivElement>(null);
  // User choice from the button; hover, focus and off-screen pauses are separate and temporary.
  const [userPaused, setUserPaused] = useState(false);
  const sync = useRef<() => void>(() => {});
  const holds = useRef<MarqueeHolds>({ user: false, hover: false, focus: false, offscreen: false });
  useEffect(() => {
    holds.current.user = userPaused;
    sync.current();
  }, [userPaused]);

  // Tap control: a tap toggles every marquee in the group (the nearest [data-marquee-group], else this one).
  useEffect(() => {
    if (control !== "tap") return;
    const group = ref.current?.closest("[data-marquee-group]") ?? ref.current;
    if (!group) return;
    const toggle = () => setUserPaused((p) => !p);
    group.addEventListener(TAP_TOGGLE, toggle);
    // A tap on this marquee (not a drag or a scroll) toggles the whole group.
    const offTap = onTap(ref.current!, () => group.dispatchEvent(new Event(TAP_TOGGLE)));
    return () => {
      group.removeEventListener(TAP_TOGGLE, toggle);
      offTap();
    };
  }, [control]);

  // Repeats per copy. Starts at 1 on server and client; measured after mount.
  const [repeats, setRepeats] = useState(1);

  useEffect(() => {
    const container = ref.current;
    const content = unit.current;
    if (!container || !content) return;

    const measure = () => {
      const unitWidth = content.offsetWidth;
      if (unitWidth > 0) setRepeats(Math.max(1, Math.ceil(container.offsetWidth / unitWidth)));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const copy = (hidden: boolean) =>
    Array.from({ length: repeats }, (_, i) => {
      const isReadable = !hidden && i === 0;
      return (
        <div
          key={i}
          ref={isReadable ? unit : undefined}
          className="flex shrink-0"
          aria-hidden={isReadable ? undefined : true}
          inert={!isReadable}
        >
          {children}
        </div>
      );
    });

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`.trim()}
    >
      <div ref={track} data-marquee-track className="flex w-max">
        <div className="flex shrink-0">{copy(false)}</div>
        <div className="flex shrink-0">{copy(true)}</div>
      </div>
      {/* Hidden with reduced motion (nothing moves) and in print. */}
      {control === "button" && (
        <button
          type="button"
          data-print="hide"
          aria-pressed={userPaused}
          aria-label={`${userPaused ? "Play" : "Pause"} ${label}`}
          onClick={() => setUserPaused((p) => !p)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-theme border px-3 py-1 text-xs font-medium uppercase tracking-widest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:hidden ${controlClassName}`}
        >
          {userPaused ? "Play" : "Pause"}
        </button>
      )}
      <MarqueeMotion
        root={ref}
        track={track}
        holds={holds}
        sync={sync}
        speed={speed}
        loop={loop}
        direction={direction}
        repeats={repeats}
        pauseOffscreen={pauseOffscreen}
      />
    </div>
  );
}
