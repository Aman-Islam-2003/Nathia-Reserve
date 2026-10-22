"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { drawCover, loadFrames, type FrameSet } from "@/lib/frames";
import { prefersReducedMotion } from "@/lib/motion";
import { hero, site } from "@/content/site";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { useScrollTo } from "@/components/providers/SmoothScroll";

const pad = (i: number) => String(i + 1).padStart(3, "0");

/**
 * Hero: a tall section with a sticky stage. Scroll progress scrubs an 80-frame
 * image sequence on a <canvas> (Apple-style) and climbs the altitude counter.
 */
export function Ascent() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const counter = useRef<{ set: (p: number) => void } | null>(null);
  const frames = useRef<FrameSet | null>(null);
  const frameIndex = useRef(0);
  const scrollTo = useScrollTo();

  const draw = () => {
    const c = canvas.current, f = frames.current;
    if (!c || !f) return;
    const img = f.nearest(frameIndex.current);
    if (!img) return;
    const ctx = c.getContext("2d");
    if (ctx) drawCover(ctx, img, c.width, c.height);
  };

  useEffect(() => {
    const c = canvas.current!;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw();
    };
    frames.current = loadFrames((i) => `${hero.frames.dir}/${pad(i)}.${hero.frames.ext}`, hero.frames.count, resize);
    resize();
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); frames.current?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(() => {
    const reduce = prefersReducedMotion();
    if (reduce) {
      frameIndex.current = hero.frames.count - 1;
      counter.current?.set(1);
      gsap.set(".ascent__final", { autoAlpha: 1 });
      gsap.set(".ascent__meter, .ascent__hint", { autoAlpha: 0 });
      draw();
      return;
    }
    gsap.set(".ascent__final", { autoAlpha: 0, y: 40 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          frameIndex.current = Math.min(hero.frames.count - 1, p / 0.85 * (hero.frames.count - 1));
          counter.current?.set(Math.min(1, p / 0.7));
          draw();
        },
      },
    });
    tl.to(".ascent__hint", { autoAlpha: 0, duration: 0.08 }, 0.02)
      .fromTo(".ascent__ticks", { yPercent: -50 }, { yPercent: 0, ease: "none", duration: 0.7 }, 0)
      .to(".ascent__meter", { autoAlpha: 0, y: -60, duration: 0.12 }, 0.72)
      .to(".ascent__final", { autoAlpha: 1, y: 0, duration: 0.15 }, 0.8)
      .to({}, { duration: 0.05 });
    ScrollTrigger.refresh();
  }, { scope: section });

  return (
    <section id="ascent" ref={section} className="ascent" data-chapter>
      <div className="ascent__stage">
        <canvas ref={canvas} className="ascent__canvas" aria-hidden="true" />
        <div className="ascent__shade" aria-hidden="true" />

        <div className="ascent__ruler" aria-hidden="true">
          <div className="ascent__ticks">
            {Array.from({ length: 17 }, (_, i) => 8 - i * 0.5).map((k) => (
              <span key={k}>{Number.isInteger(k) ? `${k}k` : ""}</span>
            ))}
          </div>
        </div>

        <div className="ascent__meter">
          <RollingNumber value={site.altitudeFt} progressRef={counter} className="ascent__alt" />
          <span className="ascent__unit">ft</span>
          <p className="ascent__label mono">The mist line</p>
        </div>

        <p className="ascent__hint mono" aria-hidden="true">Scroll to climb</p>

        <div className="ascent__final">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="display">
            {hero.title[0]}<br /><em>{hero.title[1]}</em>
          </h1>
          <p className="lede">{hero.sub}</p>
          <a href="#register" className="btn btn--solid" onClick={(e) => { e.preventDefault(); scrollTo("#register"); }}>
            {hero.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
