"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { NathiaSite } from "@/content/nathia/schema";
import { setSound, useSound } from "./sound";
import { focusRing, gxInset, mono, sceneLine } from "./tokens";
import { useSceneAt } from "./useSceneAt";

/**
 * Fixed HUD along the bottom [.hud]: chapter counter "01 / 12" with a line that fills with the
 * page's scroll on the left, the ambient sound toggle on the right. Mono .68rem, tracking .14em; bone, forest
 * over light scenes [.hud.is-light]. Tone and chapter come from the scene under the 44px line, as the nav's.
 * The counter rolls in from below (or above, scrolling back) when the chapter changes [.hud-roll: yPercent ±100,
 * .7s, theme ease]. Mobile: no chapter name, no sound toggle; a filled Register interest pill instead
 * [.hud-register]. Below 720px the row centres on the pill and the counter is .6rem [@media (max-width: 720px) .hud].
 */
export function NathiaHud({ site }: { site: NathiaSite }) {
  const here = useSceneAt(sceneLine);
  const total = String(site.chapters.length).padStart(2, "0");
  const index = Math.max(0, site.chapters.findIndex((c) => c.no === here.chapter));
  const chapter = site.chapters[index];
  const color = here.tone === "light" ? "text-on-ink" : "text-ink";
  const sound = useSound();
  const roll = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLElement>(null);
  const last = useRef(index);
  const lenis = useLenis();

  // Roll the counter to the new chapter: from below going forward, from above going back.
  useEffect(() => {
    const el = roll.current;
    if (!el || last.current === index) return;
    const dir = index > last.current ? 1 : -1;
    last.current = index;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ease = getComputedStyle(el).getPropertyValue("--theme-ease").trim() || "ease-out";
    el.animate([{ transform: `translateY(${dir * 100}%)`, opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 700, easing: ease });
  }, [index]);

  // The line fills with the page's scroll [.hud-bar i: scaleX = scrollY / max scroll].
  useEffect(() => {
    const el = bar.current;
    if (!el || !lenis) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    update();
    lenis.on("scroll", update);
    return () => lenis.off("scroll", update);
  }, [lenis]);

  return (
    <div
      data-print="hide"
      data-hide-while-loading
      className={`pointer-events-none fixed bottom-[22px] z-50 flex items-end justify-between ${gxInset} ${mono} ${color} transition-[color,opacity] duration-800 max-[899px]:bottom-3.5 max-[720px]:items-center max-[720px]:text-[0.6rem]`}
    >
      <div data-hud-chapter className="flex items-center gap-3">
        {/* [.hud-roll]: one line tall, clipped, so the counter rolls through it. */}
        <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom">
          <span ref={roll} className="block leading-[1.2em] tabular-nums">
            {chapter.no} / {total}
            {/* As live: a block inside the one-line roll, so it sits on a clipped second line and never shows
                [.hud-roll span: display block]; screen readers still get it. */}
            <span className="block"> · {chapter.name}</span>
          </span>
        </span>
        {/* [.hud-bar]: 54px (28px mobile), 1px, 35% opacity; the fill grows from the left. */}
        <span aria-hidden className="relative h-px w-[54px] max-[899px]:w-7">
          <span className="absolute inset-0 bg-current opacity-35" />
          <i ref={bar} className="absolute inset-0 origin-left bg-current" style={{ transform: "scaleX(0)" }} />
        </span>
      </div>
      {/* [.sound]: four bars (2px, 2px apart, 12px box) that rise and fall while it plays; "Sound on / off". */}
      <button
        type="button"
        aria-pressed={sound}
        aria-label={sound ? "Mute ambient sound" : "Play ambient sound"}
        onClick={() => setSound(!sound)}
        className={`pointer-events-auto inline-flex items-center gap-2.5 uppercase max-[899px]:hidden ${focusRing}`}
      >
        <span aria-hidden className="inline-flex h-3 items-end gap-0.5">
          {["0s", "-0.4s", "-0.8s", "-0.2s"].map((delay) => (
            <i
              key={delay}
              className={`h-3 w-0.5 origin-bottom bg-current transition-transform duration-400 ease-[var(--theme-ease)] ${sound ? "animate-[nathia-bar_1.1s_var(--theme-ease-in-out)_infinite_alternate] motion-reduce:animate-none" : ""}`}
              style={{ animationDelay: delay, transform: sound ? undefined : "scaleY(0.25)" }}
            />
          ))}
        </span>
        {sound ? "Sound on" : "Sound off"}
      </button>
      {/* [.hud-register]: tan pill, 38px, .62rem 600, tracking .16em, soft shadow; mobile only. */}
      <Link
        href="/nathia/register"
        className={`pointer-events-auto hidden h-[38px] items-center rounded-full bg-accent px-4 font-body text-[0.62rem] font-semibold tracking-[0.16em] text-paper shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] max-[899px]:inline-flex ${focusRing}`}
      >
        Register interest
      </Link>
    </div>
  );
}
