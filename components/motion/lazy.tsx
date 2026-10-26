"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

/** Loaders queued for the next "after first paint" flush. */
const queue = new Set<() => unknown>();
let flushScheduled = false;

/**
 * Runs `start` right after the next paint (the first one, on initial load): a requestAnimationFrame
 * callback runs just before a frame is painted, and a task queued from it runs just after.
 */
function afterNextPaint(start: () => unknown) {
  queue.add(start);
  if (flushScheduled) return;
  flushScheduled = true;
  requestAnimationFrame(() =>
    setTimeout(() => {
      flushScheduled = false;
      const starts = [...queue];
      queue.clear();
      starts.forEach((s) => s());
    }),
  );
}

/**
 * A component that loads a motion runtime module (GSAP, SplitText, Lenis) after first paint and then
 * renders it. Runtime components render nothing; they animate refs owned by the markup component.
 *
 * Why: GSAP is then not part of the initial bundle, so its download and evaluation can't delay first
 * paint (LCP). Every runtime's import is queued when its markup module evaluates and all of them start
 * together right after first paint, in parallel with hydration (the effect is a fallback, e.g. when
 * rAF doesn't run in a background tab). Not next/dynamic: its Suspense boundaries were client-rendered
 * segment by segment and React throttles their reveal, so on-screen reveals waited ~0.6 s longer.
 *
 * Call at module scope, like next/dynamic. This module imports nothing from the app, so calling it
 * while other modules are still evaluating is safe (CLAUDE.md §2, module layering).
 *
 * `near: true` (primitives and scene runtimes): the runtime mounts only when the element around it comes
 * within a viewport of the screen, so a long page doesn't set up ~65 runtimes (and their React commits) before
 * any of them is needed; on /nathia it measured -25 ms of script and Lighthouse TBT 985 → 342 ms (with the
 * gallery buttons no longer hydrated; median of 5, mobile). It renders an inert
 * <template data-motion-anchor> in its place to observe its parent; the module still loads after first paint.
 * Leave it off for page-wide runtimes (smooth scroll, preloader, headers, menus, dialogs). A margin string
 * instead of `true` mounts it that far ahead (e.g. "400% 0px": a scene that loads data four viewports early).
 * `fetch: "near"` (with `near`) also defers the module's download until then, so it adds nothing to the page
 * load: for a runtime far down the page whose margin leaves time to fetch it (the Address map scene).
 */
export function lazyMotion<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
  options: { near?: boolean | string; fetch?: "after-paint" | "near" } = {},
) {
  let loading: Promise<ComponentType<P>> | undefined;
  const start = () => (loading ??= load().then((m) => m.default));
  if (typeof window !== "undefined" && !(options.near && options.fetch === "near")) afterNextPaint(start);

  function LazyMotion(props: P) {
    const [Runtime, setRuntime] = useState<ComponentType<P> | undefined>(undefined);
    const anchor = useRef<HTMLTemplateElement>(null);

    useEffect(() => {
      let live = true;
      const mount = () => start().then((component) => live && setRuntime(() => component));
      const area = anchor.current?.parentElement;
      if (!options.near || !area || typeof IntersectionObserver === "undefined") {
        mount();
      } else {
        const io = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            io.disconnect();
            mount();
          },
          { rootMargin: typeof options.near === "string" ? options.near : "100% 0px" },
        );
        io.observe(area);
        return () => {
          live = false;
          io.disconnect();
        };
      }
      return () => {
        live = false;
      };
    }, []);

    // Always mounted from the effect, one commit after the markup, never in the same commit (even when
    // the module is already loaded): a child's layout effect (useGSAP) runs before its parent element's
    // ref is attached, so a runtime rendered inside the element it animates would find target.current
    // null and silently do nothing. Server and hydration render nothing (or the inert anchor).
    const runtime = Runtime ? <Runtime {...props} /> : null;
    if (!options.near) return runtime;
    return (
      <>
        <template ref={anchor} data-motion-anchor="" />
        {runtime}
      </>
    );
  }
  return LazyMotion;
}
