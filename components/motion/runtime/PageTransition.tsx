"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type RefObject } from "react";
import { getLenis } from "@/components/providers/lenis-store";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { CurtainTiming } from "../PageTransition";
import { useRuntimeMotion } from "./shared";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** The route curtain (loaded after first paint). Renders nothing. */
export default function PageTransitionMotion({ curtain, timing }: { curtain: RefObject<HTMLDivElement | null>; timing: CurtainTiming }) {
  const motion = useRuntimeMotion();
  const router = useRouter();
  const pathname = usePathname();
  const covering = useRef(false);
  const hash = useRef<string | null>(null);

  // Cover and navigate on internal links to another route (capture phase, before Next's Link handles the click).
  const { contextSafe } = useGSAP({ scope: curtain, dependencies: [motion] });
  useEffect(() => {
    const onClick = contextSafe((e: MouseEvent) => {
      const el = curtain.current;
      if (!el || covering.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || window.matchMedia(REDUCED).matches) return;
      e.preventDefault();
      covering.current = true;
      hash.current = url.hash ? url.hash.slice(1) : null;
      // A link inside an open modal (the menu): close it, the curtain covers what's left.
      a.closest("dialog")?.close();
      getLenis()?.stop();
      const mark = el.querySelector("[data-curtain-mark]");
      const tl = gsap.timeline();
      tl.set(el, { pointerEvents: "auto" });
      tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: timing.cover, ease: motion.easeInOut });
      if (mark) tl.fromTo(mark, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: timing.markIn, ease: motion.ease }, `-=${timing.markOverlap}`);
      tl.add(() => router.push(url.pathname + url.search + url.hash));
    });
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [contextSafe, curtain, router, timing, motion]);

  // The new route has rendered: from the top (or its anchor), lift the curtain.
  useEffect(() => {
    const el = curtain.current;
    if (!el || !covering.current) return;
    const lenis = getLenis();
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      lenis?.start();
      const target = hash.current && document.getElementById(hash.current);
      if (target) window.setTimeout(() => (lenis ? lenis.scrollTo(target, { immediate: true, force: true }) : target.scrollIntoView()), 50);
      const mark = el.querySelector("[data-curtain-mark]");
      const tl = gsap.timeline({
        onComplete: () => {
          covering.current = false;
          gsap.set(el, { pointerEvents: "none", clipPath: "inset(100% 0% 0% 0%)" });
        },
      });
      if (mark) tl.to(mark, { autoAlpha: 0, duration: timing.markOut, ease: motion.easeSoft });
      tl.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: timing.reveal, ease: motion.easeInOut }, mark ? `-=${timing.revealOverlap}` : 0);
    }, timing.settle * 1000);
    return () => window.clearTimeout(id);
  }, [pathname, curtain, timing, motion]);

  return null;
}
