import { manifesto } from "@/content/site";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { ClipReveal } from "@/components/motion/ClipReveal";

export function Manifesto() {
  return (
    <section id="manifesto" className="manifesto section" data-chapter>
      <p className="eyebrow">02 · {manifesto.eyebrow}</p>
      <SplitReveal as="h2" className="h2">
        {manifesto.lines.map((l, i) => (
          <span key={i} className="block">{i === manifesto.lines.length - 1 ? <em>{l}</em> : l}</span>
        ))}
      </SplitReveal>
      <div className="manifesto__row">
        <ClipReveal src="/img/manifesto.webp" alt="Stone terrace café on a misty morning (placeholder)" className="manifesto__img" sizes="(min-width: 768px) 40vw, 100vw" />
        <SplitReveal as="p" className="lede manifesto__body" by="words">{manifesto.body}</SplitReveal>
      </div>
    </section>
  );
}
