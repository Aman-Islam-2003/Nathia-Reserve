import Image from "next/image";
import { about } from "@/content/site";
import { SplitReveal } from "@/components/SplitReveal";

export function About() {
  return (
    <section className="section about">
      <p className="label">01 · The idea</p>
      <SplitReveal as="h2" className="h2">
        {about.title.map((line, i) => (
          <span key={i} style={{ display: "block" }}>{i === about.title.length - 1 ? <em>{line}</em> : line}</span>
        ))}
      </SplitReveal>
      <div className="about__row">
        <div className="about__img">
          <Image src="/img/about.webp" alt="Misty ridge at dawn (placeholder)" fill sizes="(min-width: 900px) 40vw, 100vw" />
        </div>
        <p className="lede">{about.body}</p>
      </div>
    </section>
  );
}
