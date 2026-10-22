"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { createSequence } from "@/lib/frames";
import { hero, site } from "@/content/site";
import { RollingNumber } from "@/components/RollingNumber";

/**
 * Hero: the section is 4 screens tall and its content sticks to the screen.
 * Scrolling plays an image sequence on a <canvas> and rolls the altitude counter up.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const counter = useRef<{ set: (p: number) => void } | null>(null);
  const seq = useRef<ReturnType<typeof createSequence> | null>(null);

  // load the frames and keep the canvas sharp on resize
  useEffect(() => {
    const s = createSequence(canvas.current!, (i) => `/frames/${String(i + 1).padStart(3, "0")}.webp`, hero.frames);
    seq.current = s;
    s.resize();
    const onResize = () => s.resize();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); s.destroy(); };
  }, []);

  // tie everything to scroll position
  useGSAP(() => {
    if (prefersReducedMotion()) {
      seq.current?.set(1);
      counter.current?.set(1);
      gsap.set(".hero__title", { autoAlpha: 1 });
      gsap.set(".hero__meter", { autoAlpha: 0 });
      return;
    }
    gsap.set(".hero__title", { autoAlpha: 0, y: 40 });
    const state = { frames: 0, alt: 0 };
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 1 },
    })
      .to(state, { frames: 1, duration: 0.85, onUpdate: () => seq.current?.set(state.frames) }, 0)
      .to(state, { alt: 1, duration: 0.7, ease: "power1.inOut", onUpdate: () => counter.current?.set(state.alt) }, 0)
      .to(".hero__hint", { autoAlpha: 0, duration: 0.05 }, 0.02)
      .to(".hero__meter", { autoAlpha: 0, y: -60, duration: 0.12, ease: "power2.in" }, 0.72)
      .to(".hero__title", { autoAlpha: 1, y: 0, duration: 0.15, ease: "power3.out" }, 0.8)
      .to({}, { duration: 0.05 });
  }, { scope: section });

  return (
    <section id="top" ref={section} className="hero">
      <div className="hero__stage">
        <canvas ref={canvas} className="hero__canvas" aria-hidden="true" />
        <div className="hero__shade" aria-hidden="true" />

        <div className="hero__meter">
          <RollingNumber value={site.altitude} progressRef={counter} className="hero__alt" />
          <p className="label">feet · the mist line</p>
        </div>
        <p className="hero__hint label" aria-hidden="true">Scroll to climb</p>

        <div className="hero__title">
          <h1 className="h1">{hero.title}<br /><em>{hero.titleItalic}</em></h1>
          <p className="lede">{hero.sub}</p>
          <a href="#register" className="btn btn--solid" data-cursor="Register">Register interest</a>
        </div>
      </div>
    </section>
  );
}
