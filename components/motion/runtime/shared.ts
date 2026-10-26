// GSAP-side helpers for the motion runtime. Imported only by modules in this folder (and other lazily
// loaded motion code), never by a module that's part of the initial bundle.
import { useMotion, type Motion } from "@/components/providers/ThemeProvider";
import { ensureThemeEases, ScrollTrigger } from "@/lib/gsap";
import { REVEAL_TOGGLE } from "../shared";

/**
 * useMotion() plus the theme eases registered with CustomEase. Runtime components call it during
 * render, so the ease names exist before any useGSAP effect uses them.
 */
export function useRuntimeMotion(): Motion {
  const motion = useMotion();
  ensureThemeEases();
  return motion;
}

/** True when the element is on screen at setup. Reduced-motion fades skip these to avoid a flash. */
export const isInView = (el: Element) => ScrollTrigger.isInViewport(el);

/**
 * ScrollTrigger vars for a one-time reveal, or `undefined` (= play right away) when the element is
 * already on screen at setup.
 *
 * Not `start: "clamp(top 85%)"`: clamp pins the start to exactly 0 for elements on screen at load and
 * to exactly max scroll for elements near the bottom. A trigger sitting exactly on its start never
 * "enters", so those reveals never played (verified in Chrome). Instead: on-screen elements play
 * immediately, and the start is capped 1px below max scroll so the last elements still fire.
 */
export function revealTrigger(el: Element, at = 0.85): ScrollTrigger.Vars | undefined {
  if (isInView(el)) return undefined;
  return {
    trigger: el,
    // `at`: the element's top crossing this fraction of the viewport height (0.85 = "top 85%").
    start: () =>
      Math.min(
        el.getBoundingClientRect().top + window.scrollY - window.innerHeight * at,
        ScrollTrigger.maxScroll(window) - 1,
      ),
    toggleActions: REVEAL_TOGGLE,
  };
}

let refreshQueued = false;
/**
 * Sorts triggers into page order and refreshes ScrollTrigger once, on the next frame, however many
 * callers ask in the meantime (fonts ready, page height changes). A full refresh re-measures every
 * trigger, so never one per caller.
 */
export function refreshSoon() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
}

const drives = (st: ScrollTrigger, el: Element) => {
  const animation = st.animation as gsap.core.Tween | undefined;
  return !!animation?.targets && animation.targets().some((t: unknown) => t instanceof Element && t !== el && t.contains(el));
};

/**
 * Re-measures `triggers` as a full ScrollTrigger refresh measures them: with every scroll-driven animation that
 * moves an ancestor of their trigger (a drifting column around a drifting photo) at its start. A trigger made
 * later, by a lazily mounted runtime, would otherwise be measured wherever the ancestor has drifted to, or
 * without it if the ancestor's runtime comes later, and its animation would run at a different point than
 * after the next full refresh (the Nathia gallery: photos scaled 1–2% off live).
 */
export function measureAtStart(triggers: ScrollTrigger[]) {
  const outer = ScrollTrigger.getAll().filter((st) => !triggers.includes(st) && triggers.some((t) => t.trigger && drives(st, t.trigger)));
  if (!outer.length) return;
  const saved = outer.map((st) => st.animation!.progress());
  outer.forEach((st) => st.animation!.progress(0));
  triggers.forEach((t) => t.refresh());
  outer.forEach((st, i) => st.animation!.progress(saved[i]));
}

/** The triggers inside `el` whose animations move something other than `el` (for measureAtStart). */
export const triggersWithin = (el: Element) => ScrollTrigger.getAll().filter((st) => st.trigger && el !== st.trigger && el.contains(st.trigger) && !drives(st, el));
