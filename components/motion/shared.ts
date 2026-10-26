// Motion helpers with no GSAP dependency, safe to import from the initial bundle. GSAP-side helpers
// (revealTrigger, isInView, useRuntimeMotion) live in ./runtime/shared.ts.
import type { Motion } from "@/components/providers/ThemeProvider";

/** Duration token name, so props never take raw seconds. */
export type DurKey = keyof Motion["dur"];

/** Play once on enter. */
export const REVEAL_TOGGLE = "play none none none";

/** Window event that restarts every one-time reveal (used by the dev playground). */
export const REPLAY_EVENT = "motion:replay";

/** Restarts `anim` on REPLAY_EVENT. Returns the cleanup; call it from the matchMedia callback. */
export function onReplay(getAnim: () => gsap.core.Animation | undefined) {
  const replay = () => getAnim()?.restart(true);
  window.addEventListener(REPLAY_EVENT, replay);
  return () => window.removeEventListener(REPLAY_EVENT, replay);
}

/**
 * Runs `init` once, when `el` comes within `margin` of the viewport (default: one viewport ahead).
 * Lazy setup keeps the initial long task small as pages grow: off-screen reveals don't split text
 * or create ScrollTriggers until they're about to be needed. IntersectionObserver does no layout
 * reads on the main thread. Call it with a context-bound init (`ctx.add("init", fn)`) so anything
 * created later is still reverted with the component. Returns a cleanup.
 */
export function whenNear(el: Element, init: () => void, margin = "100% 0px") {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        init();
      }
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Runs `fn` when the browser is idle after load (fallback: next macrotask), so scroll-only features
 * (indicators, hide-on-scroll) stay out of the initial long task. Returns a cleanup.
 */
export function whenIdle(fn: () => void, timeout = 2000) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 1);
  return () => clearTimeout(id);
}

const REVEALED = "data-revealed";
let fallbackObserver: IntersectionObserver | undefined;
/** Reveals whose runtime has set them up; the fallback leaves these alone, whichever effect ran first. */
const claimed = new WeakSet<Element>();

/**
 * Until a reveal's runtime (GSAP) has set it up, a [data-reveal] element that comes on screen is shown
 * as is, without animating: it sets `data-revealed`, which the hiding CSS excludes. The runtime loads
 * after first paint, so without this an on-screen element would stay hidden until it arrived (up to the
 * 3s CSS fallback). Called from the markup component's effect; returns a cleanup.
 */
export function revealFallback(el: Element) {
  if (claimed.has(el)) return;
  fallbackObserver ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      fallbackObserver?.unobserve(entry.target);
      if (!claimed.has(entry.target)) entry.target.setAttribute(REVEALED, "");
    }
  });
  fallbackObserver.observe(el);
  return () => fallbackObserver?.unobserve(el);
}

/**
 * Called by a reveal's runtime when it sets up: ends the fallback for `el` and returns true when the
 * fallback had already shown it, in which case the runtime leaves it static (no hide, no animation).
 * The runtime can mount before or after the markup component's effect runs; either order works.
 */
export function claimReveal(el: Element) {
  if (!claimed.has(el)) {
    claimed.add(el);
    fallbackObserver?.unobserve(el);
  }
  return el.hasAttribute(REVEALED);
}

/**
 * Calls `fn` on a tap or click on `el` that wasn't a drag (the pointer moved less than 8px between press and
 * release), so scrolling a phone or dragging never counts as one. For hidden pause toggles (CLAUDE.md §12).
 */
export function onTap(el: HTMLElement, fn: (e: MouseEvent) => void) {
  let start: { x: number; y: number } | null = null;
  const down = (e: PointerEvent) => (start = { x: e.clientX, y: e.clientY });
  const click = (e: MouseEvent) => {
    const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0;
    start = null;
    if (moved < 8) fn(e);
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("click", click);
  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("click", click);
  };
}
