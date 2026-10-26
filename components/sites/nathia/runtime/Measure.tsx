"use client";

import { odometerColumn } from "@/components/motion/odometer-roll";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { whenNear } from "@/components/motion/shared";
import { gsap, useGSAP } from "@/lib/gsap";
import type { MeasurePhoto } from "../scenes/MeasureMotion";
import { MOBILE_QUERY, measureTiming } from "../tokens";

const span = (t: number, a: number, b: number) => gsap.utils.clamp(0, 1, (t - a) / (b - a));
const easeOut = (t: number, power: number) => 1 - Math.pow(1 - t, power);

/**
 * The Measure's scroll timeline (loaded after first paint): one scrubbed timeline (scrub .7) over the pin
 * (3.4 viewports, 2.8 on mobile), measured on live [Measure]. Each number owns a quarter of it:
 * - it counts 0 → value over .04 → .55 of its quarter (ease-out power 2.4; the last one, "1", appears at .08)
 * - numbers after the first rise in from yPercent 10 (.05) at the quarter's start, over their photo (.04);
 *   captions rise from 18px (.04, stagger .008) .025 after; each but the last leaves .05 before its quarter
 *   ends (up 8%, blur 8px)
 * - its photo drifts ±3% of the stage height across the quarter (scale 1.08); ticks fill per quarter; the
 *   photos blur in over the first 6% (9px, 5 mobile)
 * - the digits are filled with the photo: each strip's background is the photo's cover box (×1.08, `zoom`,
 *   `focus`), positioned so it stays put behind the rolling digits and follows the drift (background-position
 *   per frame: approved, CLAUDE.md §12)
 * Reduced motion: no timeline (the markup's final values, stacked).
 */
export default function MeasureMotion({ sceneId, numbers }: { sceneId: string; numbers: MeasurePhoto[] }) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const s = document.getElementById(sceneId);
      if (!s) return;
      const mm = gsap.matchMedia();

      mm.add({ full: "(prefers-reduced-motion: no-preference)", mobile: MOBILE_QUERY }, (ctx) => {
        const { full, mobile } = ctx.conditions as { full: boolean; mobile: boolean };
        if (!full) return;
        // Set up when the scene is about a viewport away (whenNear), not at page load: the timeline only
        // reads layout and writes styles, and the pin's scroll length is reserved in the HTML (PinnedSection).
        let cleanup: (() => void) | undefined;
        const init = ctx.add("init", () => {
          const nums = gsap.utils.toArray<HTMLElement>("[data-mz-num]", s);
          const bgs = gsap.utils.toArray<HTMLElement>("[data-mz-bg]", s);
          const ticks = gsap.utils.toArray<HTMLElement>("[data-mz-tick]", s);
          const values = nums.map((n) => Number(n.dataset.value));
          const odometers = nums.map((n) => n.querySelector<HTMLElement>("[data-odometer]")!);
          const dims = odometers.map((o) => (o.getAttribute("data-odometer-dim") ?? "opacity-25").split(" "));
          const photos = numbers.map((n) => ({ ...n, url: `/nathia/img/${n.img}-${mobile ? "sm" : "lg"}.webp`, w: 1, h: 1 }));
          // The sticky stage (full viewport) inside the pin track: photo boxes and digit offsets are relative to it.
          const stageEl = s.querySelector<HTMLElement>("[data-pinned]") ?? s;
          let stage = stageEl.getBoundingClientRect();
          // Late callbacks (photo loads, fonts) only write styles, so they need no GSAP context; they stop on cleanup.
          let live = true;
          let last = -1;

          // Each column's and separator's offset inside the stage, and the strip height (11 rows), measured on
          // refresh; reads first, then the writes in render().
          const measure = () => {
            stage = stageEl.getBoundingClientRect();
            odometers.forEach((o) =>
              o.querySelectorAll<HTMLElement>("[data-odometer-col], [data-odometer-sep]").forEach((el) => {
                const r = el.getBoundingClientRect();
                el.dataset.ox = String(r.left - stage.left);
                el.dataset.oy = String(r.top - stage.top);
                const strip = el.firstElementChild as HTMLElement | null;
                if ("odometerCol" in el.dataset && strip) el.dataset.sh = String(strip.offsetHeight);
              }),
            );
          };

          const render = (p: number, force = false) => {
            if (!force && Math.abs(p - last) < 2e-4) return;
            last = p;
            nums.forEach((_, i) => {
              const f = span(p, i / 4, (i + 1) / 4);
              if (!force && !(p >= i / 4 - 0.02 && p <= (i + 1) / 4 + 0.02)) return;
              const value = i === 3 ? (f > 0.08 ? values[i] : 0) : values[i] * easeOut(span(f, 0.04, 0.55), 2.4);
              const drift = (f - 0.5) * stage.height * 0.06;
              bgs[i].style.transform = `translate3d(0, ${drift}px, 0) scale(1.08)`;
              // The photo's cover box in stage coordinates (focus: that point at the centre, 42% down).
              const photo = photos[i];
              const k = 1.08 * Math.max(stage.width / photo.w, stage.height / photo.h) * (photo.zoom ?? 1);
              const pw = photo.w * k;
              const ph = photo.h * k;
              const box = photo.focus
                ? { x: 0.5 * stage.width - photo.focus[0] * pw, y: 0.42 * stage.height - photo.focus[1] * ph }
                : { x: (stage.width - pw) / 2, y: (stage.height - ph) / 2 };
              const ready = photo.w > 1;
              odometers[i].querySelectorAll<HTMLElement>("[data-odometer-col]").forEach((col) => {
                const place = Number(col.dataset.place);
                const strip = col.firstElementChild as HTMLElement;
                const y = (-odometerColumn(value, place) / 11) * Number(col.dataset.sh || 0);
                strip.style.transform = `translate3d(0, ${y}px, 0)`;
                if (ready) {
                  strip.style.backgroundSize = `${pw}px ${ph}px`;
                  strip.style.backgroundPosition = `${box.x - Number(col.dataset.ox)}px ${box.y - Number(col.dataset.oy) - y + drift}px`;
                }
                dims[i].forEach((c) => col.classList.toggle(c, place > 0 && value < 10 ** place));
              });
              odometers[i].querySelectorAll<HTMLElement>("[data-odometer-sep]").forEach((sep) => {
                if (ready) {
                  sep.style.backgroundSize = `${pw}px ${ph}px`;
                  sep.style.backgroundPosition = `${box.x - Number(sep.dataset.ox)}px ${box.y - Number(sep.dataset.oy) + drift}px`;
                }
                dims[i].forEach((c) => sep.classList.toggle(c, value < 10 ** Number(sep.dataset.place)));
              });
            });
            ticks.forEach((t, i) => (t.style.transform = `scaleX(${span(p, i / 4, (i + 1) / 4)})`));
            s.style.setProperty("--mz-blur", `${(mobile ? measureTiming.blur.mobile : measureTiming.blur.desktop) * span(p, 0, 0.06)}px`);
          };

          // The photos for the digit fill (the scene is near by now).
          photos.forEach((photo, i) => {
            const img = new Image();
            img.onload = () => {
              if (!live) return;
              photo.w = img.naturalWidth;
              photo.h = img.naturalHeight;
              render(Math.max(0, last), true);
            };
            img.src = photo.url;
            odometers[i].querySelectorAll<HTMLElement>("[data-odometer-strip], [data-odometer-sep]").forEach((el) => {
              el.style.backgroundImage = `url(${photo.url})`;
            });
          });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: s,
              start: "top top",
              // The scene root is the pin track: top top → bottom bottom is the pinned range.
              end: "bottom bottom",
              scrub: measureTiming.scrub,
              invalidateOnRefresh: true,
              onRefresh: () => {
                measure();
                render(Math.max(0, last), true);
              },
            },
            onUpdate: () => render(tl.progress()),
          });
          tl.to({}, { duration: 1 }, 0); // the timeline spans exactly 0 → 1
          nums.forEach((num, i) => {
            const at = i / 4;
            if (i > 0) {
              tl.fromTo(num, { autoAlpha: 0, yPercent: 10 }, { autoAlpha: 1, yPercent: 0, duration: 0.05, ease: "power2.out" }, at);
              tl.fromTo(bgs[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, at - 0.01);
            }
            tl.fromTo(num.querySelectorAll("[data-mz-cap]"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.04, stagger: 0.008, ease: "power2.out" }, at + 0.025);
            if (i < 3) tl.to(num, { autoAlpha: 0, yPercent: -8, filter: "blur(8px)", duration: 0.045, ease: "power2.in" }, (i + 1) / 4 - 0.05);
          });

          measure();
          render(0, true);
          document.fonts?.ready.then(() => {
            if (!live) return;
            measure();
            render(Math.max(0, last), true);
          });

          cleanup = () => {
            live = false;
            s.style.removeProperty("--mz-blur");
          };
        });
        const stop = whenNear(s, () => init());
        return () => {
          stop();
          cleanup?.();
        };
      });
    },
    { dependencies: [sceneId, motion, JSON.stringify(numbers)], revertOnUpdate: true },
  );

  return null;
}
