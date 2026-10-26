"use client";

import { getLenis } from "@/components/providers/lenis-store";
import { useRuntimeMotion } from "@/components/motion/runtime/shared";
import { onTap, whenNear } from "@/components/motion/shared";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { estateTiming as T, MOBILE_QUERY } from "../tokens";

const span = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The Estate film (fetched and mounted ~1.5 viewports ahead), as live [Estate]:
 * - one scrubbed timeline (scrub .6) over the pin; at progress p × chapters (render): each shot's pan scales
 *   1 → 1.07 over its chapter, the segment fills follow, the skywalk gauge counts its feet, and the chapter
 *   shown switches (show: crossfade, settle, card lines and pieces).
 * - videos: posters when near, files when the film is 1.6 viewports away, playing while it is on screen
 *   (70% → 30%), the next one preloaded; "hold" videos slow down at the end and stop on the last frame.
 * - segment clicks scroll to the chapter over 1.4 s; with reduced motion (no pin, no timeline, no videos)
 *   they switch chapters directly, as live.
 * - a tap on the film (not on its buttons, not a drag) pauses or resumes a looping video (CLAUDE.md §12).
 */
export default function EstateRuntime({
  sceneId,
  chapters,
  gaugeFeet,
  gaugeChapter,
}: {
  sceneId: string;
  chapters: string[];
  gaugeFeet: number;
  gaugeChapter: number;
}) {
  const motion = useRuntimeMotion();

  useGSAP(
    () => {
      const s = document.getElementById(sceneId);
      const film = s?.querySelector<HTMLElement>("#estate-film");
      if (!s || !film) return;
      const mm = gsap.matchMedia();

      // matchMedia runs this only while one of the conditions matches: both motion states are listed.
      mm.add({ full: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)", mobile: MOBILE_QUERY }, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { full: boolean; reduce: boolean; mobile: boolean };
        const all = <E extends Element>(sel: string) => gsap.utils.toArray<E>(sel, s);
        const shots = all<HTMLElement>("[data-es-shot]");
        const ins = shots.map((shot) => shot.querySelector<HTMLElement>("[data-es-shot-in]")!);
        const pans = shots.map((shot) => shot.querySelector<HTMLElement>("[data-es-shot-pan]")!);
        const videos = shots.map((shot) => shot.querySelector("video"));
        const cards = all<HTMLElement>("[data-es-card]");
        const segs = all<HTMLButtonElement>("[data-es-seg]");
        const fills = all<HTMLElement>("[data-es-fill]");
        const count = s.querySelector<HTMLElement>("[data-es-count]");
        const gauge = s.querySelector<HTMLElement>("[data-es-gauge]");
        const gaugeNum = s.querySelector<HTMLElement>("[data-es-gauge-num]");
        const gaugeFill = s.querySelector<HTMLElement>("[data-es-gauge-fill]");
        const w = shots.length;

        const stopPosters = whenNear(film, () =>
          videos.forEach((v) => v && (v.poster = (mobile ? v.dataset.posterSm : v.dataset.poster) ?? "")),
        );
        const load = (v: HTMLVideoElement | null | undefined) => {
          if (!v || v.getAttribute("src") || reduce) return;
          v.preload = "auto";
          v.src = (mobile ? v.dataset.sm : v.dataset.lg) ?? "";
        };

        let current = -1;
        let active = false;
        let tapPaused = false;
        let raf = 0;
        // A "hold" video eases to .3× over its last 1.6 s, so it settles on its last frame.
        const slow = () => {
          raf = 0;
          const v = videos[current];
          if (!v || v.dataset.mode !== "hold" || v.paused || !v.duration) return;
          const left = v.duration - v.currentTime;
          v.playbackRate = left < T.video.slowWindow ? T.video.slowMin + (1 - T.video.slowMin) * smooth(left / T.video.slowWindow) : 1;
          raf = requestAnimationFrame(slow);
        };
        const play = (i: number, restart: boolean) => {
          const v = videos[i];
          if (!v || reduce) return;
          load(v);
          if (v.dataset.mode === "hold") {
            if (restart) {
              try {
                v.currentTime = 0;
              } catch {}
              v.playbackRate = 1;
            } else if (v.ended) return;
          } else if (tapPaused) return;
          v.play()
            .then(() => {
              if (!raf) raf = requestAnimationFrame(slow);
            })
            .catch(() => {});
        };

        const hides: (gsap.core.Tween | null)[] = shots.map(() => null);
        const show = (i: number) => {
          if (i === current) return;
          const prev = current;
          current = i;
          segs.forEach((seg, k) => seg.setAttribute("aria-pressed", String(k === i)));
          if (count) count.textContent = chapters[i];
          gauge?.toggleAttribute("data-on", i === gaugeChapter);
          if (active) load(videos.slice(i + 1).find(Boolean));
          shots.forEach((shot, k) => {
            hides[k]?.kill();
            hides[k] = null;
            if (k === i) {
              gsap.set(shot, { zIndex: 2 });
              if (prev < 0 || reduce) gsap.set(shot, { autoAlpha: 1, overwrite: true });
              else {
                gsap.fromTo(shot, { autoAlpha: 0 }, { autoAlpha: 1, duration: T.shot.fade, ease: T.shot.ease, overwrite: true });
                gsap.fromTo(ins[k], { scale: T.shot.settleFrom }, { scale: 1, duration: T.shot.settle, ease: motion.ease, overwrite: true });
              }
              if (active) play(k, true);
            } else {
              gsap.set(shot, { zIndex: k === prev ? 1 : 0 });
              hides[k] = gsap.delayedCall(reduce ? 0 : T.shot.hideAfter, () => {
                gsap.set(shot, { autoAlpha: 0, overwrite: true });
                videos[k]?.pause();
              });
            }
          });
          cards.forEach((card, k) => {
            if (k === i) {
              gsap.set(card, { autoAlpha: 1 });
              if (reduce) return;
              const delay = prev < 0 ? 0 : T.card.delay;
              gsap.fromTo(card.querySelectorAll("[data-es-line]"), { yPercent: 110 }, { yPercent: 0, duration: T.card.rise, stagger: T.card.stagger, ease: motion.ease, delay, overwrite: true });
              gsap.fromTo(
                card.querySelectorAll("[data-es-fx]"),
                { autoAlpha: 0, y: T.card.fxY },
                { autoAlpha: 1, y: 0, duration: T.card.fx, stagger: T.card.stagger, ease: motion.ease, delay: delay + T.card.fxDelay, overwrite: true },
              );
            } else if (k === prev) gsap.to(card, { autoAlpha: 0, duration: T.card.out, overwrite: true });
            else gsap.set(card, { autoAlpha: 0, overwrite: true });
          });
        };

        const render = (p: number) => {
          const x = p * w;
          pans.forEach((pan, k) => (pan.style.transform = `scale(${1 + T.pan * span(x, k, k + 1)})`));
          fills.forEach((fill, k) => (fill.style.transform = `scaleX(${span(x, k, k + 1)})`));
          if (gaugeChapter >= 0) {
            const g = smooth(span(x, gaugeChapter + T.gauge[0], gaugeChapter + T.gauge[1]));
            if (gaugeNum) gaugeNum.textContent = String(Math.round(gaugeFeet * g));
            if (gaugeFill) gaugeFill.style.transform = `scaleY(${g})`;
          }
          show(Math.min(w - 1, Math.floor(x)));
        };

        // Videos: files ahead of time, playing only while the film is on screen.
        ScrollTrigger.create({ trigger: film, start: T.video.load, end: "bottom top", onEnter: () => load(videos[Math.max(0, current)]) });
        ScrollTrigger.create({
          trigger: film,
          start: T.video.play.start,
          end: T.video.play.end,
          onToggle: (st) => {
            active = st.isActive;
            if (active) {
              play(current, false);
              load(videos.slice(current + 1).find(Boolean));
            } else videos.forEach((v) => v?.pause());
          },
        });

        let tl: gsap.core.Timeline | null = null;
        if (!reduce) {
          tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: film,
              // The film is the pin track: top top → bottom bottom is the pinned range.
              start: "top top",
              end: "bottom bottom",
              scrub: T.scrub,
              invalidateOnRefresh: true,
              onRefresh: (self) => {
                tl?.progress(self.progress);
                render(tl?.progress() ?? 0);
              },
            },
            onUpdate: () => render(tl!.progress()),
          });
          tl.to({}, { duration: 1 }, 0); // the timeline spans exactly 0 → 1
        }
        render(0);

        const clicks = segs.map((seg, i) => {
          const onClick = () => {
            const st = tl?.scrollTrigger;
            if (!st) return show(i);
            const y = st.start + (st.end - st.start) * ((i + T.click.into) / w);
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(y, { duration: T.click.scroll });
            else window.scrollTo({ top: y, behavior: "smooth" });
          };
          seg.addEventListener("click", onClick);
          return () => seg.removeEventListener("click", onClick);
        });

        // Hidden pause for the looping video (no button on live).
        const stage = film.querySelector<HTMLElement>("[data-pinned]") ?? film;
        const offTap = onTap(stage, (e) => {
          if ((e.target as Element).closest("a, button")) return;
          const v = videos[current];
          if (!v || v.dataset.mode !== "loop") return;
          tapPaused = !tapPaused;
          if (tapPaused) v.pause();
          else if (active) play(current, false);
        });

        return () => {
          stopPosters();
          cancelAnimationFrame(raf);
          videos.forEach((v) => v?.pause());
          clicks.forEach((off) => off());
          offTap();
        };
      });
    },
    { dependencies: [sceneId, motion, chapters.join(), gaugeFeet, gaugeChapter], revertOnUpdate: true },
  );

  return null;
}
