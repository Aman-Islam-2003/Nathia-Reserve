"use client";

import { setOdometer } from "@/components/motion/odometer-roll";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { onTap } from "@/components/motion/shared";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOBILE_QUERY, snowFall, snowTiming as T } from "../tokens";
import { createSnowFall, type SnowFall } from "./snowFall";
import { deviceTier } from "./tier";

const span = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number, power: number) => 1 - Math.pow(1 - t, power);

/**
 * The Snow scene (fetched and mounted ~1.5 viewports ahead), as live [Snow]:
 * - one scrubbed timeline (scrub .8) over the pin: the photo settles, the heading rises, the body and the
 *   count fade up, and the count rolls to its value (easeOut 2.2 between .25 and .75).
 * - while pinned: the snow falls (WebGL, not on weak devices; scroll speed gusts it) and the video plays once,
 *   slowing to a stop; both stop when the pin ends.
 * - a tap on the scene (not a drag) pauses or resumes the snow (CLAUDE.md §12: no button on live).
 * - reduced motion: none of it; the count shows its value.
 */
export default function SnowRuntime({ sceneId, count }: { sceneId: string; count: number }) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const s = document.getElementById(sceneId);
      if (!s) return;
      const mm = gsap.matchMedia();

      // matchMedia runs this only while one of the conditions matches: both motion states are listed.
      mm.add({ full: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)", mobile: MOBILE_QUERY }, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { full: boolean; reduce: boolean; mobile: boolean };
        const odometer = s.querySelector("[data-odometer]");
        if (reduce) {
          setOdometer(odometer, count);
          return;
        }
        const lines = s.querySelectorAll("[data-sn-line]");
        const video = s.querySelector<HTMLVideoElement>("[data-sn-media] video");
        const canvas = s.querySelector<HTMLCanvasElement>("[data-sn-canvas]")!;
        const stage = s.querySelector<HTMLElement>("[data-pinned]") ?? s;
        gsap.set(lines, { yPercent: 110 });
        setOdometer(odometer, 0);

        const snow: SnowFall | null = deviceTier() === "low" ? null : createSnowFall(canvas, mobile ? snowFall.count.mobile : snowFall.count.desktop);
        // No snow (weak device, no WebGL, a lost context): no canvas either, so nothing can cover the photo.
        canvas.style.visibility = snow ? "" : "hidden";
        let active = false;
        let tapPaused = false;
        let raf = 0;
        // The video eases to .3× over its last 1.6 s and stops on its last frame.
        const slow = () => {
          raf = 0;
          if (!video || video.paused || !video.duration) return;
          const left = video.duration - video.currentTime;
          video.playbackRate = left < T.slowWindow ? T.slowMin + (1 - T.slowMin) * smooth(left / T.slowWindow) : 1;
          raf = requestAnimationFrame(slow);
        };
        const onResize = () => snow?.resize();
        window.addEventListener("resize", onResize);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: s,
            // The scene root is the pin track: top top → bottom bottom is the pinned range.
            start: "top top",
            end: "bottom bottom",
            scrub: T.scrub,
            invalidateOnRefresh: true,
            onToggle: (st) => {
              active = st.isActive;
              if (active) {
                if (!tapPaused) snow?.start();
                if (video && !video.ended) {
                  if (!video.getAttribute("src")) video.src = (mobile ? video.dataset.sm : video.dataset.lg) ?? "";
                  video
                    .play()
                    .then(() => {
                      if (!raf) raf = requestAnimationFrame(slow);
                    })
                    .catch(() => {});
                }
              } else {
                snow?.stop();
                video?.pause();
              }
            },
            onUpdate: (st) => snow?.push(st.getVelocity()),
          },
          onUpdate: () => setOdometer(odometer, count * easeOut(span(tl.progress(), T.count.from, T.count.to), T.count.power)),
        });
        tl.to({}, { duration: 1 }, 0)
          .fromTo(s.querySelector("[data-sn-media]"), { scale: T.mediaScale[0] }, { scale: T.mediaScale[1], duration: 1 }, 0)
          .to(lines, { yPercent: 0, stagger: T.head.stagger, duration: T.head.duration, ease: T.head.ease }, T.head.at)
          .fromTo(s.querySelector("[data-sn-body]"), { autoAlpha: 0, y: T.body.y }, { autoAlpha: 1, y: 0, duration: T.body.duration }, T.body.at)
          .fromTo(s.querySelector("[data-sn-count]"), { autoAlpha: 0, y: T.count.y }, { autoAlpha: 1, y: 0, duration: T.count.duration }, T.count.at);

        // Hidden pause for the snow (no button on live).
        const offTap = onTap(stage, (e) => {
          if ((e.target as Element).closest("a, button")) return;
          tapPaused = !tapPaused;
          if (tapPaused) snow?.stop();
          else if (active) snow?.start();
        });

        return () => {
          window.removeEventListener("resize", onResize);
          cancelAnimationFrame(raf);
          offTap();
          snow?.destroy();
          canvas.style.visibility = "";
          video?.pause();
        };
      });
    },
    { dependencies: [sceneId, count, motion], revertOnUpdate: true },
  );

  return null;
}
