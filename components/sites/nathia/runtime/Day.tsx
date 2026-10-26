"use client";

import { getLenis } from "@/components/providers/lenis-store";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { whenNear } from "@/components/motion/shared";
import { gsap, useGSAP } from "@/lib/gsap";
import type { DayMoment } from "../scenes/DayMotion";
import { dayTiming as T, MOBILE_QUERY } from "../tokens";
import { createDayWipe, type DayWipe } from "./dayWipe";
import { deviceTier } from "./tier";

const span = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const smooth = (t: number) => t * t * (3 - 2 * t);
const pad = (n: number) => String(n).padStart(2, "0");
const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * The Day scene (fetched and mounted ~1.5 viewports ahead), measured on live [Day]:
 * - one scrubbed timeline (scrub .6) over the pin; at each progress p (render): the wipe (holds 8%, wipes 24%,
 *   smoothstep), the clock (minutes between the moments' times over each wipe; ±7 minutes within each hold, the
 *   first only forward; the moon after 19:24), the segment fills, and the moment shown (switching at .2, .52,
 *   .83: its line fades in and rises, the last one fades).
 * - the wipe (WebGL, dayWipe.ts) on mid/high tier devices once the four photos are on the GPU; low tier and
 *   reduced motion crossfade the photos instead.
 * - a segment click scrolls to that moment's hold over 1.4s (Lenis); with reduced motion (no pin, no timeline)
 *   it switches the moment directly, with fades only.
 */
export default function DayRuntime({ sceneId, moments }: { sceneId: string; moments: DayMoment[] }) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const s = document.getElementById(sceneId);
      if (!s) return;
      const mm = gsap.matchMedia();

      // matchMedia runs this only while one of the conditions matches: list both motion states, so it always does.
      mm.add({ full: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)", mobile: MOBILE_QUERY }, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { full: boolean; reduce: boolean; mobile: boolean };
        const canvas = s.querySelector<HTMLCanvasElement>("[data-dy-canvas]")!;
        const hoursEl = s.querySelector<HTMLElement>("[data-dy-hours]")!;
        const minutesEl = s.querySelector<HTMLElement>("[data-dy-minutes]")!;
        const glyph = s.querySelector<HTMLElement>("[data-dy-glyph]")!;
        const texts = gsap.utils.toArray<HTMLElement>("[data-dy-text]", s);
        const segs = gsap.utils.toArray<HTMLElement>("[data-dy-seg]", s);
        const fills = gsap.utils.toArray<HTMLElement>("[data-dy-fill]", s);
        const stills = gsap.utils.toArray<HTMLImageElement>("[data-dy-stills] img", s);
        const times = moments.map((m) => toMinutes(m.time));
        const fileOf = (img: string) => (mobile ? `/nathia/img/${img}-m.webp` : `/nathia/img/${img}-lg.webp`);
        let crossfade = reduce || deviceTier() === "low";
        let wipe: DayWipe | null = null;
        let current = -1;
        let progress = 0;
        let tl: gsap.core.Timeline | null = null;

        // The moment shown: its segment lit, its line in; the photos too when crossfading.
        const show = (i: number) => {
          if (i === current) return;
          const before = current;
          current = i;
          segs.forEach((seg, k) => seg.setAttribute("aria-pressed", String(k === i)));
          texts.forEach((text, k) => {
            if (k === i) {
              gsap.fromTo(text, { autoAlpha: 0 }, { autoAlpha: 1, duration: T.text.fadeIn, overwrite: true });
              // The rise is movement: not with reduced motion (the line just fades in).
              if (!reduce) {
                gsap.fromTo(text.querySelectorAll("[data-dy-line]"), { y: 0, yPercent: T.text.yPercent }, { yPercent: 0, duration: T.text.rise, stagger: T.text.stagger, ease: motion.ease, overwrite: true });
              }
            } else if (k === before) {
              gsap.to(text, { autoAlpha: 0, duration: T.text.fadeOut, overwrite: true });
            }
          });
          if (crossfade) stills.forEach((img, k) => gsap.to(img, { autoAlpha: k === i ? 1 : 0, duration: T.stillFade }));
        };

        const render = (p: number) => {
          progress = p;
          let from = 0;
          let mix = 0;
          T.wipes.forEach(([a, b], k) => {
            if (p >= a) {
              from = k;
              mix = smooth(span(p, a, b));
            }
          });
          wipe?.set(from, mix);
          // The clock: between the times over each wipe; drifting within each hold.
          let minutes = times[0];
          T.wipes.forEach(([a, b], k) => {
            if (p >= a) minutes = times[k] + (times[k + 1] - times[k]) * smooth(span(p, a, b));
          });
          T.holds.forEach(([a, b], k) => {
            if (p >= a && p <= b) minutes = times[k] + 2 * T.drift * span(p, a, b) - (k === 0 ? 0 : T.drift);
          });
          const whole = Math.max(0, Math.round(minutes));
          hoursEl.textContent = pad(Math.floor(whole / 60) % 24);
          minutesEl.textContent = pad(whole % 60);
          glyph.toggleAttribute("data-moon", minutes > T.moonAfter);
          fills.forEach((fill, k) => (fill.style.transform = `scaleX(${span(p, T.fills[k][0], T.fills[k][1])})`));
          show(p < T.switchAt[0] ? 0 : p < T.switchAt[1] ? 1 : p < T.switchAt[2] ? 2 : 3);
        };

        // The photos for the wipe (or, crossfading, for the stills), when the scene is ~1.5 viewports away.
        const fallBackToStills = () => {
          crossfade = true;
          stills.forEach((img, k) => {
            if (!img.getAttribute("src") && !img.currentSrc) img.src = fileOf(moments[k].img);
          });
        };
        const stopNear = whenNear(
          s,
          () => {
            if (crossfade) return fallBackToStills();
            wipe = createDayWipe(canvas, moments.map((m) => fileOf(m.img)), mobile ? T.dpr.mobile : T.dpr.desktop);
            if (!wipe) return fallBackToStills();
            wipe.resize();
            void wipe.ready.then(() => {
              if (!wipe) return;
              canvas.dataset.live = "";
              render(progress);
            });
          },
          "150% 0px",
        );
        const onResize = () => wipe?.resize();
        window.addEventListener("resize", onResize);

        // Segment clicks: scroll to the moment's hold, or (no timeline) switch to it.
        const onClick = (e: MouseEvent) => {
          const seg = (e.target as Element).closest<HTMLElement>("[data-dy-seg]");
          if (!seg) return;
          const i = Number(seg.dataset.dySeg);
          const st = tl?.scrollTrigger;
          if (!st) return show(i);
          const [a, b] = T.holds[i];
          const y = st.start + (st.end - st.start) * ((a + b) / 2);
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(y, { duration: T.clickScroll });
          else window.scrollTo({ top: y, behavior: "smooth" });
        };
        s.addEventListener("click", onClick);

        if (!reduce) {
          tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: s,
              start: "top top",
              // The scene root is the pin track: top top → bottom bottom is the pinned range.
              end: "bottom bottom",
              scrub: T.scrub,
              invalidateOnRefresh: true,
              // A refresh invalidates the timeline, which renders its start for a moment: re-read it.
              onRefresh: (self) => {
                tl?.progress(self.progress);
                render(tl?.progress() ?? 0);
              },
            },
            onUpdate: () => render(tl!.progress()),
          });
          tl.to({}, { duration: 1 }, 0); // the timeline spans exactly 0 → 1
          tl.fromTo(s.querySelector("[data-dy-head]"), { autoAlpha: 0, y: T.head.y }, { autoAlpha: 1, y: 0, duration: T.head.duration }, 0);
        }
        render(0);

        return () => {
          stopNear();
          window.removeEventListener("resize", onResize);
          s.removeEventListener("click", onClick);
          wipe?.destroy();
          wipe = null;
          delete canvas.dataset.live;
        };
      });
    },
    { dependencies: [sceneId, motion, JSON.stringify(moments)], revertOnUpdate: true },
  );

  return null;
}
