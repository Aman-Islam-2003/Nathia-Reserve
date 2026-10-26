"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "../lenis-store";
import { refreshSoon } from "@/components/motion/runtime/shared";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getReduced = () => window.matchMedia(REDUCED_MOTION).matches;

/**
 * Drives the Lenis instance from the GSAP ticker so ScrollTrigger and Lenis share one frame loop, and
 * publishes it for useLenis() (lenis-store). An instance created for reduced motion (smoothWheel: false)
 * is destroyed, leaving native scroll.
 */
function LenisGsapSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    if (!lenis.options.smoothWheel) {
      lenis.destroy();
      setLenis(null);
      refreshSoon();
      return;
    }

    const onTick = (time: number) => lenis.raf(time * 1000);
    const offScroll = lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);

    return () => {
      setLenis(null);
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      offScroll();
    };
  }, [lenis]);

  return null;
}

/**
 * The single Lenis instance for the app (loaded after first paint by <SmoothScroll>). Reduced motion
 * only changes Lenis options, which makes ReactLenis rebuild the instance in place.
 */
export default function SmoothScrollRuntime() {
  const reduced = useSyncExternalStore(subscribe, getReduced, getReduced);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) refreshSoon();
    });
    // Page height changes when content-visibility sections render for the first time, images load, etc.
    // ScrollTrigger only refreshes on window resize by default, so refresh (debounced) on height changes.
    // Heights a refresh produced itself (pin spacers) are taken as the new baseline, not as a change: each
    // refreshed again for nothing. The first observation is the baseline too.
    const main = document.querySelector("main");
    let lastHeight = Math.round(main?.getBoundingClientRect().height ?? 0);
    let timer: number | undefined;
    // A refresh re-applies every pin, which drops keyboard focus from inside a pinned scene (focus returning
    // to a pinned scene's button after a dialog closes was lost this way): put it back if a refresh took it.
    let focused: Element | null = null;
    const onRefreshInit = () => {
      focused = document.activeElement;
    };
    const onRefresh = () => {
      lastHeight = Math.round(main?.getBoundingClientRect().height ?? 0);
      if (focused instanceof HTMLElement && focused !== document.body && focused.isConnected && document.activeElement !== focused) {
        focused.focus({ preventScroll: true });
      }
      focused = null;
    };
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    ScrollTrigger.addEventListener("refresh", onRefresh);
    const ro = new ResizeObserver(([entry]) => {
      const h = Math.round(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height);
      if (h === lastHeight) return;
      lastHeight = h;
      window.clearTimeout(timer);
      timer = window.setTimeout(refreshSoon, 200);
    });
    if (main) ro.observe(main);
    return () => {
      cancelled = true;
      ro.disconnect();
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <ReactLenis root options={{ autoRaf: false, smoothWheel: !reduced }}>
      <LenisGsapSync />
    </ReactLenis>
  );
}
