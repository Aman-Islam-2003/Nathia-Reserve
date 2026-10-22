"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { residences } from "@/content/site";

/** Cards slide sideways while you scroll down (desktop). On phones they simply stack. */
export function Residences() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const track = ref.current!.querySelector<HTMLElement>(".res__track")!;
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <section ref={ref} className="res">
      <div className="res__track">
        <div className="res__intro">
          <p className="label">03 · Residences</p>
          <h2 className="h2">Studios <em>to penthouses.</em></h2>
        </div>
        {residences.map((r) => (
          <article key={r.name} className="res__card" data-cursor="View">
            <div className="res__img">
              <Image src={r.img} alt={`${r.name} interior (placeholder)`} fill sizes="(min-width: 900px) 30vw, 100vw" />
            </div>
            <h3 className="h3">{r.name}</h3>
            <p className="label">{r.size} · {r.price}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
