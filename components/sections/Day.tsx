"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { day } from "@/content/site";

/** One view, four times of day: images crossfade as you scroll through a sticky stage. */
export function Day() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const imgs = gsap.utils.toArray<HTMLElement>(".day__img");
    const texts = gsap.utils.toArray<HTMLElement>(".day__text");
    const ticks = gsap.utils.toArray<HTMLElement>(".day__tick");
    gsap.set(imgs.slice(1), { autoAlpha: 0 });
    gsap.set(texts.slice(1), { autoAlpha: 0, y: 30 });
    const n = imgs.length;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.5,
        onUpdate: (self) => {
          const active = Math.min(n - 1, Math.floor(self.progress * n));
          ticks.forEach((t, k) => t.classList.toggle("is-active", k === active));
        },
      },
    });
    for (let i = 1; i < n; i++) {
      tl.to(imgs[i], { autoAlpha: 1, duration: 1, ease: "none" }, i - 0.5)
        .to(texts[i - 1], { autoAlpha: 0, y: -30, duration: 0.4 }, i - 0.5)
        .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.4 }, i - 0.1);
    }
    tl.to({}, { duration: 0.5 });
  }, { scope: ref });

  return (
    <section id="day" ref={ref} className="day" data-chapter style={{ height: `${day.length * 100}vh` }}>
      <div className="day__stage">
        {day.map((d, i) => (
          <div key={d.time} className="day__img">
            <Image src={d.img} alt={`The ridge at ${d.time} (placeholder)`} fill sizes="100vw" priority={i === 0} />
          </div>
        ))}
        <div className="day__shade" aria-hidden="true" />
        <div className="day__content">
          <p className="eyebrow">04 · One day at the Reserve</p>
          <div className="day__texts">
            {day.map((d) => (
              <div key={d.time} className="day__text">
                <p className="day__time mono">{d.time}</p>
                <h2 className="h2">{d.title}</h2>
                <p className="lede">{d.line}</p>
              </div>
            ))}
          </div>
          <ol className="day__ticks">
            {day.map((d, i) => (
              <li key={d.time} className={`day__tick ${i === 0 ? "is-active" : ""}`}>
                <span className="mono">{d.time}</span> {d.title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
