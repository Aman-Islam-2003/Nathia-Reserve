"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { residences } from "@/content/site";
import { SplitReveal } from "@/components/motion/SplitReveal";

/** Horizontal gallery inside the vertical page (desktop). Stacks vertically on phones. */
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
        scrollTrigger: {
          trigger: ref.current!.querySelector(".res__pin"),
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      gsap.utils.toArray<HTMLElement>(".res__card img").forEach((img) => {
        gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ref.current!.querySelector(".res__pin"), start: "top top", end: () => `+=${distance()}`, scrub: true } });
      });
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <section id="residences" ref={ref} className="res" data-chapter>
      <div className="res__pin">
        <div className="res__track">
          <div className="res__intro">
            <p className="eyebrow">05 · The Residences</p>
            <SplitReveal as="h2" className="h2">From studios <em>to penthouses.</em></SplitReveal>
            <p className="body">Five residence types across two wings. Every residence is run inside the hotel programme.</p>
            <p className="mono res__drag" aria-hidden="true">Keep scrolling →</p>
          </div>
          {residences.map((r, i) => (
            <article key={r.name} className="res__card" data-cursor="View">
              <div className="res__media">
                <Image src={r.img} alt={`${r.series} ${r.name} interior (placeholder)`} fill sizes="(min-width: 900px) 34vw, 100vw" />
                {r.price === "Sold out" && <span className="res__badge">Sold out</span>}
              </div>
              <div className="res__meta">
                <span className="mono">{String(i + 1).padStart(2, "0")} / {String(residences.length).padStart(2, "0")} · {r.series}</span>
                <h3 className="h3">{r.name}</h3>
                <dl className="res__specs">
                  <div><dt>Residences</dt><dd>{r.count}</dd></div>
                  <div><dt>Area · sq ft</dt><dd>{r.area}</dd></div>
                  <div><dt>Price</dt><dd>{r.price}</dd></div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
