"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { estate } from "@/content/site";
import { SplitReveal } from "@/components/motion/SplitReveal";

/** Pinned chapters: the image panel stays put while chapter I–IV text scrolls past and swaps it. */
export function Estate() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    {
      const items = ref.current!.querySelectorAll<HTMLElement>(".estate__chapter");
      items.forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (self) => self.isActive && setActive(i) });
      });
    }
  }, { scope: ref });

  return (
    <section id="estate" ref={ref} className="estate section" data-chapter>
      <p className="eyebrow">07 · The Estate</p>
      <SplitReveal as="h2" className="h2">Everything you need at 7,900 feet. <em>Nothing you don&apos;t.</em></SplitReveal>

      <div className="estate__layout">
        <div className="estate__sticky">
          <div className="estate__media">
            {estate.map((c, i) => (
              <div key={c.title} className={`estate__img ${i === active ? "is-active" : ""}`}>
                <Image src={c.img} alt={`${c.title} (placeholder)`} fill sizes="(min-width: 900px) 50vw, 100vw" />
              </div>
            ))}
            <span className="estate__numeral" aria-hidden="true">{estate[active].numeral}<small> / {estate[estate.length - 1].numeral}</small></span>
          </div>
        </div>
        <ol className="estate__list">
          {estate.map((c, i) => (
            <li key={c.title} className={`estate__chapter ${i === active ? "is-active" : ""}`}>
              <p className="mono">Chapter {c.numeral}</p>
              <h3 className="h3">{c.title}</h3>
              <p className="body">{c.body}</p>
              <ul className="estate__points">
                {c.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
